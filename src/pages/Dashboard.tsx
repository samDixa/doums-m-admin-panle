import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, ClipboardList, Bell, Users, TrendingUp, Activity, Loader2, ChevronRight, Zap, Target } from 'lucide-react';
import api from '@/lib/api';

const Dashboard: React.FC = () => {
    const [stats, setStats] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                const data = response.data;
                if (data) {
                    setStats([
                        { title: 'Total Courses', value: data.total_courses ?? 0, icon: BookOpen, color: 'text-blue-600 dark:text-cyan-500', bg: 'bg-blue-50 dark:bg-cyan-500/10' },
                        { title: 'Active Tests', value: data.active_tests ?? 0, icon: ClipboardList, color: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                        { title: 'Total Students', value: data.global_students ?? 0, icon: Users, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                        { title: 'Notifications', value: data.notifications_sent ?? 0, icon: Bell, color: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Overview</h2>
                <p className="text-slate-500 dark:text-zinc-400">Global overview of platform performance and active metrics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats && stats.length > 0 && stats.map((stat) => (
                    <Card key={stat.title} className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm hover:border-blue-300 dark:hover:border-cyan-500/50 transition-all group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200 transition-colors uppercase tracking-widest">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-lg transition-transform group-hover:scale-110`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{stat.value}</div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">+12.5%</span> 
                                <span className="uppercase tracking-tighter">growth rate</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="md:col-span-4 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white text-lg">Activity Trends</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-zinc-400 text-xs">View student engagement across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center justify-center border-t border-slate-50 dark:border-zinc-800/50">
                        <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-zinc-500">
                            <div className="relative">
                                <Activity className="h-12 w-12 text-blue-600/20 dark:text-cyan-500/30" />
                                <Activity className="h-12 w-12 absolute inset-0 animate-ping text-blue-600/10 dark:text-cyan-500/20" />
                            </div>
                            <span className="text-sm font-medium italic">Generating insight visualizations...</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white text-lg">Quick Actions</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-zinc-400 text-xs">Common administrative tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 border-t border-slate-50 dark:border-zinc-800/50 pt-6">
                        <button className="flex w-full items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 hover:bg-blue-50 dark:hover:bg-cyan-500/5 hover:border-blue-200 dark:hover:border-cyan-500/30 transition-all text-left group">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-100 dark:bg-cyan-500/10 rounded-lg text-blue-600 dark:text-cyan-500 group-hover:scale-110 transition-transform">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Create Course</div>
                                    <div className="text-xs text-slate-500 dark:text-zinc-400">Launch a new curriculum.</div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button className="flex w-full items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 hover:bg-purple-50 dark:hover:bg-purple-500/5 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all text-left group">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-500 group-hover:scale-110 transition-transform">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Upload MCQs</div>
                                    <div className="text-xs text-slate-500 dark:text-zinc-400">Expand the test database.</div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
