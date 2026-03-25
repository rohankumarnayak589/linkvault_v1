"use client";

import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, CheckCircle2, Shield, Zap, Globe, 
  Smartphone, Mail, MessageSquare, Star
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { applyTheme, getSavedTheme } from "@/lib/icon-mapper";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const saved = getSavedTheme("linkvault-landing-theme");
    applyTheme(saved, "linkvault-landing-theme");
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary scroll-smooth">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 text-xs font-bold text-primary mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            LinkVault v1.0 is now live!
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            Your digital vault <br />
            <span className="text-muted-foreground/40">for everything </span> 
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">awesome.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Collect, organize, and secure your bookmarks with lightning speed. 
            The modern way to manage your web discoverability.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-in">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold bg-primary hover:scale-[1.02] transition-transform shadow-2xl shadow-primary/30">
                Get Started for Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="secondary" className="h-14 px-10 rounded-2xl text-lg font-bold">
                See Features
              </Button>
            </Link>
          </motion.div>

          {/* Floater Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-20 relative max-w-5xl mx-auto rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-3xl p-4 shadow-2xl shadow-primary/10 overflow-hidden group"
          >
             <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
             <div className="bg-background rounded-[24px] border border-border/40 aspect-video md:aspect-[3/1] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-8 opacity-20">
                   {[...Array(24)].map((_, i) => (
                      <div key={i} className="bg-muted rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                   ))}
                </div>
                <div className="z-20 flex flex-col items-center gap-4">
                   <div className="h-16 w-16 md:h-24 md:w-24 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <Zap className="h-8 w-8 md:h-12 md:w-12 fill-primary/20" />
                   </div>
                   <span className="text-lg md:text-2xl font-black tracking-tighter opacity-50">DASHBOARD PREVIEW</span>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Built for speed. <br /><span className="text-muted-foreground/30">Designed for you.</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Everything you need to manage your personal web library in one place.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Bento Card 1: Cloud Sync */}
            <motion.div variants={fadeInUp} className="md:col-span-2 relative h-[380px] p-8 rounded-[36px] bg-secondary/50 border border-border/40 overflow-hidden group hover:bg-secondary/70 transition-colors">
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-6 shadow-xl shadow-primary/20">
                    <Globe className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-4">Cloud Synchronization</h3>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">Access your bookmarks from any device, anywhere. Your data flows as fast as the web itself.</p>
                </div>
                <div className="flex -space-x-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-br from-primary/40 to-primary/10" />
                    </div>
                  ))}
                  <div className="h-10 px-4 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">+2k Users</div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2: Security */}
            <motion.div variants={fadeInUp} className="p-8 rounded-[36px] bg-card border border-border/40 flex flex-col justify-between group hover:border-primary/40 transition-colors">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-3">Military-Grade Security</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">Your data is encrypted and protected. We value your privacy as much as you do.</p>
              </div>
              <div className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-primary opacity-20" />
              </div>
            </motion.div>

            {/* Bento Card 3: Performance */}
            <motion.div variants={fadeInUp} className="p-8 rounded-[36px] bg-card border border-border/40 flex flex-col justify-between group hover:border-primary/40 transition-colors">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-foreground mb-6 group-hover:rotate-12 transition-transform">
                  <Zap className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">Zero lag. Instant search. LinkVault is optimized for performance from the ground up.</p>
              </div>
              <div className="mt-8 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-primary" />
              </div>
            </motion.div>

            {/* Bento Card 4: UI/UX */}
            <motion.div variants={fadeInUp} className="md:col-span-2 relative h-[380px] p-8 rounded-[36px] bg-secondary/50 border border-border/40 overflow-hidden group hover:bg-secondary/70 transition-colors">
               <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-6 shadow-xl shadow-primary/20">
                    <Smartphone className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-4">Masterpiece Design</h3>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">Influenced by modern minimalism. A UI that stays out of your way and makes organization a joy.</p>
                </div>
                <div className="flex gap-4">
                  <div className="px-6 py-3 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 font-bold text-xs">Glassmorphism</div>
                  <div className="px-6 py-3 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 font-bold text-xs">Dark Mode</div>
                </div>
              </div>
              <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[250px] bg-primary/10 border border-primary/20 rounded-[32px] rotate-[15deg] group-hover:rotate-[10deg] transition-all" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Loved by collectors.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Alex Rivera", role: "UI Designer", text: "LinkVault completely changed how I save inspiration. The tagging system is genius." },
              { name: "Sarah Chen", role: "Software Engineer", text: "Finally, a bookmark manager that doesn't feel like it's from 2005. FAST." },
              { name: "Marcus Thorne", role: "Curator", text: "The collection management is smooth as butter. I've moved all my 2k+ links here." }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-10 rounded-[40px] bg-background border border-border/40 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-6 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary" />)}
                </div>
                <p className="text-lg font-medium italic mb-8 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-black tracking-tight">{t.name}</p>
                  <p className="text-sm text-primary font-bold">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 italic text-primary/80">Our Mission</h2>
            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-12">
              We believe the web is too interesting to be lost in browser history. LinkVault was built to provide a permanent, beautiful home for your digital library. No clutter, no distractions. Just you and your links.
            </p>
            <div className="flex items-center justify-center gap-6">
              <Mail className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Globe className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto bg-primary rounded-[48px] p-12 md:p-24 text-primary-foreground text-center relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8">Ready to secure <br />your links?</h2>
            <p className="text-xl md:text-2xl font-medium opacity-80 mb-12 max-w-2xl mx-auto">
              Join thousands of collectors who trust LinkVault for their digital archive.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/sign-in">
                <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-black bg-background text-primary hover:bg-background/90 hover:scale-105 transition-all">
                  Join LinkVault Now
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                 <div className="flex items-center gap-1"><Mail className="h-4 w-4" /> support@linkvault.com</div>
                 <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Live Chat</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
