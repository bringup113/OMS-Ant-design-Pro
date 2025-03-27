import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { BillStyleTemplate } from './entities/bill-style-template.entity';
import { BillStyleElement } from './entities/bill-style-element.entity';
import { CreateBillStyleTemplateDto } from './dto/create-bill-style-template.dto';
import { UpdateBillStyleTemplateDto } from './dto/update-bill-style-template.dto';
import { SectionType } from './dto/create-bill-style-element.dto';

@Injectable()
export class BillStyleService {
  constructor(
    @InjectRepository(BillStyleTemplate)
    private billStyleTemplateRepository: Repository<BillStyleTemplate>,
    @InjectRepository(BillStyleElement)
    private billStyleElementRepository: Repository<BillStyleElement>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<BillStyleTemplate[]> {
    return this.billStyleTemplateRepository.find();
  }

  async findOne(id: number): Promise<any> {
    const template = await this.billStyleTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`账单样式模板 #${id} 不存在`);
    }

    const elements = await this.billStyleElementRepository.find({
      where: { templateId: id },
      order: { sortOrder: 'ASC' },
    });

    // 根据section分组元素
    const headerElements = elements.filter(el => el.section === SectionType.HEADER);
    const bodyElements = elements.filter(el => el.section === SectionType.BODY);
    const footerElements = elements.filter(el => el.section === SectionType.FOOTER);

