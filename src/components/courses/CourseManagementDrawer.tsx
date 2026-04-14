import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit2, Save, Loader2, FileText, Video } from 'lucide-react';
import api, { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
    id: number;
    title: string;
    lesson_type: string;
    content_url: string;
    duration_seconds?: number;
    sequence: number;
    is_preview: boolean;
}

interface Module {
    id: number;
    title: string;
    sequence: number;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    subject?: string;
    level?: string;
    is_paid: boolean;
    price?: number;
    discount_percentage?: number;
    is_new: boolean;
    start_date?: string;
    end_date?: string;
    batch_image?: string;
    whatsapp_url?: string;
    info_url?: string;
    is_active: boolean;
    modules: Module[];
}

interface CourseManagementDrawerProps {
    courseId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const CourseManagementDrawer: React.FC<CourseManagementDrawerProps> = ({ courseId, isOpen, onClose, onUpdate }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const { toast } = useToast();

    const fetchCourseDetails = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Fetch Failed",
                description: "Could not load course deep telemetry.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && courseId) {
            fetchCourseDetails();
        }
    }, [isOpen, courseId]);

    const handleUpdateCourse = async () => {
        if (!course) return;
        setIsSaving(true);
        try {
            await api.put(`/admin/course/${course.id}`, {
                title: course.title,
                subtitle: course.subtitle,
                description: course.description,
                subject: course.subject,
                level: course.level,
                price: course.price,
                discount_percentage: course.discount_percentage,
                is_new: course.is_new,
                start_date: course.start_date,
                end_date: course.end_date,
                batch_image: course.batch_image,
                whatsapp_url: course.whatsapp_url,
                info_url: course.info_url,
                is_active: course.is_active,
                is_paid: course.is_paid
            });
            toast({ title: "Signal Synchronized", description: "Course metadata updated globally." });
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "Sync Failed", description: "Could not update course metadata." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !courseId) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/admin/course/${courseId}/image`, formData);
            setCourse(prev => prev ? { ...prev, batch_image: response.data.batch_image } : null);
            toast({ title: "Asset Deployed", description: "New logo uploaded and linked." });
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image asset." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddModule = async () => {
        if (!courseId) return;
        try {
            const sequence = (course?.modules.length || 0) + 1;
            await api.post('/admin/module', {
                course_id: courseId,
                title: 'New Module',
                sequence
            });
            fetchCourseDetails();
            toast({ title: "Module Anchored", description: "New module added to curriculum." });
        } catch (error) {
            toast({ variant: "destructive", title: "deployment Failed", description: "Could not add module." });
        }
    };

    const handleDeleteModule = async (moduleId: number) => {
        try {
            await api.delete(`/admin/module/${moduleId}`);
            fetchCourseDetails();
            toast({ title: "Module Decommissioned", description: "Module removed from curriculum." });
        } catch (error) {
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not remove module." });
        }
    };

    const handleAddLesson = async (moduleId: number) => {
        try {
            const module = course?.modules.find(m => m.id === moduleId);
            const sequence = (module?.lessons.length || 0) + 1;
            await api.post('/admin/lesson', {
                module_id: moduleId,
                title: 'New Lesson',
                lesson_type: 'video',
                content_url: '',
                sequence
            });
            fetchCourseDetails();
            toast({ title: "Lesson Injected", description: "New lesson added to module." });
        } catch (error) {
            toast({ variant: "destructive", title: "Injection Failed", description: "Could not add lesson." });
        }
    };

    const handleDeleteLesson = async (lessonId: number) => {
        try {
            await api.delete(`/admin/lesson/${lessonId}`);
            fetchCourseDetails();
            toast({ title: "Lesson Purged", description: "Lesson removed from curriculum." });
        } catch (error) {
            toast({ variant: "destructive", title: "Purge Failed", description: "Could not remove lesson." });
        }
    };

    if (!isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-xl p-0 flex flex-col">
                <SheetHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight italic">
                                COURSE<span className="text-cyan-500">TERMINAL</span>
                            </SheetTitle>
                            <SheetDescription className="text-slate-500 dark:text-zinc-500">
                                Management interface for unique ID: {courseId}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-6">
                    <div className="px-6">
                        <TabsList className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full justify-start p-1 h-auto">
                            <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex-1 py-1.5 text-xs font-bold uppercase tracking-widest">Metadata</TabsTrigger>
                            <TabsTrigger value="curriculum" className="data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex-1 py-1.5 text-xs font-bold uppercase tracking-widest">Curriculum</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 px-6 py-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-500" />
                                <span className="text-slate-500 dark:text-zinc-500 italic text-sm">Synchronizing curriculum data...</span>
                            </div>
                        ) : (
                            <>
                                <TabsContent value="details" className="mt-0 space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-title" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Broad Title</Label>
                                            <Input
                                                id="edit-title"
                                                value={course?.title || ''}
                                                onChange={(e) => setCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
                                                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-subtitle" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Subtitle / Batch Name</Label>
                                            <Input
                                                id="edit-subtitle"
                                                value={course?.subtitle || ''}
                                                onChange={(e) => setCourse(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                                                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                                placeholder="e.g. Complete batch"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-subject" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Subject Sector</Label>
                                            <Input
                                                id="edit-subject"
                                                value={course?.subject || ''}
                                                onChange={(e) => setCourse(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-level" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Expertise Level</Label>
                                            <Input
                                                id="edit-level"
                                                value={course?.level || ''}
                                                onChange={(e) => setCourse(prev => prev ? { ...prev, level: e.target.value } : null)}
                                                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-price" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Credit Cost</Label>
                                                <Input
                                                    id="edit-price"
                                                    type="number"
                                                    value={course?.price || 0}
                                                    onChange={(e) => setCourse(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-discount" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Discount %</Label>
                                                <Input
                                                    id="edit-discount"
                                                    type="number"
                                                    value={course?.discount_percentage || 0}
                                                    onChange={(e) => setCourse(prev => prev ? { ...prev, discount_percentage: parseFloat(e.target.value) } : null)}
                                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-start" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Start Date</Label>
                                                <Input
                                                    id="edit-start"
                                                    type="date"
                                                    value={course?.start_date || ''}
                                                    onChange={(e) => setCourse(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-end" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">End Date</Label>
                                                <Input
                                                    id="edit-end"
                                                    type="date"
                                                    value={course?.end_date || ''}
                                                    onChange={(e) => setCourse(prev => prev ? { ...prev, end_date: e.target.value } : null)}
                                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">Logo Asset</Label>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
                                                <div className="h-16 w-16 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                                                    {course?.batch_image ? (
                                                        <img 
                                                            src={course.batch_image.startsWith('http') ? course.batch_image : `${API_BASE_URL}${course.batch_image}`} 
                                                            className="h-full w-full object-cover" 
                                                            alt="Logo" 
                                                        />
                                                    ) : (
                                                        <div className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold">NO LOGO</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleUploadLogo}
                                                        className="h-8 text-[10px] cursor-pointer"
                                                        disabled={isUploading}
                                                    />
                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic">PNG, JPG recommended. Direct system injection.</p>
                                                </div>
                                                {isUploading && <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-whatsapp" className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-widest">WhatsApp Access Number</Label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-zinc-500 font-bold">WA.ME/</div>
                                                <Input
                                                    id="edit-whatsapp"
                                                    value={course?.whatsapp_url?.replace('https://wa.me/', '') || ''}
                                                    onChange={(e) => {
                                                        const num = e.target.value.replace(/\D/g, '');
                                                        setCourse(prev => prev ? { ...prev, whatsapp_url: num ? `https://wa.me/${num}` : '' } : null);
                                                    }}
                                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500/50 dark:focus:border-cyan-500/50 pl-14"
                                                    placeholder="9876543210"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 py-2">
                                            <input
                                                type="checkbox"
                                                id="edit-isnew"
                                                checked={course?.is_new || false}
                                                onChange={(e) => setCourse(prev => prev ? { ...prev, is_new: e.target.checked } : null)}
                                                className="h-4 w-4 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded focus:ring-blue-500 dark:focus:ring-cyan-500"
                                            />
                                            <Label htmlFor="edit-isnew" className="text-sm font-bold text-slate-700 dark:text-zinc-300">Show "NEW" Badge</Label>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">Operational Status</p>
                                                <p className="text-xs text-slate-500 dark:text-zinc-500">{course?.is_active ? 'Currently active on network' : 'Offline/Maintenance mode'}</p>
                                            </div>
                                            <Button
                                                variant={course?.is_active ? "destructive" : "default"}
                                                size="sm"
                                                className={!course?.is_active ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                                                onClick={() => setCourse(prev => prev ? { ...prev, is_active: !prev.is_active } : null)}
                                            >
                                                {course?.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold h-12 shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20"
                                            onClick={handleUpdateCourse}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            SYNCHRONIZE CHANGES
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="curriculum" className="mt-0 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                                        <h3 className="font-bold text-lg text-blue-600 dark:text-cyan-500 italic underline decoration-blue-600/30 dark:decoration-cyan-500/30 underline-offset-8">MODULE STACKS</h3>
                                        <Button size="sm" onClick={handleAddModule} className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700">
                                            <Plus className="h-4 w-4 mr-1" /> New Module
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {course?.modules.map((module) => (
                                            <div key={module.id} className="border border-slate-100 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                                                <div className="p-4 bg-slate-100/50 dark:bg-zinc-800/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-6 w-6 rounded flex items-center justify-center bg-white dark:bg-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">M{module.sequence}</span>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{module.title}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white" title="Edit Module Name">
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-red-500" onClick={() => handleDeleteModule(module.id)} title="Purge Module">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-2 border-t border-slate-100 dark:border-zinc-800/50">
                                                    {module.lessons.map(lesson => (
                                                        <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/30 group">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                {lesson.lesson_type === 'video' ? <Video className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-500 flex-shrink-0" /> : <FileText className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                                                                <span className="text-xs text-slate-600 dark:text-zinc-300 truncate">{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white">
                                                                    <Edit2 className="h-3 w-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 dark:text-zinc-600 hover:text-red-500" onClick={() => handleDeleteLesson(lesson.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start text-[10px] h-8 text-slate-500 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-cyan-500 border border-dashed border-slate-200 dark:border-zinc-800 hover:border-blue-500/30 dark:hover:border-cyan-500/30 mt-2"
                                                        onClick={() => handleAddLesson(module.id)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-2" /> ADAPTIVE LESSON INJECTION
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </>
                        )}
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-950">
                        <Button variant="outline" onClick={onClose} className="w-full border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900">
                            CLOSE TERMINAL
                        </Button>
                    </SheetFooter>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
};

export default CourseManagementDrawer;
