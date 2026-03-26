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
  const [currentTheme, setCurrentTheme] = useState<"ivory-warm" | "vscode-dark">("ivory-warm");

  useEffect(() => {
    const saved = getSavedTheme("linkvault-landing-theme") as "ivory-warm" | "vscode-dark";
    setCurrentTheme(saved === "vscode-dark" ? "vscode-dark" : "ivory-warm");
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === "ivory-warm" ? "vscode-dark" : "ivory-warm";
    setCurrentTheme(next);
    applyTheme(next, "linkvault-landing-theme");
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">LinkVault</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-xl hover:bg-secondary/50 transition-colors h-9 w-9"
          >
            <AnimatePresence mode="wait">
              {currentTheme === "ivory-warm" ? (
                <motion.div key="sun" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {session?.user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm px-2 sm:px-4">Dashboard</Button>
              </Link>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-border shrink-0">
                {session.user.image ? (
                  <Image src={session.user.image} alt="User profile" width={32} height={32} />
                ) : (
                  <div className="h-full w-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {session.user.name?.[0] || "?"}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="hidden xs:block">
                <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm px-2 sm:px-4">Log In</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="sm" className="font-bold rounded-xl px-4 sm:px-6 text-xs sm:text-sm bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
