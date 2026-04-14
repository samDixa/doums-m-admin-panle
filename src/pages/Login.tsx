import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            login(response.data.access_token);
            toast({
                title: "Login Successful",
                description: "Welcome back to the Domus Admin Panel.",
            });
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            const detail = error.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : "Invalid email or password.";

            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 transition-colors font-sans overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-cyan-500/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 dark:bg-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20 mb-2">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Domus<span className="text-blue-600 dark:text-cyan-500">Admin</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
                        Management Console Access
                    </p>
                </div>

                <Card className="border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Sign In</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-zinc-400">
                            Enter your administrator credentials to proceed.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-zinc-300 ml-1">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@domus.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-blue-500 dark:focus:ring-cyan-500 pl-10 h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" underline className="text-slate-700 dark:text-zinc-300 ml-1">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-blue-500 dark:focus:ring-cyan-500 pl-10 h-11"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-md shadow-blue-500/10 dark:shadow-cyan-600/10 transition-all active:scale-[0.98] font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Authenticating..." : "Sign In"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                
                <p className="text-center text-xs text-slate-400 dark:text-zinc-600">
                    &copy; {new Date().getFullYear()} Domus Learning Systems. Protected Access.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
