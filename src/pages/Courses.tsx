import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import CourseManagementDrawer from '@/components/courses/CourseManagementDrawer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Course {
    id: number;
    title: string;
    subject: string;
    level: string;
    is_paid: boolean;
    price: number | null;
    is_active: boolean;
}

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        subtitle: '',
        description: '',
        subject: '',
        level: '',
        is_paid: false,
        price: 0,
        discount_percentage: 0,
        is_new: false,
        start_date: '',
        end_date: '',
        batch_image: '',
        whatsapp_url: '',
        info_url: '',
    });
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { toast } = useToast();

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses/');
            setCourses(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Fetch Failed",
                description: "Could not load courses from database.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const formData = new FormData();
            Object.entries(newCourse).forEach(([key, value]) => {
                if (value !== null && value !== undefined && key !== 'batch_image') {
                    formData.append(key, value.toString());
                }
            });
            if (selectedLogo) {
                formData.append('file', selectedLogo);
            }

            await api.post('/admin/course', formData);

            toast({
                title: "Course Deployed",
                description: `Successfully launched ${newCourse.title} on network.`,
            });
            
            // Success reset
            setNewCourse({
                title: '', subtitle: '', description: '', subject: '',
                level: '', is_paid: false, price: 0, discount_percentage: 0,
                is_new: false, start_date: '', end_date: '', batch_image: '',
                whatsapp_url: '', info_url: '',
            });
            setSelectedLogo(null);
            setLogoPreview(null);
            fetchCourses();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Launch Failed",
                description: error.response?.data?.detail || "Criticial initialization error.",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white italic">CURRICULUM<span className="text-cyan-500">ENGINE</span></h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">Deploy and manage courses across the platform.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20">
                            <Plus className="mr-2 h-4 w-4" /> Deploy Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>New Course Initialization</DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-zinc-400">
                                Configure the parameters for the new curriculum entry.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <ScrollArea className="max-h-[60vh] pr-4">
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="title" className="text-right text-slate-500 dark:text-zinc-400">Title</Label>
                                        <Input id="title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="subtitle" className="text-right text-slate-500 dark:text-zinc-400">Subtitle</Label>
                                        <Input id="subtitle" value={newCourse.subtitle} onChange={(e) => setNewCourse({ ...newCourse, subtitle: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" placeholder="e.g. Complete batch" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="subject" className="text-right text-slate-500 dark:text-zinc-400">Subject</Label>
                                        <Input id="subject" value={newCourse.subject} onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="level" className="text-right text-slate-500 dark:text-zinc-400">Level</Label>
                                        <Input id="level" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="price" className="text-right text-slate-500 dark:text-zinc-400">Price</Label>
                                        <Input id="price" type="number" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="discount" className="text-right text-slate-500 dark:text-zinc-400">Discount %</Label>
                                        <Input id="discount" type="number" value={newCourse.discount_percentage} onChange={(e) => setNewCourse({ ...newCourse, discount_percentage: parseFloat(e.target.value) })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="start_date" className="text-right text-slate-500 dark:text-zinc-400">Start Date</Label>
                                        <Input id="start_date" type="date" value={newCourse.start_date} onChange={(e) => setNewCourse({ ...newCourse, start_date: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="end_date" className="text-right text-slate-500 dark:text-zinc-400">End Date</Label>
                                        <Input id="end_date" type="date" value={newCourse.end_date} onChange={(e) => setNewCourse({ ...newCourse, end_date: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-slate-500 dark:text-zinc-400">Logo Asset</Label>
                                        <div className="col-span-3 space-y-3">
                                            {logoPreview && (
                                                <div className="h-20 w-20 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 overflow-hidden shadow-inner flex items-center justify-center">
                                                    <img src={logoPreview} className="h-full w-full object-cover" alt="Preview" />
                                                </div>
                                            )}
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleLogoChange} 
                                                className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 cursor-pointer h-10 py-1.5" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="whatsapp" className="text-right text-slate-500 dark:text-zinc-400">WhatsApp</Label>
                                        <div className="col-span-3 relative">
                                            <div className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-zinc-500 font-bold">WA.ME/</div>
                                            <Input 
                                                id="whatsapp" 
                                                value={newCourse.whatsapp_url.replace('https://wa.me/', '')} 
                                                onChange={(e) => {
                                                    const num = e.target.value.replace(/\D/g, '');
                                                    setNewCourse({ ...newCourse, whatsapp_url: num ? `https://wa.me/${num}` : '' });
                                                }} 
                                                className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 pl-14" 
                                                placeholder="9876543210" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <DialogFooter className="mt-6">
                                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate Deployment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    <Input placeholder="Search courses telemetry..." className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50" />
                </div>
                <Button variant="outline" className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-xl shadow-cyan-500/5">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Status</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Title</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Subject</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Level</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Type</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-500" />
                                        <span className="text-slate-500 dark:text-zinc-500 italic text-sm">Polling database clusters...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-slate-500 dark:text-zinc-500 italic">
                                    No curriculum data found in the current sector.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id} className="border-slate-100 dark:border-zinc-800/50 hover:bg-blue-50/20 dark:hover:bg-cyan-500/5 transition-all">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${course.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-zinc-600'}`} />
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-400">{course.is_active ? 'ONLINE' : 'OFFLINE'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-900 dark:text-white">{course.title}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-zinc-400">{course.subject}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-zinc-400">{course.level}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${course.is_paid ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'}`}>
                                            {course.is_paid ? 'PREMIUM' : 'OPEN'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                                            onClick={() => {
                                                setSelectedCourseId(course.id);
                                                setIsDrawerOpen(true);
                                            }}
                                        >
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <CourseManagementDrawer
                courseId={selectedCourseId}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onUpdate={fetchCourses}
            />
        </div>
    );
};

export default CoursesPage;