    // 返回完整的模板数据
    return {
      ...template,
      elements,
      headerElements,
      bodyElements,
      footerElements,
    };
  }

  async create(createDto: CreateBillStyleTemplateDto, userId: number): Promise<BillStyleTemplate> {
    // 使用事务来确保数据完整性
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 如果设置为默认模板，需要清除其他默认模板标记
      if (createDto.isDefault) {
        await manager.update(BillStyleTemplate, { isDefault: true }, { isDefault: false });
      }

      // 创建模板
      const template = manager.create(BillStyleTemplate, {
        name: createDto.name,
        isDefault: createDto.isDefault || false,
        paperType: createDto.paperType || 'a4',
        createdBy: userId,
      });

      // 保存模板
      const savedTemplate = await manager.save(template);

      // 处理元素
      const allElements: any[] = [];

      // 处理headerElements
      if (createDto.headerElements && Array.isArray(createDto.headerElements)) {
        for (let index = 0; index < createDto.headerElements.length; index++) {
          const el = createDto.headerElements[index];
          allElements.push({
            ...el,
            section: SectionType.HEADER,
            sortOrder: index,
            templateId: savedTemplate.id,
          });
        }
      }

      // 处理bodyElements
      if (createDto.bodyElements && Array.isArray(createDto.bodyElements)) {
        for (let index = 0; index < createDto.bodyElements.length; index++) {
          const el = createDto.bodyElements[index];
          allElements.push({
            ...el,
            section: SectionType.BODY,
            sortOrder: index,
            templateId: savedTemplate.id,
          });
        }
      }

      // 处理footerElements
      if (createDto.footerElements && Array.isArray(createDto.footerElements)) {
        for (let index = 0; index < createDto.footerElements.length; index++) {
          const el = createDto.footerElements[index];
          allElements.push({
            ...el,
            section: SectionType.FOOTER,
            sortOrder: index,
            templateId: savedTemplate.id,
          });
        }
      }

      // 创建并保存元素
      if (allElements.length > 0) {
        const elementEntities = manager.create(BillStyleElement, allElements);
        await manager.save(elementEntities);
      }

      // 查询并返回所有元素
      const elements = await manager.find(BillStyleElement, {
        where: { templateId: savedTemplate.id },
        order: { sortOrder: 'ASC' },
      });

      // 根据section分组元素
      const headerElements = elements.filter(el => el.section === SectionType.HEADER);
      const bodyElements = elements.filter(el => el.section === SectionType.BODY);
      const footerElements = elements.filter(el => el.section === SectionType.FOOTER);

      // 返回完整的模板数据，不调用findOne方法
      return {
        ...savedTemplate,
        elements,
        headerElements,
        bodyElements,
        footerElements,
      } as any;
    });
  }

  async update(id: number, updateDto: UpdateBillStyleTemplateDto, userId: number): Promise<BillStyleTemplate> {
    // 检查模板是否存在
    const template = await this.billStyleTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`账单样式模板 #${id} 不存在`);
    }

    // 使用事务来确保数据完整性
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // 如果设置为默认模板，需要清除其他默认模板标记
      if (updateDto.isDefault) {
        await manager.update(BillStyleTemplate, { isDefault: true }, { isDefault: false });
      }

      // 更新模板基本信息
      if (updateDto.name) template.name = updateDto.name;
      if (updateDto.isDefault !== undefined) template.isDefault = updateDto.isDefault;
      if (updateDto.paperType) template.paperType = updateDto.paperType;

      // 保存更新后的模板
      const updatedTemplate = await manager.save(template);

      // 如果提供了元素数据，先删除所有旧元素，再创建新元素
      if (updateDto.headerElements || updateDto.bodyElements || updateDto.footerElements) {
        // 删除所有旧元素
        await manager.delete(BillStyleElement, { templateId: id });

        // 准备新元素数据
        const allElements: any[] = [];

        // 处理headerElements
        if (updateDto.headerElements && Array.isArray(updateDto.headerElements)) {
          for (let index = 0; index < updateDto.headerElements.length; index++) {
            const el = updateDto.headerElements[index];
            allElements.push({
              ...el,
              section: SectionType.HEADER,
              sortOrder: index,
              templateId: id,
            });
          }
        }

        // 处理bodyElements
        if (updateDto.bodyElements && Array.isArray(updateDto.bodyElements)) {
          for (let index = 0; index < updateDto.bodyElements.length; index++) {
            const el = updateDto.bodyElements[index];
            allElements.push({
              ...el,
              section: SectionType.BODY,
              sortOrder: index,
              templateId: id,
            });
          }
        }

        // 处理footerElements
        if (updateDto.footerElements && Array.isArray(updateDto.footerElements)) {
          for (let index = 0; index < updateDto.footerElements.length; index++) {
            const el = updateDto.footerElements[index];
            allElements.push({
              ...el,
              section: SectionType.FOOTER,
              sortOrder: index,
              templateId: id,
            });
          }
        }

        // 创建并保存新元素
        if (allElements.length > 0) {
          const elementEntities = manager.create(BillStyleElement, allElements);
          await manager.save(elementEntities);
        }
      }

      // 查询并返回所有元素
      const elements = await manager.find(BillStyleElement, {
        where: { templateId: id },
        order: { sortOrder: 'ASC' },
      });

      // 根据section分组元素
      const headerElements = elements.filter(el => el.section === SectionType.HEADER);
      const bodyElements = elements.filter(el => el.section === SectionType.BODY);
      const footerElements = elements.filter(el => el.section === SectionType.FOOTER);

      // 返回完整的模板数据，不调用findOne方法
      return {
        ...updatedTemplate,
        elements,
        headerElements,
        bodyElements,
        footerElements,
      } as any;
    });
  }

  async remove(id: number): Promise<void> {
    const template = await this.billStyleTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`账单样式模板 #${id} 不存在`);
    }

    if (template.isDefault) {
      throw new ConflictException('不能删除默认账单样式模板');
    }

    // 删除模板会级联删除元素（通过外键约束）
    await this.billStyleTemplateRepository.remove(template);
  }

  async setDefault(id: number): Promise<BillStyleTemplate> {
    const template = await this.billStyleTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`账单样式模板 #${id} 不存在`);
    }

    // 使用事务确保数据一致性
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // 清除其他默认模板标记
      await manager.update(BillStyleTemplate, { isDefault: true }, { isDefault: false });
      
      // 设置当前模板为默认
      template.isDefault = true;
      await manager.save(template);
    });

    return this.findOne(id);
  }
} 