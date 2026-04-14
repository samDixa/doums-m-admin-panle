import React, { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogContent
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    MapPin, 
    GraduationCap, 
    Briefcase,
    Activity,
    BookOpen,
    FileText,
    Zap,
    LogIn,
    CheckCircle2,
    Loader2,
    Trophy,
    Target,
    MousePointer2,
    History
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface UserDetailModalProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

interface UserActivity {
    id: number;
    activity_type: string;
    description: string;
    metadata_json: any;
    created_at: string;
}

interface UserStats {
    total_logins: number;
    courses_enrolled: number;
    tests_attempted: number;
    avg_test_score: number;
    last_active: string | null;
    most_active_feature: string | null;
}

interface UserDetail {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    mobile: string | null;
    district: string | null;
    state: string | null;
    country: string | null;
    dob: string | null;
    gender: string | null;
    category: string | null;
    designation: string | null;
    batch: string | null;
    ug_college_state: string | null;
    ug_college_name: string | null;
    profile_image: string | null;
    is_superuser: boolean;
    created_at: string;
    activities: UserActivity[];
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, isOpen, onClose }) => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetail();
            fetchUserStats();
        }
    }, [isOpen, userId]);

    const fetchUserDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/users/${userId}`);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await api.get(`/admin/users/${userId}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'LOGIN': return <LogIn className="h-4 w-4 text-sky-500" />;
            case 'COURSE_ENROLL': return <BookOpen className="h-4 w-4 text-emerald-500" />;
            case 'TEST_START': return <Zap className="h-4 w-4 text-orange-500" />;
            case 'TEST_SUBMIT': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            case 'ARTICLE_READ': return <FileText className="h-4 w-4 text-slate-400" />;
            default: return <Activity className="h-4 w-4 text-slate-500" />;
        }
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const groupActivitiesByDate = (activities: UserActivity[]) => {
        const groups: Record<string, UserActivity[]> = {};
        activities.forEach(act => {
            const date = new Date(act.created_at).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(act);
        });
        return Object.entries(groups);
    };

    if (!userId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-2xl p-0 overflow-hidden">
                {isLoading ? (
                    <div className="h-[700px] flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-cyan-500" />
                        <p className="text-zinc-500 font-medium">Loading user information...</p>
                    </div>
                ) : user ? (
                    <div className="flex flex-col h-[85vh]">
                        {/* Header Banner */}
                        <div className="h-24 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-cyan-950/40 dark:to-zinc-900 relative flex-shrink-0 border-b dark:border-zinc-800">
                            <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                                <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-950 shadow-xl">
                                    <AvatarImage src={user.profile_image || undefined} />
                                    <AvatarFallback className="bg-blue-100 dark:bg-zinc-800 text-2xl font-bold text-blue-600 dark:text-cyan-500">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-bold tracking-tight">
                                            {user.first_name} {user.last_name}
                                        </h2>
                                        {user.is_superuser && (
                                            <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 text-[10px] uppercase font-bold px-2">
                                                Administrator
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> {user.email}
                                        <span className="text-zinc-300 dark:text-zinc-800">|</span>
                                        <span className="text-xs font-mono text-zinc-400 dark:text-cyan-500/50">User ID: #{user.id}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex-1 overflow-hidden flex flex-col px-8 pb-8">
                            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                                <TabsList className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 self-start mb-4 p-1">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-white transition-all px-6">Overview</TabsTrigger>
                                    <TabsTrigger value="academic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-white transition-all px-6">Education</TabsTrigger>
                                    <TabsTrigger value="activity" className="data-[state=active]:bg-white dark:data-[state=active]:bg-cyan-600 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-white transition-all px-6">User Activity</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2 space-y-6">
                                            <section className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                                                <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <User className="h-3 w-3" /> Basic Information
                                                </h3>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Date of Birth</Label>
                                                        <p className="text-sm mt-1 flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-zinc-400" /> {user.dob || 'Not provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Gender</Label>
                                                        <p className="text-sm mt-1 capitalize">{user.gender || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Phone Number</Label>
                                                        <p className="text-sm mt-1 flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-zinc-400" /> {user.mobile || 'No contact number'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                                                <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" /> Location Details
                                                </h3>
                                                <div className="grid grid-cols-3 gap-8 text-sm">
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">District</Label>
                                                        <p className="mt-1 font-medium">{user.district || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">State</Label>
                                                        <p className="mt-1 font-medium">{user.state || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Country</Label>
                                                        <p className="mt-1 font-medium">{user.country || 'India'}</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="space-y-6">
                                            <Card className="bg-blue-50/50 dark:bg-cyan-600/5 border-blue-100 dark:border-cyan-500/20 shadow-sm">
                                                <CardContent className="p-6">
                                                    <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest mb-4">Registration Details</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-zinc-500">Joined Date</span>
                                                            <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-zinc-500">Account Type</span>
                                                            <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-cyan-500/20 dark:text-cyan-500 h-5 px-2">
                                                                {user.is_superuser ? 'Staff' : 'Student'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-zinc-500">System Status</span>
                                                            <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                Active
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="academic" className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Card className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-blue-300 dark:hover:border-cyan-500/30 group">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-cyan-500" />
                                                    <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest">Educational Institution</h3>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold dark:group-hover:text-cyan-400 transition-colors">{user.ug_college_name || 'Self Registered'}</p>
                                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{user.ug_college_state || 'N/A'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Academic Batch</Label>
                                                        <p className="text-lg font-semibold text-blue-600 dark:text-cyan-500">{user.batch || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Student Category</Label>
                                                        <p className="text-lg font-medium">{user.category || 'Standard'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <div className="space-y-6">
                                            <Card className="bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-cyan-500" />
                                                        <h3 className="text-xs font-bold text-blue-600 dark:text-cyan-500 uppercase tracking-widest">Professional Status</h3>
                                                    </div>
                                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Current Designation</p>
                                                    <p className="text-xl font-medium mt-1 leading-tight">{user.designation || 'Scholar of Homoeopathy'}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="activity" className="flex-1 overflow-hidden flex flex-col">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-5 gap-4 mb-8">
                                        {[
                                            { label: 'Visits', value: stats?.total_logins, icon: LogIn, color: 'text-blue-500' },
                                            { label: 'Courses', value: stats?.courses_enrolled, icon: BookOpen, color: 'text-emerald-500' },
                                            { label: 'Tests', value: stats?.tests_attempted, icon: Target, color: 'text-orange-500' },
                                            { label: 'Avg. Score', value: `${stats?.avg_test_score.toFixed(1) || '0.0'}%`, icon: Trophy, color: 'text-amber-500' },
                                            { label: 'Primary Focus', value: stats?.most_active_feature || 'None', icon: MousePointer2, color: 'text-purple-500' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold truncate pr-2">{item.value ?? 0}</span>
                                                    <item.icon className={`h-4 w-4 ${item.color} opacity-70`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                        <div className="flex items-center gap-2 mb-6">
                                            <History className="h-4 w-4 text-blue-600 dark:text-cyan-500" />
                                            <h3 className="text-xs font-bold uppercase tracking-widest">User Activity Timeline</h3>
                                        </div>
                                        
                                        {user.activities.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-zinc-400 italic">
                                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No activity recorded yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-12">
                                                {groupActivitiesByDate(user.activities).map(([date, acts]) => (
                                                    <div key={date} className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                                                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest bg-white dark:bg-zinc-950 px-2">{date}</span>
                                                            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                                                        </div>
                                                        
                                                        <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-900">
                                                            {acts.map((activity) => (
                                                                <div key={activity.id} className="relative group">
                                                                    <div className="absolute -left-[30px] top-1 h-7 w-7 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center z-10 group-hover:border-blue-600 dark:group-hover:border-cyan-500 transition-all group-hover:scale-105">
                                                                        {getActivityIcon(activity.activity_type)}
                                                                    </div>
                                                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800/40 hover:bg-white dark:hover:bg-zinc-900/40 hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm dark:shadow-none transition-all flex items-start justify-between gap-4">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-xs font-bold text-zinc-700 dark:text-cyan-400 tracking-wider uppercase">{activity.activity_type.replace(/_/g, ' ')}</span>
                                                                                <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{formatTimestamp(activity.created_at)}</span>
                                                                            </div>
                                                                            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{activity.description}</p>
                                                                        </div>
                                                                        
                                                                        {activity.metadata_json && (
                                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                                <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[9px] h-6 px-1.5 flex items-center gap-1">
                                                                                    {Object.entries(activity.metadata_json).slice(0, 1).map(([k, v]) => (
                                                                                        <span key={k}>{k}: {String(v)}</span>
                                                                                    ))}
                                                                                </Badge>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                ) : (
                    <div className="h-60 flex flex-col items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-zinc-950">
                        <User className="h-8 w-8" />
                        <p className="font-bold tracking-widest text-sm uppercase">Unable to load user profile</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailModal;
