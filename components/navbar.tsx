"use client";

import * as React from "react";
import Link from "next/link";
import { Music, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export const defaultNavItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export interface NavbarProps {
  items?: NavItem[];
  className?: string;
}

export function Navbar({ items = defaultNavItems, className }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-black/60 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-gradient-to-b from-black/60 to-transparent",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Music className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Musik
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="#create"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-black/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2.5 pt-4 border-t border-white/10">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium text-white/80 py-2 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="#create"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
