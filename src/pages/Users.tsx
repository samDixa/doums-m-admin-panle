import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2, Key, Edit, Loader2, UserPlus, Shield, ShieldAlert, MoreVertical, Eye } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import UserDetailModal from '@/components/UserDetailModal';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    mobile: string | null;
    is_superuser: boolean;
    created_at: string;
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        mobile: '',
        is_superuser: false,
    });

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { toast } = useToast();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.post('/admin/user', newUser);
            toast({
                title: "Success",
                description: `Created account for ${newUser.email}.`,
            });
            setIsCreateDialogOpen(false);
            setNewUser({ email: '', password: '', first_name: '', last_name: '', mobile: '', is_superuser: false });
            fetchUsers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.detail || "Failed to create user.",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsUpdating(true);
        try {
            await api.put(`/admin/user/${editingUser.id}`, {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                mobile: editingUser.mobile,
                is_superuser: editingUser.is_superuser
            });
            toast({
                title: "Success",
                description: "User information updated.",
            });
            setIsEditDialogOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.detail || "Failed to update user.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/user/${userId}`);
            toast({
                title: "User Deleted",
                description: "The user has been removed from the system.",
            });
            fetchUsers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete user.",
            });
        }
    };

    const handleResetPassword = async (userId: number) => {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;
        try {
            await api.put(`/admin/user/${userId}`, { password: newPassword });
            toast({
                title: "Success",
                description: "Password has been updated.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.detail || "Failed to reset password.",
            });
        }
    };

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">View and manage all registered users in the platform.</p>
                </div>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-md">
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-[425px] shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-blue-600 dark:text-cyan-500" />
                                Create New User
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-zinc-400">
                                Enter details to register a new user account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Email Address</Label>
                                    <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 dark:focus:ring-cyan-500" placeholder="user@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Security Password</Label>
                                    <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-zinc-400">First Name</Label>
                                        <Input value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-zinc-400">Last Name</Label>
                                        <Input value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Mobile Number</Label>
                                    <Input value={newUser.mobile} onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" placeholder="+91 0000000000" />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox 
                                        id="is_superuser" 
                                        checked={newUser.is_superuser} 
                                        onCheckedChange={(checked) => setNewUser({...newUser, is_superuser: !!checked})} 
                                    />
                                    <Label htmlFor="is_superuser" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Grant Administrator Privileges
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 w-full" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isCreating ? "Creating..." : "Create Account"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search by name, email, or ID..." 
                        className="pl-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 dark:focus:ring-cyan-500" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="w-full sm:w-auto border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/50">
                        <TableRow className="border-slate-200 dark:border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4 pl-6">Role</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Full Name</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Email Address</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4">Join Date</TableHead>
                            <TableHead className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] py-4 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-500" />
                                        <span className="text-slate-500 dark:text-zinc-500 text-sm">Loading users...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow 
                                    key={user.id} 
                                    className="border-slate-100 dark:border-zinc-800/50 hover:bg-blue-50/30 dark:hover:bg-cyan-500/5 transition-all cursor-pointer group"
                                    onClick={() => {
                                        setSelectedUserId(user.id);
                                        setIsDetailModalOpen(true);
                                    }}
                                >
                                    <TableCell className="pl-6">
                                        {user.is_superuser ? (
                                            <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 text-[9px] font-bold">
                                                ADMIN
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 text-[9px] font-bold">
                                                STUDENT
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {user.first_name} {user.last_name || ''}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">ID: #{user.id}</div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-zinc-400">{user.email}</TableCell>
                                    <TableCell className="text-slate-500 dark:text-zinc-500 text-xs text-nowrap">
                                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white shadow-xl">
                                                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUserId(user.id);
                                                    setIsDetailModalOpen(true);
                                                }} className="cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
                                                    <Eye className="mr-2 h-4 w-4 text-blue-600 dark:text-cyan-500" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingUser(user);
                                                    setIsEditDialogOpen(true);
                                                }} className="cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
                                                    <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResetPassword(user.id);
                                                }} className="cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
                                                    <Key className="mr-2 h-4 w-4 text-slate-500" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(user.id);
                                                }} className="cursor-pointer text-red-600 hover:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User Information</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-zinc-400">
                            Update profile details for user #{editingUser?.id}.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">First Name</Label>
                                    <Input value={editingUser.first_name || ''} onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Last Name</Label>
                                    <Input value={editingUser.last_name || ''} onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-zinc-400">Mobile Number</Label>
                                    <Input value={editingUser.mobile || ''} onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value })} className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox 
                                        id="edit_is_superuser" 
                                        checked={editingUser.is_superuser} 
                                        onCheckedChange={(checked) => setEditingUser({...editingUser, is_superuser: !!checked})} 
                                    />
                                    <Label htmlFor="edit_is_superuser" className="text-sm font-medium leading-none">
                                        Administrator Access
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 w-full" disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* User Detail View */}
            <UserDetailModal 
                userId={selectedUserId}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
};

export default UsersPage;
