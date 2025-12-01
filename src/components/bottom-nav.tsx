'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { Plan } from '@/lib/types';
import { Badge } from './ui/badge';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredPlan?: Plan;
}

interface BottomNavProps {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  hasAccess: (requiredPlan?: Plan) => boolean;
}

export function BottomNav({ navItems, isActive, hasAccess }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-5 items-center justify-center text-xs">
        {navItems.map((item) => {
          const canAccess = hasAccess(item.requiredPlan);
          const href = canAccess ? item.href : '/subscriptions';
          
          return (
            <Link href={href} key={item.label} className="relative flex flex-col items-center justify-center gap-1">
              {!canAccess && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 scale-75 bg-yellow-500/80 text-black">
                  Up
                </Badge>
              )}
              <item.icon className={`h-6 w-6 ${isActive(item.href) && canAccess ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${isActive(item.href) && canAccess ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
