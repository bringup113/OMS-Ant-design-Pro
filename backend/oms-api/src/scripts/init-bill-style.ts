import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ElementType, SectionType, AlignType } from '../bill-style/dto/create-bill-style-element.dto';
import { PaperType } from '../bill-style/dto/create-bill-style-template.dto';
import axios from 'axios';

async function bootstrap() {
  console.log('开始创建默认账单样式模板...');

  try {
    // 定义默认模板数据
    const defaultTemplate = {
      name: '默认账单样式',
      isDefault: true,
      paperType: PaperType.A4,
      headerElements: [
        {
          elementId: 'header-1',
          type: ElementType.TEXT,
          content: '天成旅行社',
          align: AlignType.CENTER,
          isBold: true,
          isTitle: true,
          fontSize: 16,
          section: SectionType.HEADER,
        },
        {
          elementId: 'header-2',
          type: ElementType.TEXT,
          content: '账单日期: {date}',
          align: AlignType.RIGHT,
          fontSize: 12,
          section: SectionType.HEADER,
        }
      ],
      bodyElements: [
        {
          elementId: 'body-1',
          type: ElementType.TEXT,
          content: '订单明细',
          align: AlignType.CENTER,
          isBold: true,
          fontSize: 14,
          section: SectionType.BODY,
        },
        {
          elementId: 'body-2',
          type: ElementType.ORDER_ITEM,
          section: SectionType.BODY,
        }
      ],
      footerElements: [
        {
          elementId: 'footer-1',
          type: ElementType.TEXT,
          content: '感谢您的惠顾',
          align: AlignType.CENTER,
          fontSize: 12,
          section: SectionType.FOOTER,
        }
      ]
    };

    // 直接使用API请求创建模板
    const response = await axios.post('http://localhost:3000/api/bill-style', defaultTemplate, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('默认账单样式模板创建成功:', response.data);
  } catch (error) {
    console.error('创建默认账单样式模板失败:', error.response?.data || error.message);
  }
}

bootstrap(); 