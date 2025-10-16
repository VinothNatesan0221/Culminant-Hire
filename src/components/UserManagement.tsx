import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { User } from '@/types';
import { hasPermission } from '@/utils/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendEmail } from '@/utils/emailService';
import { apiService } from '@/services/apiService';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'recruiter' as 'admin' | 'recruiter' | 'team-leader' | 'account-manager',
    password: ''
  });

  const canCreateUsers = hasPermission(currentUser?.role || '', 'users', 'create');
  const canEditUsers = hasPermission(currentUser?.role || '', 'users', 'edit');
  const canDeleteUsers = hasPermission(currentUser?.role || '', 'users', 'delete');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };
  

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const response = await apiService.updateUser(editingUser.id, updateData);
        
        if (response.success) {
          await loadUsers(); // Reload users from API
          toast.success('User updated successfully');
        } else {
          toast.error(response.message || 'Failed to update user');
          return;
        }
      } else {
        // Add new user
        const response = await apiService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        if (response.success && response.data) {
          await loadUsers(); // Reload users from API
          
          // Send welcome email with credentials
          try {
            await sendWelcomeEmail(response.data, formData.password);
            toast.success('User created successfully and welcome email sent');
          } catch (error) {
            toast.success('User created successfully but email failed to send');
          }
        } else {
          toast.error(response.message || 'Failed to create user');
          return;
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
      return;
    }
    

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await apiService.deleteUser(userId);
        
        if (response.success) {
          await loadUsers(); // Reload users from API
          toast.success('User deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'recruiter', password: '' });
    setEditingUser(null);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getUserPassword = (userId: string): string => {
    const passwords = JSON.parse(localStorage.getItem('userPasswords') || '{}');
    return passwords[userId] || 'password123';
  };

  const sendWelcomeEmail = async (user: User, password: string) => {
    try {
      const emailData = {
        to: user.email,
        toName: user.name,
        subject: 'Welcome to Recruitment Management System - Your Account Credentials',
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Welcome to Recruitment Management System</h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hello ${user.name},</h2>
              <p style="color: #475569; line-height: 1.6;">
                Your account has been successfully created in our Recruitment Management System. 
                You can now access the platform using the credentials below:
              </p>
            </div>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Login Credentials:</h3>
              <div style="background-color: white; padding: 15px; border-radius: 4px; font-family: monospace;">
                <p style="margin: 5px 0;"><strong>Email/Username:</strong> ${user.email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">🔒 Security Notice:</h4>
              <p style="color: #78350f; margin: 0; font-size: 14px;">
                For security reasons, please change your password after your first login. 
                Keep your credentials confidential and do not share them with anyone.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h4 style="color: #1e293b;">Getting Started:</h4>
              <ol style="color: #475569; line-height: 1.6;">
                <li>Visit the login page</li>
                <li>Enter your email and password</li>
                <li>Change your password in the profile settings</li>
                <li>Explore the features available for your role</li>
              </ol>
            </div>
            
            <div style="text-align: center; padding: 20px; background-color: #f1f5f9; border-radius: 6px;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                If you have any questions or need assistance, please contact your system administrator.
              </p>
              <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
                This email was sent automatically from the Recruitment Management System.
              </p>
            </div>
          </div>
        `
      };

      const success = await sendEmail(emailData);
      if (success) {
        // Log the email
        const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
        const newLog = {
          id: Date.now().toString(),
          recipientEmail: user.email,
          recipientName: user.name,
          subject: emailData.subject,
          message: 'Welcome email with credentials sent successfully',
          status: 'sent',
          sentBy: currentUser?.id || '1',
          sentAt: new Date().toISOString()
        };
        emailLogs.push(newLog);
        localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      toast.error('User created but failed to send welcome email');
    }
  };

  if (!canCreateUsers && !canEditUsers) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus size={16} className="mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: 'admin' | 'recruiter' | 'team-leader' | 'account-manager') => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="team-leader">Team Leader</SelectItem>
                        <SelectItem value="account-manager">Account Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                      required={!editingUser}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Update' : 'Create'} User
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {showPasswords[user.id] ? getUserPassword(user.id) : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showPasswords[user.id] ? (
                          <EyeOff size={14} className="text-gray-500" />
                        ) : (
                          <Eye size={14} className="text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {canEditUsers && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}
                      {canDeleteUsers && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};