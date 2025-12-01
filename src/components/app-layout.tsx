'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  BarChart2,
  HelpCircle,
  Home,
  LogOut,
  Play,
  User,
  Settings,
  History,
  Database,
  Bell,
  Sparkles,
  Crown,
  FileSearch,
  ClipboardList,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNav } from '@/components/bottom-nav';
import { ReactNode } from 'react';
import { useUser } from '@/context/user-context';
import type { Plan } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredPlan?: Plan;
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/interview/setup', label: 'Practice', icon: Play },
  { href: '/coach', label: 'Coach', icon: Sparkles, requiredPlan: 'Premium' },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
];

const secondaryNav: NavItem[] = [
  { href: '/history', label: 'Interview History', icon: History },
  { href: '/questions', label: 'Question Bank', icon: Database },
  { href: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch, requiredPlan: 'Super Pack' },
  { href: '/resume-builder', label: 'Resume Builder', icon: ClipboardList, requiredPlan: 'Super Pack' },
  { href: '/subscriptions', label: 'Subscriptions', icon: Crown },
  { href: '/resources', label: 'Resources', icon: Book },
];

const helpNav: NavItem[] = [
  { href: '#', label: 'Notifications', icon: Bell },
  { href: '#', label: 'Help & Support', icon: HelpCircle },
  { href: '#', label: 'Settings', icon: Settings },
];

const planHierarchy: Record<Plan, number> = {
  'Basic': 0,
  'Premium': 1,
  'Super Pack': 2,
};

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user, plan } = useUser();

  const hasAccess = (requiredPlan?: Plan) => {
    if (!requiredPlan) return true;
    return planHierarchy[plan] >= planHierarchy[requiredPlan];
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };
  
  const NavMenu = ({ items }: { items: NavItem[] }) => (
     <SidebarMenu>
        {items.map((item) => {
          const canAccess = hasAccess(item.requiredPlan);
          const linkContent = (
            <SidebarMenuButton asChild isActive={isActive(item.href)} disabled={!canAccess}>
              <span>
                <item.icon />
                <span>{item.label}</span>
                {!canAccess && <Badge variant="destructive" className="ml-auto bg-yellow-500/80 text-black">Upgrade</Badge>}
              </span>
            </SidebarMenuButton>
          );

          if (canAccess) {
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  {linkContent}
                </Link>
              </SidebarMenuItem>
            );
          }
          return (
             <SidebarMenuItem key={item.label} className="cursor-not-allowed">
              <Link href="/subscriptions" passHref>
                {linkContent}
              </Link>
             </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-semibold">SkillUp</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMenu items={mainNav} />
          <SidebarMenu className="mt-4">
             <NavMenu items={secondaryNav} />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <NavMenu items={helpNav} />
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton asChild>
                  <span>
                    <LogOut />
                    <span>Logout</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-background border-b md:justify-end">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{user.name}</span>
                <Avatar>
                    <AvatarImage src={user.avatarUrl} alt="User avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/50 min-h-[calc(100vh-65px)]">
            {children}
        </main>
        {isMobile && <BottomNav navItems={mainNav} isActive={isActive} hasAccess={hasAccess} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
