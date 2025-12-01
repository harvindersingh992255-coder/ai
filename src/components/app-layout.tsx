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

const mainNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/interview/setup', label: 'Practice', icon: Play },
  { href: '/coach', label: 'Coach', icon: Sparkles },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
];

const secondaryNav = [
  { href: '/history', label: 'Interview History', icon: History },
  { href: '/questions', label: 'Question Bank', icon: Database },
  { href: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
  { href: '/resume-builder', label: 'Resume Builder', icon: ClipboardList },
  { href: '/subscriptions', label: 'Subscriptions', icon: Crown },
  { href: '/resources', label: 'Resources', icon: Book },
];

const helpNav = [
  { href: '#', label: 'Notifications', icon: Bell },
  { href: '#', label: 'Help & Support', icon: HelpCircle },
  { href: '#', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

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
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <span>
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu className="mt-4">
             {secondaryNav.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <span>
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             {helpNav.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <span>
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
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
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-background border-b md:justify-end">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">John Doe</span>
                <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/1/100/100" alt="User avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/50 min-h-[calc(100vh-65px)]">
            {children}
        </main>
        {isMobile && <BottomNav navItems={mainNav} isActive={isActive} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
