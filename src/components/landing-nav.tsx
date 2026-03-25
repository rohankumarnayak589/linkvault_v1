"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { applyTheme, getSavedTheme } from "@/lib/icon-mapper";
import Link from "next/link";

export function LandingNav() {
  const { data: session } = useSession();
  const [currentTheme, setCurrentTheme] = useState<"ivory-warm" | "midnight">("ivory-warm");

  useEffect(() => {
    const saved = getSavedTheme("linkvault-landing-theme") as "ivory-warm" | "midnight";
    setCurrentTheme(saved === "midnight" ? "midnight" : "ivory-warm");
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === "ivory-warm" ? "midnight" : "ivory-warm";
    setCurrentTheme(next);
    applyTheme(next, "linkvault-landing-theme");
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">LinkVault</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <AnimatePresence mode="wait">
              {currentTheme === "ivory-warm" ? (
                <motion.div key="sun" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-semibold">Dashboard</Button>
              </Link>
              <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
                {session.user.image ? (
                  <Image src={session.user.image} alt="User profile" width={32} height={32} />
                ) : (
                  <div className="h-full w-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {session.user.name?.[0] || "?"}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="font-semibold">Log In</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="sm" className="font-bold rounded-xl px-6 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
