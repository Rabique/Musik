import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CtaProps {
  ctaEnabled?: boolean;
  text: string;
  link?: string;
  size?: "default" | "sm" | "lg";
  target?: string;
  className?: string;
  onClick?: () => void;
}

export interface CtaComponentProps {
  cta: CtaProps;
  invert?: boolean;
  className?: string;
}

export function Cta({ cta, invert, className }: CtaComponentProps) {
  if (!cta || !cta.ctaEnabled) return null;

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs",
    default: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 whitespace-nowrap",
    sizeClasses[cta.size || "default"],
    invert
      ? "bg-white text-zinc-900 hover:bg-zinc-100"
      : "bg-zinc-900 text-white hover:bg-zinc-800",
    className,
    cta.className,
  );

  if (cta.link) {
    return (
      <Link
        href={cta.link}
        target={cta.target}
        className={baseStyles}
        onClick={cta.onClick}
      >
        {cta.text}
      </Link>
    );
  }

  return (
    <button type="button" className={baseStyles} onClick={cta.onClick}>
      {cta.text}
    </button>
  );
}

export default Cta;
