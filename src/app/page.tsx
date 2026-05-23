/**
 * page.tsx
 * 首页落地页 - 显示导航栏、Hero 区域、功能介绍卡片和页脚
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import Nav from "@/components/Nav";
import LandingHero from "@/components/LandingHero";
import FeatureCards from "@/components/FeatureCards";
import FooterSection from "@/components/FooterSection";

export default function Home() {
 return (
  <div className="flex flex-col flex-1">
   <Nav variant="landing" />
   <LandingHero />
   <FeatureCards />
   <FooterSection />
  </div>
 );
}
