'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
}

export function BottomNav({ navItems, isActive }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-5 items-center justify-center text-xs">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={label} className="flex flex-col items-center justify-center gap-1">
            <Icon className={`h-6 w-6 ${isActive(href) ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] ${isActive(href) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
