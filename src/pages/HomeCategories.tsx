import React, { useEffect, useState } from 'react';
import { 
    Plus, Trash2, Loader2, Layers, FolderTree, Video, FileText, CheckSquare
} from 'lucide-react';
import api, { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category { id: number; title: string; sequence: number; is_active: boolean; }
interface SubCategory { id: number; category_id: number; title: string; icon: string; sequence: number; is_active: boolean; }
interface Lecture { id: number; title: string; video_url: string; }
interface Note { id: number; title: string; pdf_url: string; }
interface SubCategoryTest { id: number; test_id: number; }
interface TestItem { id: number; title: string; }

const MAX_CATEGORIES = 6;
const MAX_SUBCATEGORIES = 10;

const HomeCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
    
    const [subCategoryDetail, setSubCategoryDetail] = useState<{ lectures: Lecture[], notes: Note[], tests: SubCategoryTest[] }>({ lectures: [], notes: [], tests: [] });
    const [availableTests, setAvailableTests] = useState<TestItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [catForm, setCatForm] = useState({ title: '', sequence: 0 });
    const [subCatForm, setSubCatForm] = useState<{title: string, iconFile: File | null}>({ title: '', iconFile: null });
    
    const [lectureForm, setLectureForm] = useState<{title: string, file: File | null}>({ title: '', file: null });
    const [noteForm, setNoteForm] = useState<{title: string, file: File | null}>({ title: '', file: null });
    const [testForm, setTestForm] = useState({ test_id: '' });

    const [dialogOpen, setDialogOpen] = useState({ cat: false, subCat: false, lecture: false, note: false, test: false });

    const { toast } = useToast();

    // Fetch Initial Data
    useEffect(() => {
        fetchCategories();
        fetchAvailableTests();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load categories." });
        } finally { setIsLoading(false); }
    };

    const fetchSubCategories = async (catId: number) => {
        try {
            const res = await api.get(`/admin/sub_categories?category_id=${catId}`);
            setSubCategories(res.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load sub-categories." });
        }
    };

    const fetchSubCategoryDetail = async (subId: number) => {
        try {
            const res = await api.get(`/home/app_sub_category/${subId}`);
            setSubCategoryDetail({ lectures: res.data.lectures || [], notes: res.data.notes || [], tests: res.data.tests || [] });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load sub-category details." });
        }
    };

    const fetchAvailableTests = async () => {
        try {
            const res = await api.get('/tests/');
            setAvailableTests(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryClick = (cat: Category) => {
        setSelectedCategory(cat);
        setSelectedSubCategory(null);
        fetchSubCategories(cat.id);
    };

    const handleSubCategoryClick = (sub: SubCategory) => {
        setSelectedSubCategory(sub);
        fetchSubCategoryDetail(sub.id);
    };

    // --- CREATE HANDLERS ---
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.post('/admin/category', catForm);
            toast({ title: "Success", description: "Category created." });
            setDialogOpen({ ...dialogOpen, cat: false });
            setCatForm({ title: '', sequence: 0 });
            fetchCategories();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.response?.data?.detail || "Failed to create." });
        } finally { setIsCreating(false); }
    };

    const handleCreateSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !subCatForm.iconFile) return;
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('title', subCatForm.title);
            formData.append('category_id', selectedCategory.id.toString());
            formData.append('file', subCatForm.iconFile);
            await api.post('/admin/sub_category', formData);
            toast({ title: "Success", description: "Sub-category created." });
            setDialogOpen({ ...dialogOpen, subCat: false });
            setSubCatForm({ title: '', iconFile: null });
            fetchSubCategories(selectedCategory.id);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.response?.data?.detail || "Failed to create." });
        } finally { setIsCreating(false); }
    };

    const handleCreateLecture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubCategory || !lectureForm.file) return;
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('title', lectureForm.title);
            formData.append('sub_category_id', selectedSubCategory.id.toString());
            formData.append('file', lectureForm.file);
            await api.post('/admin/sub_category_lecture', formData);
            setDialogOpen({ ...dialogOpen, lecture: false });
            setLectureForm({ title: '', file: null });
            fetchSubCategoryDetail(selectedSubCategory.id);
        } catch (err: any) { toast({ variant: "destructive", title: "Error" }); } finally { setIsCreating(false); }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubCategory || !noteForm.file) return;
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('title', noteForm.title);
            formData.append('sub_category_id', selectedSubCategory.id.toString());
            formData.append('file', noteForm.file);
            await api.post('/admin/sub_category_note', formData);
            setDialogOpen({ ...dialogOpen, note: false });
            setNoteForm({ title: '', file: null });
            fetchSubCategoryDetail(selectedSubCategory.id);
        } catch (err: any) { toast({ variant: "destructive", title: "Error" }); } finally { setIsCreating(false); }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubCategory || !testForm.test_id) return;
        setIsCreating(true);
        try {
            await api.post('/admin/sub_category_test', { test_id: parseInt(testForm.test_id), sub_category_id: selectedSubCategory.id });
            setDialogOpen({ ...dialogOpen, test: false });
            fetchSubCategoryDetail(selectedSubCategory.id);
        } catch (err: any) { toast({ variant: "destructive", title: "Error" }); } finally { setIsCreating(false); }
    };

    // --- DELETE HANDLERS ---
    const handleDelete = async (endpoint: string, id: number, refreshFn: () => void) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`${endpoint}/${id}`);
            toast({ title: "Deleted", description: "Item successfully removed." });
            refreshFn();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Deletion failed." });
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Content Structure</h2>
                <p className="text-slate-500 dark:text-zinc-400">Manage Categories, Sub-Categories, and their content</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Main Categories Column */}
                <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5 text-blue-600 dark:text-cyan-500"/> Categories ({categories.length}/{MAX_CATEGORIES})</h3>
                        <Dialog open={dialogOpen.cat} onOpenChange={(v) => setDialogOpen({...dialogOpen, cat: v})}>
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={categories.length >= MAX_CATEGORIES} className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white"><Plus className="h-4 w-4 mr-1"/> Add</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                                <form onSubmit={handleCreateCategory} className="space-y-4">
                                    <Input placeholder="Title (e.g. Exam, Study)" value={catForm.title} onChange={e => setCatForm({...catForm, title: e.target.value})} required/>
                                    <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? <Loader2 className="animate-spin h-4 w-4"/> : "Save"}</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-3">
                        {categories.map(c => (
                            <Card key={c.id} 
                                className={`overflow-hidden cursor-pointer hover:shadow-md transition-all ${selectedCategory?.id === c.id ? 'border-l-4 border-l-blue-600 border-blue-200 bg-blue-50/50 dark:border-l-cyan-500 dark:bg-cyan-900/10' : 'bg-white dark:bg-zinc-950'}`}
                                onClick={() => handleCategoryClick(c)}>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{c.title}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={(e) => { e.stopPropagation(); handleDelete('/admin/category', c.id, fetchCategories); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {categories.length === 0 && <Card className="p-8 text-center text-slate-400 border-dashed">No categories added yet.</Card>}
                    </div>
                </div>

                {/* 2. Sub-Categories Column */}
                <div className="md:col-span-8 space-y-4">
                    {!selectedCategory ? (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-12 text-slate-400">
                            Select a category to view sub-categories.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2"><FolderTree className="h-5 w-5 text-indigo-500 dark:text-indigo-400"/> Sub-Categories in "{selectedCategory.title}" ({subCategories.length}/{MAX_SUBCATEGORIES})</h3>
                                <Dialog open={dialogOpen.subCat} onOpenChange={(v) => setDialogOpen({...dialogOpen, subCat: v})}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" disabled={subCategories.length >= MAX_SUBCATEGORIES} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white"><Plus className="h-4 w-4 mr-1"/> Add Icon</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Add Sub-Category Icon</DialogTitle></DialogHeader>
                                        <form onSubmit={handleCreateSubCategory} className="space-y-4">
                                            <Input placeholder="Title (e.g. NTET, Entrance)" value={subCatForm.title} onChange={e => setSubCatForm({...subCatForm, title: e.target.value})} required/>
                                            <Input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={e => setSubCatForm({...subCatForm, iconFile: e.target.files?.[0] || null})} required/>
                                            <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? <Loader2 className="animate-spin h-4 w-4"/> : "Save"}</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {subCategories.map(sub => (
                                    <Card key={sub.id} 
                                        className={`cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-zinc-900 ${selectedSubCategory?.id === sub.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-zinc-800'}`}
                                        onClick={() => handleSubCategoryClick(sub)}>
                                        <CardContent className="p-4 flex flex-col items-center gap-3 relative group">
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDelete('/admin/sub_category', sub.id, () => fetchSubCategories(selectedCategory.id)); }}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                                                {sub.icon ? <img src={sub.icon.startsWith('http') ? sub.icon : `${API_BASE_URL}${sub.icon}`} className="h-full w-full object-cover" alt="icon"/> : <FolderTree className="h-6 w-6 text-indigo-400"/>}
                                            </div>
                                            <span className="font-semibold text-sm text-center text-slate-900 dark:text-zinc-200">{sub.title}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                                {subCategories.length === 0 && <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400">No icons added yet.</div>}
                            </div>

                            {/* 3. Sub-Category Content Details */}
                            {selectedSubCategory && (
                                <Card className="mt-8 border-indigo-100 dark:border-indigo-900 shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-zinc-800">
                                        <h4 className="font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                                            Managing Content for {selectedSubCategory.title}
                                        </h4>
                                    </div>
                                    <Tabs defaultValue="lectures" className="w-full">
                                        <TabsList className="w-full rounded-none border-b border-slate-200 bg-transparent h-auto p-0 flex justify-start pl-4 gap-2">
                                            <TabsTrigger value="lectures" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-2 pt-3"><Video className="h-4 w-4 mr-2"/> Lectures</TabsTrigger>
                                            <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-2 pt-3"><FileText className="h-4 w-4 mr-2"/> Notes</TabsTrigger>
                                            <TabsTrigger value="mcqs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none pb-2 pt-3"><CheckSquare className="h-4 w-4 mr-2"/> MCQs</TabsTrigger>
                                        </TabsList>
                                        
                                        <div className="p-4 bg-white dark:bg-zinc-950">
                                            {/* LECTURES TAB */}
                                            <TabsContent value="lectures" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Dialog open={dialogOpen.lecture} onOpenChange={(v)=>setDialogOpen({...dialogOpen, lecture:v})}>
                                                        <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1"/> Add Video</Button></DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Add Video Lecture</DialogTitle></DialogHeader>
                                                            <form onSubmit={handleCreateLecture} className="space-y-4">
                                                                <Input placeholder="Lecture Title" value={lectureForm.title} onChange={e=>setLectureForm({...lectureForm,title:e.target.value})} required/>
                                                                <Input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={e=>setLectureForm({...lectureForm,file:e.target.files?.[0] || null})} required/>
                                                                <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? <Loader2 className="animate-spin h-4 w-4"/> : "Save"}</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="space-y-2">
                                                    {subCategoryDetail.lectures.map(l => (
                                                        <div key={l.id} className="p-3 border rounded flex justify-between items-center bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                                                            <span className="font-medium text-sm text-slate-900 dark:text-zinc-200">{l.title}</span>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={()=>handleDelete('/admin/sub_category_lecture', l.id, ()=>fetchSubCategoryDetail(selectedSubCategory.id))}><Trash2 className="h-4 w-4"/></Button>
                                                        </div>
                                                    ))}
                                                    {subCategoryDetail.lectures.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No lectures attached.</div>}
                                                </div>
                                            </TabsContent>

                                            {/* NOTES TAB */}
                                            <TabsContent value="notes" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Dialog open={dialogOpen.note} onOpenChange={(v)=>setDialogOpen({...dialogOpen, note:v})}>
                                                        <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1"/> Add PDF Note</Button></DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Add PDF Note</DialogTitle></DialogHeader>
                                                            <form onSubmit={handleCreateNote} className="space-y-4">
                                                                <Input placeholder="Note Title" value={noteForm.title} onChange={e=>setNoteForm({...noteForm,title:e.target.value})} required/>
                                                                <Input type="file" accept="application/pdf" onChange={e=>setNoteForm({...noteForm,file:e.target.files?.[0] || null})} required/>
                                                                <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? <Loader2 className="animate-spin h-4 w-4"/> : "Save"}</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="space-y-2">
                                                    {subCategoryDetail.notes.map(n => (
                                                        <div key={n.id} className="p-3 border rounded flex justify-between items-center bg-slate-50 dark:bg-zinc-900 border-slate-200">
                                                            <span className="font-medium text-sm">{n.title}</span>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={()=>handleDelete('/admin/sub_category_note', n.id, ()=>fetchSubCategoryDetail(selectedSubCategory.id))}><Trash2 className="h-4 w-4"/></Button>
                                                        </div>
                                                    ))}
                                                    {subCategoryDetail.notes.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No notes attached.</div>}
                                                </div>
                                            </TabsContent>

                                            {/* MCQs TAB */}
                                            <TabsContent value="mcqs" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Dialog open={dialogOpen.test} onOpenChange={(v)=>setDialogOpen({...dialogOpen, test:v})}>
                                                        <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1"/> Attach Exam/Test</Button></DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Attach Existing Test to MCQs</DialogTitle></DialogHeader>
                                                            <form onSubmit={handleCreateTest} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label>Select Test</Label>
                                                                    <Select value={testForm.test_id} onValueChange={(v)=>setTestForm({test_id: v})}>
                                                                        <SelectTrigger><SelectValue placeholder="Select an existing test" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableTests.map(t => (
                                                                                <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <Button type="submit" className="w-full" disabled={isCreating || !testForm.test_id}>{isCreating ? <Loader2 className="animate-spin h-4 w-4"/> : "Attach Test"}</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="space-y-2">
                                                    {subCategoryDetail.tests.map(t => {
                                                        const testName = availableTests.find(at => at.id === t.test_id)?.title || `Test ID: ${t.test_id}`;
                                                        return (
                                                            <div key={t.id} className="p-3 border rounded flex justify-between items-center bg-slate-50 dark:bg-zinc-900 border-slate-200">
                                                                <span className="font-medium text-sm">{testName}</span>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={()=>handleDelete('/admin/sub_category_test', t.id, ()=>fetchSubCategoryDetail(selectedSubCategory.id))}><Trash2 className="h-4 w-4"/></Button>
                                                            </div>
                                                        );
                                                    })}
                                                    {subCategoryDetail.tests.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No MCQs attached.</div>}
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default HomeCategories;
