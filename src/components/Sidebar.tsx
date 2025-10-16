import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, User, BarChart3, UserCog, Clock, Menu, ChevronLeft, Calendar, Mail, Settings, Megaphone, Shield, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, collapsed = false, onToggleCollapse }) => {
  const { user } = useAuth();
  const { canAccessTab } = usePermissions();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      permission: 'dashboard'
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: Users,
      permission: 'candidates'
    },
    {
      id: 'advanced-search',
      label: 'Advanced Search',
      icon: Search,
      permission: 'candidates'
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      permission: 'jobs'
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      permission: 'interviews'
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: UserCog,
      permission: 'team'
    },
    {
      id: 'timetracking',
      label: 'Time Tracking',
      icon: Clock,
      permission: 'time_tracking'
    },
    {
      id: 'emails',
      label: 'Email Logs',
      icon: Mail,
      permission: 'email_logs',
      adminOnly: true
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      permission: 'announcements_manage',
      adminOnly: true
    },
    {
      id: 'roles',
      label: 'Role Management',
      icon: Shield,
      permission: 'roles',
      adminOnly: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      permission: 'reports'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Settings,
      permission: 'users',
      adminOnly: true
    }
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg h-full border-r border-gray-200 transition-all duration-300 fixed left-0 top-0 z-30`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!collapsed && <h2 className="text-xl font-bold text-gray-800">Navigation</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Hide admin-only items for non-admin users (fallback)
            if (item.adminOnly && user?.role !== 'admin') {
              return null;
            }

            // Check permission-based access
            if (item.permission && !canAccessTab(item.permission)) {
              return null;
            }
            
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={collapsed ? '' : 'mr-3'} />
                {!collapsed && item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};