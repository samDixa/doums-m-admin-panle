import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Bell,
    FileText,
    LogOut,
    Users,
    ShieldCheck,
    Home,
    Layers,
    HelpCircle,
    Briefcase
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Users', icon: Users, url: '/users' },
    { title: 'Home Slider', icon: Home, url: '/home-screen' },
    { title: 'Categories', icon: Layers, url: '/home-categories' },
    { title: 'Daily QOTD', icon: HelpCircle, url: '/qotd' },
    { title: 'Courses', icon: BookOpen, url: '/courses' },
    { title: 'Tests & MCQs', icon: ClipboardList, url: '/tests' },
    { title: 'Jobs & Feedback', icon: Briefcase, url: '/jobs' },
    { title: 'Articles', icon: FileText, url: '/articles' },
    { title: 'Notifications', icon: Bell, url: '/notifications' },
];

export const DashboardSidebar: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <Sidebar className="border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
            <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-zinc-900">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 dark:bg-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20 dark:shadow-cyan-600/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        Domus<span className="text-blue-600 dark:text-cyan-500">Admin</span>
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent className="custom-scrollbar">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-400 dark:text-zinc-500 px-6 py-4 uppercase text-[10px] font-bold tracking-widest">Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-3 gap-1">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                                        <Link
                                            to={item.url}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                                                location.pathname === item.url
                                                    ? "bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-500 font-semibold shadow-sm"
                                                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-4 w-4 transition-transform group-hover:scale-110",
                                                location.pathname === item.url ? "text-blue-600 dark:text-cyan-500" : "text-slate-400 dark:text-zinc-500"
                                            )} />
                                            <span className="text-sm">{item.title}</span>
                                            {location.pathname === item.url && (
                                                <div className="ml-auto flex items-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-cyan-500 shadow-sm" />
                                                </div>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 mt-auto border-t border-slate-100 dark:border-zinc-900/50">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all group"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </SidebarFooter>
        </Sidebar>
    );
};
