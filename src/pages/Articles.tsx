import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Bell, FileText, Send, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ArticlesNotificationsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isPublishingArticle, setIsPublishingArticle] = useState(false);
    const [isSendingNotification, setIsSendingNotification] = useState(false);
    
    // Determine active tab based on path
    const activeTab = location.pathname.includes('articles') ? 'articles' : 'notifications';
    
    const [newArticle, setNewArticle] = useState({ title: '', content: '', is_clinical_case: true, is_published: true });
    const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'in_app', is_global: true });

    const { toast } = useToast();

    const handlePublishArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishingArticle(true);
        try {
            await api.post('/admin/article', newArticle);
            toast({ title: "Article Published", description: "Clinical case data broadcasted successfully." });
            setNewArticle({ title: '', content: '', is_clinical_case: true, is_published: true });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to publish article." });
        } finally {
            setIsPublishingArticle(false);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingNotification(true);
        try {
            await api.post('/admin/notification', newNotification);
            toast({ title: "Signal Sent", description: "Platform-wide notification delivered." });
            setNewNotification({ title: '', message: '', type: 'in_app', is_global: true });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to send notification signal." });
        } finally {
            setIsSendingNotification(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white italic">COMMS<span className="text-cyan-500">CENTER</span></h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm italic">Manage global articles and push-channel notifications.</p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => navigate(`/${v}`)} className="w-full">
                <TabsList className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-6 w-full justify-start p-1 h-12">
                    <TabsTrigger value="notifications" className="px-8 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="articles" className="px-8 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                        <FileText className="mr-2 h-4 w-4" /> Knowledge Base
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-white backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600 dark:text-cyan-500" /> Global Bulletin
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-zinc-400">Deploy an instant alert to all connected user terminals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendNotification} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-tighter">Bulletin Heading</Label>
                                    <Input
                                        value={newNotification.title}
                                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                        className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-cyan-500"
                                        placeholder="e.g. Server Maintenance or New Course Launch"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-tighter">Transmission Data</Label>
                                    <textarea
                                        className="w-full min-h-[120px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                                        placeholder="Enter the notification message details..."
                                        value={newNotification.message}
                                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-xl shadow-blue-600/20 dark:shadow-cyan-600/20 px-12" disabled={isSendingNotification}>
                                    {isSendingNotification ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                    Broadcast Signal
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="articles">
                    <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-white backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-500" /> Intelligence Publisher
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-zinc-400">Publish clinical cases or academic articles to the main discovery feed.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePublishArticle} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-tighter">Article Title</Label>
                                    <Input
                                        value={newArticle.title}
                                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                                        className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-cyan-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-tighter">Article Content (Markdown Support)</Label>
                                    <textarea
                                        className="w-full min-h-[300px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:border-blue-500 dark:focus:border-cyan-500 outline-none transition-all font-mono placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                                        placeholder="Enter article body content..."
                                        value={newArticle.content}
                                        onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_clinical_case"
                                            checked={newArticle.is_clinical_case}
                                            onChange={(e) => setNewArticle({ ...newArticle, is_clinical_case: e.target.checked })}
                                            className="h-4 w-4 accent-blue-600 dark:accent-cyan-500 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                                        />
                                        <Label htmlFor="is_clinical_case" className="text-slate-700 dark:text-zinc-300">Mark as Clinical Case of the Week</Label>
                                    </div>
                                </div>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-xl shadow-blue-600/20 dark:shadow-cyan-600/20 px-12" disabled={isPublishingArticle}>
                                    {isPublishingArticle ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Publish Intel
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ArticlesNotificationsPage;
