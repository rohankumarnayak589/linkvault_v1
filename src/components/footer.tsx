"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border/40 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <span className="text-xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">LinkVault</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The modern bookmark manager that gives you full control over your digital library. Swift, private, and beautiful.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/50">Product</h4>
          <ul className="space-y-2">
            <li><Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vault</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/50">Company</h4>
          <ul className="space-y-2">
            <li><Link href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/50">Connect</h4>
          <ul className="space-y-2">
            <li><Link href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Twitter</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Discord</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[12px] text-muted-foreground">© 2026 LinkVault. All rights reserved.</p>
        <p className="text-[12px] text-muted-foreground font-medium">Built with ❤️ for link collectors.</p>
      </div>
    </footer>
  );
}
