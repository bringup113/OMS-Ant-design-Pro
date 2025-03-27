import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BillStyleService } from '../bill-style/bill-style.service';
import { ElementType, SectionType, AlignType } from '../bill-style/dto/create-bill-style-element.dto';
import { PaperType } from '../bill-style/dto/create-bill-style-template.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const billStyleService = app.get(BillStyleService);

  try {
    console.log('开始创建默认账单样式模板...');

    const defaultTemplate = {
      name: '默认账单样式',
      isDefault: true,
      paperType: PaperType.A4,
      headerElements: [
        {
          elementId: `header-1`,
          type: ElementType.TEXT,
          content: '天成旅行社',
          align: AlignType.CENTER,
          isBold: true,
          isTitle: true,
          fontSize: 16,
          section: SectionType.HEADER,
          sortOrder: 0,
        },
        {
          elementId: `header-2`,
          type: ElementType.TEXT,
          content: '账单日期: {date}',
          align: AlignType.RIGHT,
          fontSize: 12,
          section: SectionType.HEADER,
          sortOrder: 1,
        },
        {
          elementId: `header-3`,
          type: ElementType.TEXT,
          content: '代理名称: {agentName}',
          align: AlignType.RIGHT,
          fontSize: 12,
          section: SectionType.HEADER,
          sortOrder: 2,
        },
        {
          elementId: `header-4`,
          type: ElementType.LINE,
          section: SectionType.HEADER,
          sortOrder: 3,
        },
      ],
      bodyElements: [
        {
          elementId: `body-1`,
          type: ElementType.TEXT,
          content: '订单明细',
          align: AlignType.CENTER,
          isBold: true,
          fontSize: 14,
          section: SectionType.BODY,
          sortOrder: 0,
        },
        {
          elementId: `body-2`,
          type: ElementType.ORDER_ITEM,
          section: SectionType.BODY,
          sortOrder: 1,
        },
        {
          elementId: `body-3`,
          type: ElementType.REMARK,
          content: '如有疑问请联系客服',
          section: SectionType.BODY,
          sortOrder: 2,
        },
        {
          elementId: `body-4`,
          type: ElementType.TOTAL,
          section: SectionType.BODY,
          sortOrder: 3,
        },
        {
          elementId: `body-5`,
          type: ElementType.LINE,
          section: SectionType.BODY,
          sortOrder: 4,
        },
      ],
      footerElements: [
        {
          elementId: `footer-1`,
          type: ElementType.TEXT,
          content: '感谢您的惠顾',
          align: AlignType.CENTER,
          fontSize: 12,
          section: SectionType.FOOTER,
          sortOrder: 0,
        },
      ],
    };

    const createdTemplate = await billStyleService.create(defaultTemplate, 1); // 1 是系统管理员ID
    console.log('默认账单样式模板创建成功:', createdTemplate.id);
  } catch (error) {
    console.error('创建默认账单样式模板失败:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 