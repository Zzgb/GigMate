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
