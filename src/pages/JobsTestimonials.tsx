import React, { useState, useEffect } from 'react';
import { Briefcase, MessageSquare, Plus, Loader2, Link as LinkIcon, Star, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';

// Mock Interfaces since Backend APIs are not yet created
interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    apply_url: string;
    is_active: boolean;
}

interface Testimonial {
    id: number;
    student_name: string;
    course_name: string;
    review_text: string;
    rating: number;
    image_url: string | null;
}

const JobsTestimonialsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [isLoading, setIsLoading] = useState(false);
    
    // States for Jobs
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', company: '', location: '', apply_url: '', is_active: true });

    // States for Testimonials
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);
    const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
    const [newTestimonial, setNewTestimonial] = useState({ student_name: '', course_name: '', review_text: '', rating: 5 });
    const [testimonialImage, setTestimonialImage] = useState<File | null>(null);

    const { toast } = useToast();

    // Mock Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Uncomment when API is ready
            // const [jobsRes, testsRes] = await Promise.all([
            //     api.get('/admin/jobs'),
            //     api.get('/admin/testimonials')
            // ]);
            // setJobs(jobsRes.data);
            // setTestimonials(testsRes.data);
            
            // Mock Data for now
            setJobs([
                { id: 1, title: 'Senior Medical Officer', company: 'Health Corp', location: 'Delhi, India', apply_url: 'https://example.com/apply', is_active: true }
            ]);
            setTestimonials([
                { id: 1, student_name: 'Rahul Sharma', course_name: 'NEET Complete Batch', review_text: 'Excellent course material and guidance.', rating: 5, image_url: null }
            ]);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load data. Ensure backend endpoints exist." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // HANDLERS
    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingJob(true);
        try {
            // await api.post('/admin/job', newJob);
            toast({ title: "Job Posted", description: "The job listing has been published to the portal." });
            setNewJob({ title: '', company: '', location: '', apply_url: '', is_active: true });
            setIsJobDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to post job." });
        } finally {
            setIsCreatingJob(false);
        }
    };

    const handleCreateTestimonial = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTestimonial(true);
        try {
            // const formData = new FormData();
            // formData.append('student_name', newTestimonial.student_name);
            // formData.append('course_name', newTestimonial.course_name);
            // formData.append('review_text', newTestimonial.review_text);
            // formData.append('rating', newTestimonial.rating.toString());
            // if (testimonialImage) formData.append('image', testimonialImage);
            
            // await api.post('/admin/testimonial', formData);
            
            toast({ title: "Testimonial Added", description: "The student review is now live." });
            setNewTestimonial({ student_name: '', course_name: '', review_text: '', rating: 5 });
            setTestimonialImage(null);
            setIsTestimonialDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to add testimonial." });
        } finally {
            setIsCreatingTestimonial(false);
        }
    };

    const handleDeleteJob = async (id: number) => {
        if (!confirm('Remove this job posting?')) return;
        try {
            // await api.delete(`/admin/job/${id}`);
            setJobs(jobs.filter(j => j.id !== id));
            toast({ title: "Job Removed", description: "The listing has been deleted." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove job." });
        }
    };

    const handleDeleteTestimonial = async (id: number) => {
        if (!confirm('Remove this testimonial?')) return;
        try {
            // await api.delete(`/admin/testimonial/${id}`);
            setTestimonials(testimonials.filter(t => t.id !== id));
            toast({ title: "Removed", description: "Testimonial deleted successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove testimonial." });
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white italic lowercase">COMMUNITY<span className="text-cyan-500 uppercase">hub</span></h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm italic">Manage external job postings and student testimonials.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 mb-6 flex justify-start p-1 h-12 inline-flex w-auto rounded-xl">
                    <TabsTrigger value="jobs" className="px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm">
                        <Briefcase className="mr-2 h-4 w-4" /> Job Portal
                    </TabsTrigger>
                    <TabsTrigger value="testimonials" className="px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm">
                        <MessageSquare className="mr-2 h-4 w-4" /> Testimonials
                    </TabsTrigger>
                </TabsList>

                {/* JOBS TAB */}
                <TabsContent value="jobs">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm text-slate-900 dark:text-white">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-cyan-500" /> Active Job Listings
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-zinc-400 mt-1">Opportunities visible on the mobile app's job board.</CardDescription>
                            </div>
                            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-cyan-600/20">
                                        <Plus className="mr-2 h-4 w-4" /> Post Job
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                                    <DialogHeader>
                                        <DialogTitle>Post New Job</DialogTitle>
                                        <DialogDescription>Add an external job opportunity for your students.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateJob} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Job Title</Label>
                                            <Input value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Clinical Pharmacist" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Company/Hospital</Label>
                                                <Input value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Apollo Hospitals" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <Input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. New Delhi" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Application URL</Label>
                                            <Input value={newJob.apply_url} onChange={e => setNewJob({...newJob, apply_url: e.target.value})} placeholder="https://..." type="url" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isCreatingJob} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
                                                {isCreatingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Job Post"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
                            ) : jobs.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 dark:text-zinc-500 italic">No active jobs posted.</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                    {jobs.map(job => (
                                        <div key={job.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-cyan-900/20 border border-blue-100 dark:border-cyan-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-500">
                                                    <Briefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{job.title}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                                        <span>{job.company}</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                                                        <span>{job.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <a href={job.apply_url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                                                    <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                                                        <LinkIcon className="mr-2 h-3 w-3" /> View Link
                                                    </Button>
                                                </a>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" onClick={() => handleDeleteJob(job.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TESTIMONIALS TAB */}
                <TabsContent value="testimonials">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-sm text-slate-900 dark:text-white">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" /> Student Testimonials
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-zinc-400 mt-1">Feedback showcased on the mobile app's success wall.</CardDescription>
                            </div>
                            <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-lg shadow-indigo-600/20">
                                        <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                                    <DialogHeader>
                                        <DialogTitle>Add Student Review</DialogTitle>
                                        <DialogDescription>Feature a successful student's feedback on the mobile app.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateTestimonial} className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Student Name</Label>
                                                <Input value={newTestimonial.student_name} onChange={e => setNewTestimonial({...newTestimonial, student_name: e.target.value})} placeholder="e.g. Priya Sharma" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Course/Batch</Label>
                                                <Input value={newTestimonial.course_name} onChange={e => setNewTestimonial({...newTestimonial, course_name: e.target.value})} placeholder="e.g. AIAPGET Complete" required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Review Text</Label>
                                            <textarea 
                                                value={newTestimonial.review_text} 
                                                onChange={e => setNewTestimonial({...newTestimonial, review_text: e.target.value})} 
                                                placeholder="Write the review here..." 
                                                required 
                                                className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Rating (1-5)</Label>
                                                <Input type="number" min="1" max="5" value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})} required className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Student Image (Optional)</Label>
                                                <Input type="file" accept="image/*" onChange={e => setTestimonialImage(e.target.files?.[0] || null)} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs" />
                                            </div>
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isCreatingTestimonial} className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500">
                                                {isCreatingTestimonial ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Testimonial"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                            ) : testimonials.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 dark:text-zinc-500 italic">No testimonials added yet.</div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4 p-4">
                                    {testimonials.map(test => (
                                        <div key={test.id} className="p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 relative group flex flex-col justify-between">
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteTestimonial(test.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            
                                            <div>
                                                <div className="flex items-center gap-1 mb-3">
                                                    {Array(test.rating).fill(0).map((_, i) => (
                                                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-zinc-300 italic mb-4 leading-relaxed line-clamp-3">"{test.review_text}"</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800/50">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-200 dark:border-indigo-800">
                                                    {test.image_url ? (
                                                        <img src={test.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        test.student_name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{test.student_name}</h5>
                                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{test.course_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default JobsTestimonialsPage;
