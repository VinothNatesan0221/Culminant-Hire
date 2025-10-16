import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, Edit2, Trash2, Users, Lock, Unlock } from 'lucide-react';
import { CustomRole, SYSTEM_PERMISSIONS } from '@/types/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const RoleManagement: React.FC = () => {
  const { user } = useAuth();
  const { getAllRoles, createRole, updateRole, deleteRole, canView, canAdd, canEdit, canDelete } = usePermissions();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {} as any
  });

  useEffect(() => {
    if (canView('roles')) {
      loadRoles();
    }
  }, []);

  const loadRoles = () => {
    const allRoles = getAllRoles();
    setRoles(allRoles);
  };

  const initializePermissions = () => {
    const permissions: any = {};
    SYSTEM_PERMISSIONS.forEach(perm => {
      permissions[perm.id] = {
        view: false,
        add: false,
        edit: false,
        delete: false
      };
    });
    return permissions;
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!canAdd('roles')) {
      toast.error('You do not have permission to create roles');
      return;
    }

    try {
      createRole({
        name: newRole.name,
        description: newRole.description,
        isSystem: false,
        permissions: newRole.permissions
      });

      setNewRole({
        name: '',
        description: '',
        permissions: {}
      });
      setIsCreating(false);
      loadRoles();
      toast.success('Role created successfully');
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = () => {
    if (!editingRole || !canEdit('roles')) {
      toast.error('You do not have permission to edit roles');
      return;
    }

    try {
      updateRole(editingRole.id, {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions
      });

      setEditingRole(null);
      loadRoles();
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (!canDelete('roles')) {
      toast.error('You do not have permission to delete roles');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      if (deleteRole(roleId)) {
        loadRoles();
        toast.success('Role deleted successfully');
      } else {
        toast.error('Cannot delete system roles');
      }
    }
  };

  const handlePermissionChange = (
    permissions: any,
    setPermissions: (perms: any) => void,
    permissionId: string,
    action: string,
    value: boolean
  ) => {
    setPermissions({
      ...permissions,
      [permissionId]: {
        ...permissions[permissionId],
        [action]: value
      }
    });
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: typeof SYSTEM_PERMISSIONS } = {};
    SYSTEM_PERMISSIONS.forEach(perm => {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    });
    return categories;
  };

  const PermissionMatrix: React.FC<{
    permissions: any;
    setPermissions: (perms: any) => void;
    disabled?: boolean;
  }> = ({ permissions, setPermissions, disabled = false }) => {
    const categories = getPermissionsByCategory();

    return (
      <div className="space-y-6">
        {Object.entries(categories).map(([category, perms]) => (
          <div key={category} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-900">{category}</h4>
            <div className="space-y-3">
              {perms.map(perm => (
                <div key={perm.id} className="grid grid-cols-5 gap-4 items-center py-2 border-b last:border-b-0">
                  <div className="col-span-1">
                    <div className="font-medium text-sm">{perm.name}</div>
                    <div className="text-xs text-gray-500">{perm.description}</div>
                  </div>
                  {['view', 'add', 'edit', 'delete'].map(action => (
                    <div key={action} className="flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-xs font-medium capitalize">{action}</span>
                        <Switch
                          checked={permissions[perm.id]?.[action] || false}
                          onCheckedChange={(value) => 
                            handlePermissionChange(permissions, setPermissions, perm.id, action, value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Temporarily disable permission check for debugging
  // if (!canView('roles')) {
  //   return (
  //     <div className="p-6 text-center">
  //       <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
  //       <p className="text-gray-500">You do not have permission to view roles</p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="mr-2" size={20} />
              Role Management
            </CardTitle>
            {canAdd('roles') && (
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setNewRole({
                      name: '',
                      description: '',
                      permissions: initializePermissions()
                    });
                  }}>
                    <Plus size={16} className="mr-2" />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Role Name</label>
                        <Input
                          placeholder="Enter role name"
                          value={newRole.name}
                          onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="Enter role description"
                          value={newRole.description}
                          onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-3 block">Permissions</label>
                      <PermissionMatrix
                        permissions={newRole.permissions}
                        setPermissions={(perms) => setNewRole({...newRole, permissions: perms})}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleCreateRole}>Create Role</Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge variant={role.isSystem ? 'default' : 'secondary'}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>{role.createdBy}</TableCell>
                  <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {canEdit('roles') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRole(role)}
                              disabled={role.isSystem}
                            >
                              <Edit2 size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
                            </DialogHeader>
                            {editingRole && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Role Name</label>
                                    <Input
                                      value={editingRole.name}
                                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                      disabled={editingRole.isSystem}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                      value={editingRole.description}
                                      onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                                      disabled={editingRole.isSystem}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium mb-3 block">Permissions</label>
                                  <PermissionMatrix
                                    permissions={editingRole.permissions}
                                    setPermissions={(perms) => setEditingRole({...editingRole, permissions: perms})}
                                    disabled={editingRole.isSystem}
                                  />
                                </div>
                                
                                {!editingRole.isSystem && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button onClick={handleUpdateRole}>Update Role</Button>
                                    <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDelete('roles') && !role.isSystem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
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