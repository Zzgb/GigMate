/**
 * mock-data.ts
 * Mock 数据（已废弃 - 原前端 mock 数据，现已全部迁移到数据库）
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

export interface MockTask {
  id: string;
  title: string;
  category: string;
  location: string;
  time: string;
  shortDesc: string;
  tags: string[];
  price: string;
  description: string;
  requirements: string[];
  employerName: string;
  employerRating: number;
  createdAt: string;
  reviews: { user: string; rating: number; text: string; date: string; task: string }[];
}

export const allTasks: MockTask[] = [
  {
    id: "1",
    title: "UI 设计稿更新",
    category: "设计",
    location: "线上",
    time: "3天前",
    shortDesc: "需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计，预计 2 周内完成",
    tags: ["Figma", "UI/UX"],
    price: "¥200-500",
    description: "需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计：首页、产品列表页和个人中心页。要求使用 Figma 进行设计，并提供完整的组件库和设计规范文档。预计工作周期 2 周，可远程协作。",
    requirements: ["2 年以上 UI/UX 设计经验", "熟练使用 Figma 和设计系统搭建", "有移动端和 Web 端设计经验", "投递请附作品集链接"],
    employerName: "科技公司A",
    employerRating: 4.5,
    createdAt: "2026-05-19",
    reviews: [
      { user: "王**", rating: 5, text: "沟通顺畅，结款及时，非常好的合作经历", date: "2 个月前", task: "数据录入任务" },
      { user: "李**", rating: 4, text: "需求明确，验收标准清晰，推荐合作", date: "1 个月前", task: "文案翻译任务" },
    ],
  },
  {
    id: "2",
    title: "文案翻译 (中→英)",
    category: "翻译",
    location: "线上",
    time: "1周前",
    shortDesc: "5000 字产品文档中译英，需要技术文档翻译经验，可长期合作",
    tags: ["翻译", "英文"],
    price: "¥50-100",
    description: "5000 字产品文档中译英，内容涉及 API 接口文档和 SDK 接入说明。需要技术文档翻译经验，熟悉技术术语。可长期合作，按字数计费。",
    requirements: ["英语专业八级或同等水平", "有技术文档翻译经验", "熟悉 API / SDK 相关术语", "提供翻译样本"],
    employerName: "科技公司A",
    employerRating: 4.5,
    createdAt: "2026-05-15",
    reviews: [
      { user: "张*", rating: 5, text: "翻译准确，交付及时", date: "3 周前", task: "产品文案翻译" },
    ],
  },
  {
    id: "3",
    title: "活动摄影跟拍",
    category: "摄影",
    location: "深圳",
    time: "2天前",
    shortDesc: "周六下午公司年会跟拍，需要自带设备，约 3 小时",
    tags: ["摄影", "线下"],
    price: "¥300-500",
    description: "周六下午公司年会跟拍，需要自带专业摄影设备，拍摄内容包含舞台表演、颁奖环节和团队合影。约 3 小时，提供精修照片 50 张以上。",
    requirements: ["自备全画幅相机", "有活动跟拍经验", "自带闪光灯等附件", "一周内交付精修照片"],
    employerName: "传媒公司B",
    employerRating: 4.0,
    createdAt: "2026-05-20",
    reviews: [],
  },
  {
    id: "4",
    title: "周末咖啡师",
    category: "服务",
    location: "北京朝阳",
    time: "1天前",
    shortDesc: "周末兼职咖啡师，有经验者优先，每周六日 10:00-18:00",
    tags: ["咖啡", "线下"],
    price: "¥150/天",
    description: "周末兼职咖啡师，负责咖啡制作、收银和门店卫生。有精品咖啡店经验者优先，每周六日 10:00-18:00。提供员工餐。",
    requirements: ["有咖啡师经验", "熟悉意式咖啡和手冲", "有健康证", "每周六日可固定出勤"],
    employerName: "精品咖啡店",
    employerRating: 4.2,
    createdAt: "2026-05-21",
    reviews: [],
  },
  {
    id: "5",
    title: "Python 数据清洗",
    category: "技术",
    location: "线上",
    time: "5天前",
    shortDesc: "清洗 10 万条销售数据，需熟悉 pandas，预计 3 天完成",
    tags: ["Python", "数据分析"],
    price: "¥500-800",
    description: "清洗 10 万条电商销售数据，包含数据去重、缺失值处理、异常值检测和格式统一化。需使用 Python pandas 进行处理，输出清洗后的 CSV 文件和数据处理报告。预计 3 天完成。",
    requirements: ["熟悉 Python pandas / numpy", "有数据清洗经验", "了解电商数据格式", "提交数据处理脚本"],
    employerName: "电商公司C",
    employerRating: 4.8,
    createdAt: "2026-05-17",
    reviews: [
      { user: "刘**", rating: 5, text: "专业高效，代码规范", date: "2 周前", task: "销售数据分析" },
    ],
  },
  {
    id: "6",
    title: "产品包装设计",
    category: "设计",
    location: "线上",
    time: "1天前",
    shortDesc: "新款零食产品包装设计，提供品牌 VI 和产品信息，需提交 3 个方案",
    tags: ["包装设计", "品牌"],
    price: "¥800-1200",
    description: "新款健康零食产品包装设计，提供品牌 VI 手册和产品详情信息。需要设计主包装和 3 种规格的衍生包装，提交 3 个不同风格的设计方案。",
    requirements: ["3 年以上平面/包装设计经验", "熟悉印刷工艺", "提供过往包装设计案例", "可提供打样文件"],
    employerName: "零食品牌D",
    employerRating: 4.3,
    createdAt: "2026-05-21",
    reviews: [],
  },
];
