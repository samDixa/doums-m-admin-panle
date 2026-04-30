import React, { useEffect, useState } from 'react';
import { 
    Plus, Trash2, Loader2, FolderTree, ClipboardList, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Test {
    id: number;
    title: string;
    is_paid: boolean;
}

interface TestGroup {
    id: number;
    title: string;
    parent_id: number | null;
    children?: TestGroup[];
    tests?: Test[];
}

const TestSeriesPage: React.FC = () => {
    const [rootGroups, setRootGroups] = useState<TestGroup[]>([]);
    const [selectedRoot, setSelectedRoot] = useState<TestGroup | null>(null);
    const [selectedSeries, setSelectedSeries] = useState<TestGroup | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<TestGroup | null>(null);
    
    const [allTests, setAllTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [newGroupName, setNewGroupName] = useState('');
    const [newTestId, setNewTestId] = useState<string>('');
    
    const [dialogOpen, setDialogOpen] = useState({ root: false, series: false, category: false, test: false });
    
    const { toast } = useToast();

    useEffect(() => {
        fetchRootGroups();
        fetchAllTests();
    }, []);

    const fetchRootGroups = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/tests/groups');
            setRootGroups(res.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load test groups." });
        } finally { setIsLoading(false); }
    };

    const fetchGroupDetail = async (groupId: number, type: 'root' | 'series' | 'category') => {
        try {
            const res = await api.get(`/tests/groups/${groupId}`);
            if (type === 'root') setSelectedRoot(res.data);
            if (type === 'series') setSelectedSeries(res.data);
            if (type === 'category') setSelectedCategory(res.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load details." });
        }
    };

    const fetchAllTests = async () => {
        try {
            const res = await api.get('/tests/');
            setAllTests(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInitialize = async () => {
        setIsCreating(true);
        try {
            await api.post('/admin/test-group', { title: 'Free Mock', parent_id: null, sequence: 1 });
            await api.post('/admin/test-group', { title: 'Paid Mock', parent_id: null, sequence: 2 });
            toast({ title: "Success", description: "Test series initialized!" });
            fetchRootGroups();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to initialize." });
        } finally { setIsCreating(false); }
    };

    const handleCreateGroup = async (parentId: number | null, name: string, type: 'root' | 'series' | 'category') => {
        if (!name) return;
        setIsCreating(true);
        try {
            await api.post('/admin/test-group', { title: name, parent_id: parentId });
            toast({ title: "Success", description: "Group created." });
            setNewGroupName('');
            setDialogOpen({ ...dialogOpen, [type]: false });
            if (type === 'root') fetchRootGroups();
            else if (type === 'series' && selectedRoot) fetchGroupDetail(selectedRoot.id, 'root');
            else if (type === 'category' && selectedSeries) fetchGroupDetail(selectedSeries.id, 'series');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to create group." });
        } finally { setIsCreating(false); }
    };

    const handleAddTestToCategory = async () => {
        if (!selectedCategory || !newTestId) return;
        setIsCreating(true);
        try {
            await api.put(`/admin/test/${newTestId}`, { test_group_id: selectedCategory.id });
            toast({ title: "Success", description: "Test added to category." });
            setNewTestId('');
            setDialogOpen({ ...dialogOpen, test: false });
            fetchGroupDetail(selectedCategory.id, 'category');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to add test." });
        } finally { setIsCreating(false); }
    };

    const handleDeleteGroup = async (id: number, type: 'root' | 'series' | 'category') => {
        if (!confirm('Are you sure? This will delete the group.')) return;
        try {
            await api.delete(`/admin/test-group/${id}`);
            toast({ title: "Deleted", description: "Group removed." });
            if (type === 'root') {
                fetchRootGroups();
                setSelectedRoot(null);
            } else if (type === 'series' && selectedRoot) {
                fetchGroupDetail(selectedRoot.id, 'root');
                setSelectedSeries(null);
            } else if (type === 'category' && selectedSeries) {
                fetchGroupDetail(selectedSeries.id, 'series');
                setSelectedCategory(null);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete group." });
        }
    };

    const handleRemoveTest = async (testId: number) => {
        if (!confirm('Remove this test from category?')) return;
        try {
            await api.put(`/admin/test/${testId}`, { test_group_id: null });
            if (selectedCategory) fetchGroupDetail(selectedCategory.id, 'category');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to remove test." });
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Test Series Management</h2>
                <p className="text-slate-500 dark:text-zinc-400">Manage Free Mock and Paid Mock hierarchies.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
            ) : (
                <div className="space-y-8">
                    {/* Fixed Root Buttons */}
                    <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Test Series</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['Free Mock', 'Paid Mock'].some(title => !rootGroups.find(g => g.title === title)) ? (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-sm text-slate-500 italic">Root groups not found. Click below to setup.</p>
                                    <Button size="lg" onClick={handleInitialize} disabled={isCreating} className="bg-green-600 hover:bg-green-700 h-16 px-12 text-lg font-bold rounded-xl shadow-lg transition-all">
                                        {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                                        Initialize Test Series
                                    </Button>
                                </div>
                            ) : (
                                ['Free Mock', 'Paid Mock'].map(title => {
                                    const group = rootGroups.find(g => g.title === title);
                                    return (
                                        <Button 
                                            key={title}
                                            size="lg"
                                            className={`h-16 px-12 text-lg font-bold rounded-xl transition-all ${selectedRoot?.title === title ? 'bg-blue-700 dark:bg-blue-600 scale-105 shadow-lg' : 'bg-[#1e3a5f] hover:bg-[#2a4d7d]'}`}
                                            onClick={() => group && fetchGroupDetail(group.id, 'root')}
                                            disabled={!group}
                                        >
                                            {title}
                                        </Button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* 2. Series Column */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Series List</h3>
                                {selectedRoot && (
                                    <Dialog open={dialogOpen.series} onOpenChange={(v)=>setDialogOpen({...dialogOpen, series: v})}>
                                        <DialogTrigger asChild><Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-600"><Plus className="h-4 w-4 mr-2"/> Add Series</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Add Series to {selectedRoot.title}</DialogTitle></DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <Input placeholder="e.g. AIAPGET Mock Series" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} />
                                                <Button className="w-full" onClick={()=>handleCreateGroup(selectedRoot.id, newGroupName, 'series')} disabled={isCreating}>Save</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            {!selectedRoot ? (
                                <div className="h-60 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <FolderTree className="h-8 w-8 opacity-20" />
                                    <p className="text-sm italic">Select a root series above</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedRoot.children?.map(s => (
                                        <Card key={s.id} 
                                            className={`cursor-pointer group transition-all rounded-2xl border-2 ${selectedSeries?.id === s.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent bg-white dark:bg-zinc-950 hover:border-slate-200 shadow-sm'}`}
                                            onClick={() => fetchGroupDetail(s.id, 'series')}>
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedSeries?.id === s.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-zinc-900 text-slate-500'}`}>
                                                        <FolderTree className="h-5 w-5"/>
                                                    </div>
                                                    <span className="font-semibold">{s.title}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e)=>{e.stopPropagation(); handleDeleteGroup(s.id, 'series')}}><Trash2 className="h-4 w-4"/></Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {selectedRoot.children?.length === 0 && (
                                        <div className="text-center py-20 text-slate-400 bg-slate-50/50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-slate-100">
                                            <p className="text-sm italic">No series found in {selectedRoot.title}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Categories & Tests Column */}
                        <div className="md:col-span-7 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Categories & Tests</h3>
                                    {selectedSeries && (
                                        <Dialog open={dialogOpen.category} onOpenChange={(v)=>setDialogOpen({...dialogOpen, category: v})}>
                                            <DialogTrigger asChild><Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-600"><Plus className="h-4 w-4 mr-2"/> Add Category</Button></DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Add Category to {selectedSeries.title}</DialogTitle></DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <Input placeholder="e.g. Pharmacy, Anatomy" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} />
                                                    <Button className="w-full" onClick={()=>handleCreateGroup(selectedSeries.id, newGroupName, 'category')} disabled={isCreating}>Save</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                                {!selectedSeries ? (
                                    <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-xs italic">Select series first</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedSeries.children?.map(cat => (
                                            <Card key={cat.id} className={`border-l-4 ${selectedCategory?.id === cat.id ? 'border-l-blue-500' : 'border-l-slate-200'}`}>
                                                <CardContent className="p-0">
                                                    <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => fetchGroupDetail(cat.id, 'category')}>
                                                        <span className="font-bold text-sm">{cat.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={(e)=>{e.stopPropagation(); handleDeleteGroup(cat.id, 'category')}}><Trash2 className="h-3 w-3"/></Button>
                                                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedCategory?.id === cat.id ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </div>
                                                    
                                                    {selectedCategory?.id === cat.id && (
                                                        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                            <div className="flex justify-between items-center border-t pt-3 mb-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tests in Category</span>
                                                                <Dialog open={dialogOpen.test} onOpenChange={(v)=>setDialogOpen({...dialogOpen, test: v})}>
                                                                    <DialogTrigger asChild><Button size="xs" variant="outline" className="h-6 text-[10px]"><Plus className="h-3 w-3 mr-1"/> Add Test</Button></DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader><DialogTitle>Add Test to {cat.title}</DialogTitle></DialogHeader>
                                                                        <div className="space-y-4 pt-4">
                                                                            <Label>Select Test</Label>
                                                                            <Select value={newTestId} onValueChange={setNewTestId}>
                                                                                <SelectTrigger><SelectValue placeholder="Select existing test" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {allTests.map(t => (
                                                                                        <SelectItem key={t.id} value={t.id.toString()}>{t.title} {t.is_paid ? '(Paid)' : '(Free)'}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Button className="w-full" onClick={handleAddTestToCategory} disabled={isCreating || !newTestId}>Attach Test</Button>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                            {selectedCategory.tests?.map(test => (
                                                                <div key={test.id} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                                                                    <div className="flex items-center gap-2">
                                                                        <ClipboardList className="h-3 w-3 text-slate-400"/>
                                                                        <span className="text-xs font-medium">{test.title}</span>
                                                                        {test.is_paid && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-bold">PAID</span>}
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:text-red-600" onClick={()=>handleRemoveTest(test.id)}><Trash2 className="h-3 w-3"/></Button>
                                                                </div>
                                                            ))}
                                                            {selectedCategory.tests?.length === 0 && <div className="text-center py-4 text-slate-400 text-[10px] italic">No tests attached</div>}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestSeriesPage;
