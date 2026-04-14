import React, { useEffect, useState } from 'react';
import { 
    Plus, 
    Loader2, 
    Layers,
    ShieldCheck
} from 'lucide-react';
import api, { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

interface Banner {
    id: number;
    image_url: string;
    navigation_target: string | null;
    sequence: number;
}

interface FeaturedBatch {
    id: number;
    course_id: number;
    course?: {
        id: number;
        title: string;
        subtitle?: string;
    };
}

interface Course {
    id: number;
    title: string;
}

// Using API_BASE_URL from @/lib/api

const HomeScreen: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [featuredBatches, setFeaturedBatches] = useState<FeaturedBatch[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
    const [newBatchCourseId, setNewBatchCourseId] = useState<number>(0);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState('');

    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bannersRes, featuredRes, coursesRes] = await Promise.all([
                api.get('/admin/banners'),
                api.get('/admin/featured-batches'),
                api.get('/courses/')
            ]);
            setBanners(bannersRes.data);
            setFeaturedBatches(featuredRes.data || []);
            setCourses(coursesRes.data || []);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load home screen data.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            if (navigationTarget) {
                formData.append('navigation_target', navigationTarget);
            }

            await api.post('/admin/banner', formData);

            toast({ title: "Banner Published", description: "New banner live." });
            setIsCreateDialogOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            setNavigationTarget('');
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: "Error publishing banner." });
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBatchCourseId === 0) return;
        setIsCreating(true);
        try {
            await api.post('/admin/featured-batch', {
                course_id: newBatchCourseId,
                sequence: featuredBatches.length + 1
            });
            toast({ title: "Batch Featured", description: "Now on home screen." });
            setIsBatchDialogOpen(false);
            setNewBatchCourseId(0);
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed", description: "Could not feature batch." });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (bannerId: number) => {
        if (!confirm('Remove banner?')) return;
        try {
            await api.delete(`/admin/banner/${bannerId}`);
            toast({ title: "Banner Removed", description: "Deleted successfully." });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove banner." });
        }
    };

    const handleDeleteBatch = async (id: number) => {
        if (!confirm('Remove featured batch?')) return;
        try {
            await api.delete(`/admin/featured-batch/${id}`);
            toast({ title: "Removed", description: "No longer featured." });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove batch." });
        }
    };

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white italic lowercase">HOME<span className="text-cyan-500 uppercase">deck</span></h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm italic">Orchestrate the front-facing user experience and hero assets.</p>
                </div>
                
                <div className="flex gap-3">
                    <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-cyan-600/50 text-cyan-600 hover:bg-cyan-600/10">
                                <Plus className="mr-2 h-4 w-4" /> Feature Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
                            <DialogHeader>
                                <DialogTitle>Promote Course to Home</DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-zinc-400">Select a batch to showcase in the home carousel.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateBatch}>
                                <div className="py-4">
                                    <Label className="mb-2 block text-xs uppercase font-bold text-slate-500 dark:text-zinc-500">Choose Course</Label>
                                    <select 
                                        className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20"
                                        value={newBatchCourseId}
                                        onChange={(e) => setNewBatchCourseId(parseInt(e.target.value))}
                                        required
                                    >
                                        <option value={0}>Select a curriculum entry...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 w-full" disabled={isCreating || newBatchCourseId === 0}>
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Deploy to Home"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20">
                                <Plus className="mr-2 h-4 w-4" /> Inject Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Broadcast Asset Injection</DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-zinc-400">Configure new visual data for the hero cluster.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-widest">Banner Asset</Label>
                                        <div className="flex flex-col gap-3">
                                            <Input 
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 cursor-pointer" 
                                                required 
                                            />
                                            {previewUrl && (
                                                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-900 aspect-[21/9] flex items-center justify-center">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-widest">Navigation Target (ID)</Label>
                                        <Input 
                                            value={navigationTarget} 
                                            onChange={(e) => setNavigationTarget(e.target.value)} 
                                            placeholder="COURSE_1"
                                            className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" 
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 w-full font-bold" disabled={isCreating}>
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Publish Asset"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm text-slate-900 dark:text-white">
                        <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-cyan-500" /> Control Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-cyan-500/5 border border-blue-100 dark:border-cyan-500/20">
                                <h4 className="text-xs font-bold text-blue-800 dark:text-white uppercase tracking-wider">Guidelines</h4>
                                <ul className="mt-3 space-y-2 text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                                    <li>• Banner Aspect: 21:9 ultra-wide recommended.</li>
                                    <li>• Courses appear in priority order on mobile nodes.</li>
                                    <li>• Featured status bypasses normal sorting logic.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-slate-900 dark:text-white">
                        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/50">
                            <CardTitle className="text-xs uppercase font-bold tracking-tighter">Current Batch Stacks</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                                        <TableHead className="text-[10px] uppercase py-3">Course</TableHead>
                                        <TableHead className="text-[10px] uppercase py-3 text-right">Feature</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={2} className="text-center py-10"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></TableCell></TableRow>
                                    ) : (
                                        featuredBatches.map(batch => (
                                            <TableRow key={batch.id} className="border-slate-100 dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-cyan-500/5 transition-colors">
                                                <TableCell className="py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{batch.course?.title}</span>
                                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">ID: {batch.course_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-3">
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/5" onClick={() => handleDeleteBatch(batch.id)}>
                                                        REMOVE
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em]">Active Hero Assets</h3>
                        <span className="text-[10px] text-blue-600 dark:text-cyan-500 font-mono">{banners.length} FILES TOTAL</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {isLoading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="aspect-[21/9] rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800" />
                            ))
                        ) : banners.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
                                <Layers className="h-10 w-10 mb-4 opacity-20" />
                                <p className="text-sm italic">No hero assets found in the current sector.</p>
                            </div>
                        ) : (
                            banners.map(banner => (
                                <Card key={banner.id} className="group border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all text-slate-900 dark:text-white">
                                    <div className="aspect-[21/9] relative overflow-hidden bg-slate-100 dark:bg-zinc-950 flex items-center justify-center">
                                        <img src={getImageUrl(banner.image_url)} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded text-[8px] font-bold text-slate-900 dark:text-white uppercase">ID: {banner.id}</div>
                                        </div>
                                    </div>
                                    <CardFooter className="p-3 bg-slate-50/50 dark:bg-zinc-950/50 flex justify-between gap-2 border-t border-slate-100 dark:border-zinc-800/50">
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate flex-1">Target: {banner.navigation_target || 'Static'}</div>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/5" onClick={() => handleDelete(banner.id)}>
                                            REMOVE
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
