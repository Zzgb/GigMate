"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LandingHero() {
 const router = useRouter();
 const { isLoggedIn, role, switchRole } = useAuth();

 const handleEmployer = () => {
  if (!isLoggedIn) {
   router.push("/login?role=employer");
  } else {
   if (role !== "employer") switchRole();
   router.push("/dashboard");
  }
 };

 const handleFreelancer = () => {
  if (!isLoggedIn) {
   router.push("/login?role=freelancer");
  } else {
   if (role !== "freelancer") switchRole();
   router.push("/dashboard");
  }
 };

 return (
  <section className="relative text-center py-20 px-10 bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] min-h-[420px] flex flex-col items-center justify-center">
   <h2 className="text-[2.8rem] font-bold tracking-tight leading-tight text-white mb-4">
    兼职就该这么简单
   </h2>
   <p className="text-lg text-white/75 max-w-[480px] mx-auto mb-8 leading-relaxed">
    雇主发布任务，自由职业者接单<br />安全快捷，双向评价
   </p>
   <div className="flex gap-3 justify-center">
    <button
     onClick={handleEmployer}
     className="bg-[var(--g-card)] text-[var(--g-text)] px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
     type="button"
    >
     我要雇佣
    </button>
    <button
     onClick={handleFreelancer}
     className="bg-white/15 text-white px-6 py-2.5 rounded-xl text-sm font-medium border border-white/25 backdrop-blur-sm cursor-pointer"
     type="button"
    >
     找工作
    </button>
   </div>
   <div className="flex gap-1.5 justify-center mt-10">
    <span className="w-6 h-1 bg-[var(--g-card)] rounded-full" />
    <span className="w-2 h-1 bg-white/40 rounded-full" />
    <span className="w-2 h-1 bg-white/40 rounded-full" />
   </div>
  </section>
 );
}
