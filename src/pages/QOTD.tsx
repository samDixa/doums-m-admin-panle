import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Edit, Check } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

// --- Mobile Preview Component ---
const MobilePreview = ({ data }: { data: any }) => {
    return (
        <div className="w-[320px] shrink-0 bg-[#121c32] rounded-3xl p-4 shadow-xl border-4 border-slate-800 relative mx-auto overflow-hidden">
            {/* Inner App Container */}
            <div className="bg-slate-100 rounded-2xl h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-[#0b1d3a] text-white p-4 text-center rounded-t-2xl">
                    <h3 className="font-semibold text-lg drop-shadow-sm">Question of the Day</h3>
                    <p className="text-xs text-blue-200 mt-1">
                        {data?.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "Today"}
                    </p>
                </div>

                {/* Body */}
                <div className="bg-white p-4 flex-1 pb-6">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed mb-6">
                        {data?.question_text || "Enter question text here..."}
                    </p>

                    <div className="space-y-3">
                        {['A', 'B', 'C', 'D'].map(opt => {
                            const optKey = `option_${opt.toLowerCase()}`;
                            const isCorrect = data?.correct_option === opt;
                            return (
                                <div key={opt} className={`border rounded-xl p-3 text-sm font-medium flex items-center transition-colors ${isCorrect ? 'border-green-500 bg-green-50' : 'border-slate-300 text-slate-700 bg-white'
                                    }`}>
                                    <span className="font-bold mr-2">{opt}.</span>
                                    <span className="flex-1">{data?.[optKey] || `Option ${opt}`}</span>
                                    {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                                </div>
                            );
                        })}
                    </div>

                    <hr className="my-6 border-slate-800" />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase">
                        <span className="cursor-pointer hover:text-slate-600">Explain</span>
                        <span className="cursor-pointer hover:text-slate-600">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function QOTDPage() {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        description: '',
        subject: '',
        topic: '',
        is_daily_mcq: true
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/admin/questions/qotd');
            setQuestions(res.data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load daily questions' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { ...formData, is_daily_mcq: true };
            if (editingId) {
                await api.put(`/admin/question/${editingId}`, payload);
                toast({ title: 'Question updated successfully' });
            } else {
                await api.post('/admin/question', payload);
                toast({ title: 'Question added successfully' });
            }
            setIsDialogOpen(false);
            fetchQuestions();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving question' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await api.delete(`/admin/question/${id}`);
            toast({ title: 'Deleted successfully' });
            fetchQuestions();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to delete' });
        }
    };

    const openCreateDialog = () => {
        setEditingId(null);
        setFormData({
            question_text: '',
            option_a: '', option_b: '', option_c: '', option_d: '',
            correct_option: 'A', description: '', subject: '', topic: '',
            is_daily_mcq: true
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (q: any) => {
        setEditingId(q.id);
        setFormData({
            ...q,
            option_a: q.option_a || '', option_b: q.option_b || '',
            option_c: q.option_c || '', option_d: q.option_d || '',
            correct_option: q.correct_option || 'A',
            description: q.description || '', subject: q.subject || '', topic: q.topic || ''
        });
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Question of the Day</h1>
                    <p className="text-slate-500 dark:text-zinc-400">Manage daily featured MCQs for students.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Add Daily MCQ
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-5xl h-[85vh] flex p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950">
                        {/* LEFT: form */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Edit' : 'Create'} Question of the Day</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSave} className="space-y-4 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-zinc-300">Question Text</Label>
                                    <Textarea required placeholder="Enter the full question..." className="min-h-[100px] bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-cyan-500" value={formData.question_text} onChange={e => setFormData({ ...formData, question_text: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-zinc-300">Option A</Label>
                                        <Input required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={formData.option_a} onChange={e => setFormData({ ...formData, option_a: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-zinc-300">Option B</Label>
                                        <Input required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={formData.option_b} onChange={e => setFormData({ ...formData, option_b: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-zinc-300">Option C</Label>
                                        <Input required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={formData.option_c} onChange={e => setFormData({ ...formData, option_c: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 dark:text-zinc-300">Option D</Label>
                                        <Input required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={formData.option_d} onChange={e => setFormData({ ...formData, option_d: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Correct Option</Label>
                                        <Select value={formData.correct_option} onValueChange={(v) => setFormData({ ...formData, correct_option: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Option A</SelectItem>
                                                <SelectItem value="B">Option B</SelectItem>
                                                <SelectItem value="C">Option C</SelectItem>
                                                <SelectItem value="D">Option D</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subject (Optional)</Label>
                                        <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Explanation / Solution</Label>
                                    <Textarea placeholder="Explain why the answer is correct..." className="min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <Button type="submit" disabled={isSaving} className="w-full mt-4">
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Question
                                </Button>
                            </form>
                        </div>

                        {/* RIGHT: Mobile style preview */}
                        <div className="w-[400px] bg-slate-100 dark:bg-zinc-900 border-l p-6 hidden md:flex items-center justify-center">
                            <div className="w-full">
                                <h4 className="text-center font-semibold mb-6 text-slate-500">Live Mobile Preview</h4>
                                <MobilePreview data={formData} />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-white shadow-xl">
                <CardHeader>
                    <CardTitle>Daily MCQs</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-zinc-400">A record of all questions set as QOTD. The system mobile app queries the active list automatically.</CardDescription>
                </CardHeader>
                <CardContent>
                    {questions.length === 0 ? (
                        <div className="text-center p-8 text-slate-500 border rounded-lg border-dashed">No questions added yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q) => (
                                <div key={q.id} className="p-4 border rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow bg-white dark:bg-zinc-950">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-lg line-clamp-1">{q.question_text}</h4>
                                            <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                                                {new Date(q.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                                            <span>Correct: <strong className="text-green-600 dark:text-green-400">{q.correct_option}</strong></span>
                                            {q.subject && <span>Subject: {q.subject}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 border-l pl-4 border-slate-200 dark:border-zinc-800">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(q.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
