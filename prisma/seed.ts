import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  // 5 users
  const zhangSan = await prisma.user.create({
    data: { email: "employer@test.com", name: "张三", passwordHash: hash, roles: ["EMPLOYER", "FREELANCER"] },
  });
  const liSi = await prisma.user.create({
    data: { email: "employer2@test.com", name: "李四", passwordHash: hash, roles: ["EMPLOYER"] },
  });
  const liMing = await prisma.user.create({
    data: { email: "freelancer@test.com", name: "李明", passwordHash: hash, roles: ["FREELANCER"] },
  });
  const wangXiaohong = await prisma.user.create({
    data: { email: "freelancer2@test.com", name: "王小红", passwordHash: hash, roles: ["FREELANCER"] },
  });
  const zhaoLiu = await prisma.user.create({
    data: { email: "freelancer3@test.com", name: "赵六", passwordHash: hash, roles: ["FREELANCER"] },
  });

  // 8 tasks — 3 OPEN, 3 IN_PROGRESS, 2 COMPLETED
  await prisma.task.create({
    data: {
      title: "文案翻译 (中→英)",
      description:
        "5000 字产品文档中译英，内容涉及 API 接口文档和 SDK 接入说明。需要技术文档翻译经验，熟悉技术术语。可长期合作，按字数计费。",
      budget: 1500,
      deadline: new Date("2026-06-15"),
      status: "OPEN",
      category: "翻译",
      skills: ["翻译", "英文"],
      employerId: zhangSan.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "周末咖啡师",
      description:
        "周末兼职咖啡师，负责咖啡制作、收银和门店卫生。有精品咖啡店经验者优先，每周六日 10:00-18:00。提供员工餐。",
      budget: 150,
      deadline: new Date("2026-06-30"),
      status: "OPEN",
      category: "服务",
      skills: ["咖啡", "线下"],
      employerId: liSi.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "产品包装设计",
      description:
        "新款健康零食产品包装设计，提供品牌 VI 手册和产品详情信息。需要设计主包装和 3 种规格的衍生包装，提交 3 个不同风格的设计方案。",
      budget: 1200,
      deadline: new Date("2026-06-15"),
      status: "OPEN",
      category: "设计",
      skills: ["包装设计", "品牌"],
      employerId: liSi.id,
    },
  });

  const uiTask = await prisma.task.create({
    data: {
      title: "UI 设计稿更新",
      description:
        "需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计：首页、产品列表页和个人中心页。要求使用 Figma 进行设计，并提供完整的组件库和设计规范文档。",
      budget: 3000,
      deadline: new Date("2026-06-05"),
      status: "IN_PROGRESS",
      category: "设计",
      skills: ["Figma", "UI/UX"],
      employerId: zhangSan.id,
      applications: {
        create: [
          { message: "我有 3 年 UI 设计经验，熟练使用 Figma，参与过多个产品的设计系统搭建。", status: "ACCEPTED", freelancerId: liMing.id },
          { message: "资深 UI/UX 设计师，曾为多家互联网公司提供设计服务。", status: "PENDING", freelancerId: wangXiaohong.id },
        ],
      },
    },
  });
  await prisma.task.create({
    data: {
      title: "活动摄影跟拍",
      description:
        "周六下午公司年会跟拍，需要自带专业摄影设备，拍摄内容包含舞台表演、颁奖环节和团队合影。约 3 小时，提供精修照片 50 张以上。",
      budget: 500,
      deadline: new Date("2026-05-24"),
      status: "IN_PROGRESS",
      category: "摄影",
      skills: ["摄影", "线下"],
      employerId: liSi.id,
      applications: {
        create: [{ message: "我有 5 年摄影经验，自备全画幅相机和灯光设备。", status: "ACCEPTED", freelancerId: zhaoLiu.id }],
      },
    },
  });
  await prisma.task.create({
    data: {
      title: "Python 数据清洗",
      description:
        "清洗 10 万条电商销售数据，包含数据去重、缺失值处理、异常值检测和格式统一化。需使用 Python pandas 进行处理，输出清洗后的 CSV 文件和数据处理报告。",
      budget: 800,
      deadline: new Date("2026-06-01"),
      status: "IN_PROGRESS",
      category: "技术",
      skills: ["Python", "数据分析"],
      employerId: zhangSan.id,
      applications: {
        create: [{ message: "熟悉 pandas/numpy，有电商数据清洗经验。", status: "ACCEPTED", freelancerId: wangXiaohong.id }],
      },
    },
  });

  const logoTask = await prisma.task.create({
    data: {
      title: "Logo 设计",
      description: "为公司设计品牌 Logo，需要简洁现代风格，提供 3 个初稿方案。",
      budget: 2000,
      deadline: new Date("2026-05-10"),
      status: "COMPLETED",
      category: "设计",
      skills: ["Logo", "品牌"],
      employerId: zhangSan.id,
      applications: {
        create: [{ message: "擅长品牌设计，有多个 Logo 设计案例。", status: "ACCEPTED", freelancerId: liMing.id }],
      },
    },
  });
  const transTask = await prisma.task.create({
    data: {
      title: "文案翻译 (英→中)",
      description: "翻译英文产品文档和营销材料，约 3000 字。",
      budget: 1000,
      deadline: new Date("2026-05-08"),
      status: "COMPLETED",
      category: "翻译",
      skills: ["翻译", "英文"],
      employerId: liSi.id,
      applications: {
        create: [{ message: "5 年翻译经验，英语专业八级，擅长技术文档翻译。", status: "ACCEPTED", freelancerId: wangXiaohong.id }],
      },
    },
  });

  // Reviews for completed tasks
  const logoApp = await prisma.application.findFirstOrThrow({ where: { taskId: logoTask.id, status: "ACCEPTED" } });
  const transApp = await prisma.application.findFirstOrThrow({ where: { taskId: transTask.id, status: "ACCEPTED" } });

  await prisma.review.createMany({
    data: [
      { rating: 5, comment: "设计精美，交付及时，非常满意！", taskId: logoTask.id, reviewerId: zhangSan.id, revieweeId: liMing.id },
      { rating: 5, comment: "雇主需求明确，沟通顺畅，结款及时", taskId: logoTask.id, reviewerId: liMing.id, revieweeId: zhangSan.id },
      { rating: 4, comment: "翻译质量高，准时交付，沟通顺畅", taskId: transTask.id, reviewerId: liSi.id, revieweeId: wangXiaohong.id },
      { rating: 4, comment: "合作愉快，付款及时", taskId: transTask.id, reviewerId: wangXiaohong.id, revieweeId: liSi.id },
    ],
  });

  console.log("✅ Seed data created successfully");
  console.log(`   Users: 5`);
  console.log(`   Tasks: 8 (3 OPEN, 3 IN_PROGRESS, 2 COMPLETED)`);
  console.log(`   Applications: ${await prisma.application.count()}`);
  console.log(`   Reviews: ${await prisma.review.count()}`);
  console.log(`\n   Test accounts:`);
  console.log(`   employer@test.com / password123 (张三 — 双角色)`);
  console.log(`   freelancer@test.com / password123 (李明 — 自由职业者)`);
  console.log(`   freelancer2@test.com / password123 (王小红 — 自由职业者)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
