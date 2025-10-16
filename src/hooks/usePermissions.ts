import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomRole, SYSTEM_PERMISSIONS, DEFAULT_ROLES } from '@/types/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<any>({});

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    }
  }, [user]);

  // Initialize default roles on first load
  useEffect(() => {
    const existingRoles = localStorage.getItem('customRoles');
    if (!existingRoles) {
      localStorage.setItem('customRoles', JSON.stringify(DEFAULT_ROLES));
    }
  }, []);

  const loadUserPermissions = () => {
    const roles = JSON.parse(localStorage.getItem('customRoles') || '[]');
    let userRole = roles.find((role: CustomRole) => role.id === user?.role || role.name.toLowerCase() === user?.role?.toLowerCase());
    
    // If user role is 'admin' and not found, use the default admin role
    if (!userRole && user?.role === 'admin') {
      userRole = DEFAULT_ROLES.find(role => role.id === 'admin');
    }
    
    if (userRole) {
      setUserPermissions(userRole.permissions || {});
    } else {
      // Fallback to admin permissions for unknown roles
      setUserPermissions(DEFAULT_ROLES[0].permissions);
    }
  };

  const hasPermission = (resource: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    if (!user || !userPermissions[resource]) {
      return false;
    }
    return userPermissions[resource][action] === true;
  };

  const canView = (resource: string): boolean => hasPermission(resource, 'view');
  const canAdd = (resource: string): boolean => hasPermission(resource, 'add');
  const canEdit = (resource: string): boolean => hasPermission(resource, 'edit');
  const canDelete = (resource: string): boolean => hasPermission(resource, 'delete');

  const getAllRoles = (): CustomRole[] => {
    return JSON.parse(localStorage.getItem('customRoles') || '[]');
  };

  const createRole = (roleData: Omit<CustomRole, 'id' | 'createdAt' | 'createdBy'>): CustomRole => {
    const newRole: CustomRole = {
      ...roleData,
      id: `role_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Unknown'
    };

    const existingRoles = getAllRoles();
    const updatedRoles = [...existingRoles, newRole];
    localStorage.setItem('customRoles', JSON.stringify(updatedRoles));
    
    return newRole;
  };

  const updateRole = (roleId: string, updates: Partial<CustomRole>): boolean => {
    const roles = getAllRoles();
    const roleIndex = roles.findIndex(role => role.id === roleId);
    
    if (roleIndex === -1) return false;
    
    // Prevent updating system roles
    if (roles[roleIndex].isSystem) return false;
    
    roles[roleIndex] = { ...roles[roleIndex], ...updates };
    localStorage.setItem('customRoles', JSON.stringify(roles));
    
    return true;
  };

  const deleteRole = (roleId: string): boolean => {
    const roles = getAllRoles();
    const role = roles.find(r => r.id === roleId);
    
    // Prevent deleting system roles
    if (!role || role.isSystem) return false;
    
    const updatedRoles = roles.filter(r => r.id !== roleId);
    localStorage.setItem('customRoles', JSON.stringify(updatedRoles));
    
    return true;
  };

  const canAccessTab = (resource: string): boolean => {
    return canView(resource);
  };

  return {
    userPermissions,
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    canAccessTab,
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    loadUserPermissions
  };
};