import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/toaster';
import { User } from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
                <DashboardSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-transparent">
                    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 w-full">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors" />
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block"></div>
                            <h1 className="text-sm font-medium text-slate-500 dark:text-zinc-400 hidden sm:block">
                                Admin Portal <span className="mx-2 text-slate-300 dark:text-zinc-700">/</span> <span className="text-slate-900 dark:text-white font-semibold">Management Console</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-cyan-900/20 border border-blue-200 dark:border-cyan-500/30 flex items-center justify-center shadow-sm">
                                <User className="h-4 w-4 text-blue-600 dark:text-cyan-500" />
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
            <Toaster />
        </SidebarProvider>
    );
};

export default DashboardLayout;
