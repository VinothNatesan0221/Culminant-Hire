import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CandidateManagement } from './CandidateManagement';
import { JobManagement } from './JobManagement';
import { UserManagement } from './UserManagement';
import { TeamManagement } from './TeamManagement';
import { TimeTracking } from './TimeTracking';
import { InterviewManagement } from './InterviewManagement';
import { RoleManagement } from './RoleManagement';
import { Reports } from './Reports';
import { AdvancedSearch } from './AdvancedSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, UserCheck, TrendingUp, Calendar, Target } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchHighlight, setSearchHighlight] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    placements: 0,
    successRate: 0,
    teamMembers: 0,
    monthlyTarget: 0,
    totalInterviews: 0,
    scheduledInterviews: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    // Refresh dashboard stats when activeTab changes back to dashboard
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeTab]);

  const loadDashboardStats = () => {
    const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    
    const processedCandidates = candidates.filter((c: any) => c.status === 'Processed').length;
    const activeJobs = jobs.filter((j: any) => j.status === 'Active').length;
    const totalCandidates = candidates.length;
    const successRate = totalCandidates > 0 ? (processedCandidates / totalCandidates) * 100 : 0;
    const activeTeamMembers = teamMembers.filter((m: any) => m.status === 'active').length;
    const monthlyTarget = teamMembers.reduce((sum: number, member: any) => sum + (member.targetThisMonth || 0), 0);

    setDashboardStats({
      totalCandidates,
      activeJobs,
      placements: processedCandidates,
      successRate: Math.round(successRate * 10) / 10,
      teamMembers: activeTeamMembers,
      monthlyTarget,
      totalInterviews: interviews.length,
      scheduledInterviews: interviews.filter((i: any) => i.status === 'Scheduled').length
    });
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your recruitment process
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Registered candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.placements}</div>
            <p className="text-xs text-muted-foreground">Successful placements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Placement success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">All interviews scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
                const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
                const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
                
                const recentActivities = [
                  ...candidates.slice(-2).map((c: any) => ({
                    type: 'candidate',
                    message: `New candidate added: ${c.name}`,
                    time: new Date(c.date || Date.now()).getTime(),
                    color: 'blue'
                  })),
                  ...jobs.slice(-2).map((j: any) => ({
                    type: 'job',
                    message: `Job posted: ${j.title || j.jobTitle || j.name || 'Untitled Job'}`,
                    time: new Date(j.createdAt || j.date || Date.now()).getTime(),
                    color: 'green'
                  })),
                  ...interviews.slice(-2).map((i: any) => ({
                    type: 'interview',
                    message: `Interview scheduled: ${i.candidateName}`,
                    time: new Date(i.createdAt || Date.now()).getTime(),
                    color: 'yellow'
                  }))
                ].sort((a, b) => b.time - a.time).slice(0, 4);

                return recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                    <p className="text-sm">{activity.message}</p>
                    <span className="text-xs text-gray-500 ml-auto">
                      {Math.floor((Date.now() - activity.time) / (1000 * 60 * 60))}h ago
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    P
                  </div>
                  <span className="text-sm font-medium">Pancharatna</span>
                </div>
                <span className="text-sm text-gray-500">15 placements</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    D
                  </div>
                  <span className="text-sm font-medium">Divya Bharathi</span>
                </div>
                <span className="text-sm text-gray-500">12 placements</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    R
                  </div>
                  <span className="text-sm font-medium">Rajesh Kumar</span>
                </div>
                <span className="text-sm text-gray-500">8 placements</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-screen">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={user?.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            {activeTab === 'dashboard' && renderDashboardContent()}
            {activeTab === 'candidates' && <CandidateManagement />}
            {activeTab === 'advanced-search' && <AdvancedSearch />}
            {activeTab === 'jobs' && <JobManagement />}
            {activeTab === 'interviews' && <InterviewManagement />}
            {activeTab === 'team' && <TeamManagement />}
            {activeTab === 'timetracking' && <TimeTracking />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'roles' && user?.role === 'admin' && <RoleManagement />}
            {activeTab === 'users' && user?.role === 'admin' && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};