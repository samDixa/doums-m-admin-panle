import React, { useEffect, useState } from 'react';
import { Plus, ClipboardList, Database, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Test {
    id: number;
    title: string;
    total_marks: number | null;
    duration_seconds: number | null;
}

const TestsPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingTest, setIsCreatingTest] = useState(false);
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

    const [newTest, setNewTest] = useState({ 
        title: '', 
        total_marks: 100, 
        positive_marks: 4, 
        negative_marks: 1, 
        duration_seconds: 3600,
        is_paid: false,
        price: 0
    });
    const [newQuestion, setNewQuestion] = useState({
        question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
        correct_option: 'A', subject: '', topic: '', description: ''
    });

    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [testsRes] = await Promise.all([
                api.get('/tests/'),
                // In a real app we might fetch global questions, but let's assume we list them
            ]);
            setTests(testsRes.data);
        } catch (error) {
            // Error handled
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTest(true);
        try {
            await api.post('/admin/test', newTest);
            toast({ title: "Test Initialized", description: "New test container deployed." });
            fetchData();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: "Failed to initialize test." });
        } finally {
            setIsCreatingTest(false);
        }
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingQuestion(true);
        try {
            await api.post('/admin/question', newQuestion);
            toast({ title: "Question Uploaded", description: "Data successfully committed to question bank." });
            setNewQuestion({
                question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
                correct_option: 'A', subject: '', topic: '', description: ''
            });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: "Failed to upload question." });
        } finally {
            setIsCreatingQuestion(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white italic">TEST<span className="text-cyan-500">LAB</span></h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm">Configure examination parameters and manage the MCQ neural network.</p>
            </div>

            <Tabs defaultValue="tests" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-6 p-1 h-12">
                    <TabsTrigger value="tests" className="px-8 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                        <ClipboardList className="mr-2 h-4 w-4" /> Mock Tests
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="px-8 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                        <Database className="mr-2 h-4 w-4" /> Global MCQ Bank
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tests">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200 uppercase tracking-widest text-xs">Active Test Clusters</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20">
                                        <Plus className="mr-2 h-4 w-4" /> New Test Cluster
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
                                    <DialogHeader>
                                        <DialogTitle>Initialize Test Cluster</DialogTitle>
                                        <DialogDescription className="text-slate-500 dark:text-zinc-400">Set the core metrics for this examination.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateTest}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right text-slate-500 dark:text-zinc-400">Title</Label>
                                                <Input value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" required />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right text-slate-500 dark:text-zinc-400">Duration (s)</Label>
                                                <Input type="number" value={newTest.duration_seconds} onChange={(e) => setNewTest({ ...newTest, duration_seconds: parseInt(e.target.value) })} className="col-span-3 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs text-slate-400 dark:text-zinc-500 uppercase">Paid Test</Label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={newTest.is_paid} 
                                                            onChange={(e) => setNewTest({ ...newTest, is_paid: e.target.checked })}
                                                            className="h-4 w-4 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded focus:ring-blue-500 dark:focus:ring-cyan-500" 
                                                        />
                                                        <span className="text-sm text-slate-500 dark:text-zinc-400">Yes</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs text-slate-400 dark:text-zinc-500 uppercase">Price (₹)</Label>
                                                    <Input 
                                                        type="number" 
                                                        value={newTest.price} 
                                                        onChange={(e) => setNewTest({ ...newTest, price: parseFloat(e.target.value) })}
                                                        className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                                                        disabled={!newTest.is_paid}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 w-full" disabled={isCreatingTest}>
                                                {isCreatingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Test"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                                    <TableRow className="border-none">
                                        <TableHead className="text-slate-500 dark:text-zinc-400 text-xs py-4 uppercase">Test ID</TableHead>
                                        <TableHead className="text-slate-500 dark:text-zinc-400 text-xs py-4 uppercase">Title</TableHead>
                                        <TableHead className="text-slate-500 dark:text-zinc-400 text-xs py-4 uppercase">Total Marks</TableHead>
                                        <TableHead className="text-slate-500 dark:text-zinc-400 text-xs py-4 uppercase">Duration</TableHead>
                                        <TableHead className="text-slate-500 dark:text-zinc-400 text-xs py-4 uppercase text-right">Ops</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 dark:text-cyan-500" /></TableCell></TableRow>
                                    ) : tests.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-500 dark:text-zinc-500 italic">No clusters found.</TableCell></TableRow>
                                    ) : (
                                        tests.map(test => (
                                            <TableRow key={test.id} className="border-slate-100 dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-cyan-500/5">
                                                <TableCell className="font-mono text-blue-600 dark:text-cyan-500 text-xs">#TST-{test.id}</TableCell>
                                                <TableCell className="font-semibold text-slate-900 dark:text-white">{test.title}</TableCell>
                                                <TableCell className="text-slate-500 dark:text-zinc-400">{test.total_marks || 'N/A'}</TableCell>
                                                <TableCell className="text-slate-500 dark:text-zinc-400">{Math.floor((test.duration_seconds || 0) / 60)}m</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-cyan-500">Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="questions">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">MCQ Upload Terminal</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-zinc-400">Insert primary question data into the global repository.</CardDescription>
                            </div>
                            <LayoutGrid className="h-6 w-6 text-slate-300 dark:text-zinc-700" />
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateQuestion} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Question Text</Label>
                                    <textarea
                                        className="w-full min-h-[100px] bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-all"
                                        placeholder="Type the question content here..."
                                        value={newQuestion.question_text}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {['a', 'b', 'c', 'd'].map(opt => (
                                        <div key={opt} className="space-y-2">
                                            <Label className="text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-bold tracking-widest">Option {opt}</Label>
                                            <Input
                                                value={(newQuestion as any)[`option_${opt}`]}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${opt}`]: e.target.value })}
                                                className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-zinc-400">Correct Opt</Label>
                                        <select
                                            className="w-full h-10 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-md px-3 text-sm outline-none focus:border-blue-500 dark:focus:border-cyan-500"
                                            value={newQuestion.correct_option}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-zinc-400">Subject</Label>
                                        <Input value={newQuestion.subject} onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })} className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-zinc-400">Topic</Label>
                                        <Input value={newQuestion.topic} onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })} className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700" />
                                    </div>
                                </div>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-xl shadow-blue-600/20 dark:shadow-cyan-600/20 px-8" disabled={isCreatingQuestion}>
                                    {isCreatingQuestion ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Commit Question
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TestsPage;
