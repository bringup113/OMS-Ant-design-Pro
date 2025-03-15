import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { parse } from 'url';

// 定义客户数据类型
interface CustomerListItem {
  key: number;
  id: string;
  name: string;
  passportNo: string;
  gender: 'male' | 'female';
  country: string;
  birthDate: string;
  issueDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

// 国家列表
const countries = [
  'china', 'usa', 'uk', 'japan', 'korea', 'france', 
  'germany', 'italy', 'russia', 'canada', 'australia', 'newZealand'
];

// 随机姓名
const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '郑', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英'];

// 生成随机姓名
const generateName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName}${lastName}`;
};

// 生成随机字符串
const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 生成随机日期
const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 生成模拟数据
const genList = (current: number, pageSize: number) => {
  const customerListDataSource: CustomerListItem[] = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    // 生成随机日期
    const now = new Date();
    const birthDate = dayjs(generateRandomDate(new Date(now.getFullYear() - 65, 0, 1), new Date(now.getFullYear() - 18, 0, 1))).format('YYYY-MM-DD');
    const issueDate = dayjs(generateRandomDate(new Date(now.getFullYear() - 5, 0, 1), now)).format('YYYY-MM-DD');
    const expiryDate = dayjs(generateRandomDate(now, new Date(now.getFullYear() + 10, 0, 1))).format('YYYY-MM-DD');
    
    customerListDataSource.push({
      key: index,
      id: `customer-${index}`,
      name: generateName(),
      passportNo: `P${generateRandomString(8)}`,
      gender,
      country,
      birthDate,
      issueDate,
      expiryDate,
      createdAt: dayjs().subtract(Math.floor(Math.random() * 100), 'day').format('YYYY-MM-DD'),
      updatedAt: dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD'),
    });
  }
  customerListDataSource.reverse();
  return customerListDataSource;
};

let customerListDataSource = genList(1, 100);

function getCustomers(req: Request, res: Response, u: string) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as {
    current: number;
    pageSize: number;
    name?: string;
    passportNo?: string;
    gender?: string;
    country?: string;
    sorter?: string;
    filter?: string;
  };

  let dataSource = [...customerListDataSource].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
  
  if (params.sorter) {
    const sorter = JSON.parse(params.sorter);
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      Object.keys(sorter).forEach((key) => {
        let nextSort = next[key as keyof CustomerListItem] as string;
        let preSort = prev[key as keyof CustomerListItem] as string;
        if (sorter[key] === 'descend') {
          if (preSort > nextSort) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (preSort > nextSort) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }
  
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return Object.keys(filter).some((key) => {
          if (!filter[key]) {
            return true;
          }
          if (filter[key].includes(`${item[key as keyof CustomerListItem]}`)) {
            return true;
          }
          return false;
        });
      });
    }
  }

  // 按名称搜索
  if (params.name) {
    dataSource = dataSource.filter((data) => data.name.includes(params.name || ''));
  }
  
  // 按护照号码搜索
  if (params.passportNo) {
    dataSource = dataSource.filter((data) => data.passportNo.includes(params.passportNo || ''));
  }
  
  // 按性别筛选
  if (params.gender) {
    dataSource = dataSource.filter((data) => data.gender === params.gender);
  }
  
  // 按国家筛选
  if (params.country) {
    dataSource = dataSource.filter((data) => data.country === params.country);
  }

  const result = {
    data: dataSource,
    total: customerListDataSource.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  };

  return res.json(result);
}

function postCustomer(req: Request, res: Response, u: string, b: Request) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const body = (b && b.body) || req.body;
  const { method, id, ...rest } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      customerListDataSource = customerListDataSource.filter((item) => id.indexOf(item.id) === -1);
      break;
    case 'post':
      (() => {
        const newCustomer: CustomerListItem = {
          key: customerListDataSource.length,
          id: `customer-${customerListDataSource.length}`,
          createdAt: dayjs().format('YYYY-MM-DD'),
          updatedAt: dayjs().format('YYYY-MM-DD'),
          ...rest,
        };
        customerListDataSource.unshift(newCustomer);
        return res.json(newCustomer);
      })();
      return;

    case 'update':
      (() => {
        let newCustomer = {};
        customerListDataSource = customerListDataSource.map((item) => {
          if (item.id === id) {
            newCustomer = { ...item, ...rest };
            return { ...item, ...rest };
          }
          return item;
        });
        return res.json(newCustomer);
      })();
      return;
    default:
      break;
  }

  const result = {
    list: customerListDataSource,
    pagination: {
      total: customerListDataSource.length,
    },
  };

  res.json(result);
}

export default {
  'GET /api/customers': getCustomers,
  'POST /api/customers': postCustomer,
}; 