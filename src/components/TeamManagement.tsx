import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Users, Target, TrendingUp, Award, UserPlus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Team, User } from '@/types';
import { hasPermission } from '@/utils/permissions';

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    leaderId: ''
  });

  const [memberFormData, setMemberFormData] = useState({
    userId: '',
    teamId: ''
  });

  const canManageTeams = hasPermission(user?.role || '', 'team', 'create');
  const canViewTeams = hasPermission(user?.role || '', 'team', 'view');

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  const loadTeams = () => {
    const savedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
    if (savedTeams.length === 0) {
      const defaultTeams: Team[] = [
        {
          id: 'team-a',
          name: 'Team A',
          description: 'Technical Recruitment Team',
          leaderId: '',
          memberIds: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'team-b',
          name: 'Team B',
          description: 'Non-Technical Recruitment Team',
          leaderId: '',
          memberIds: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'team-c',
          name: 'Team C',
          description: 'Executive Search Team',
          leaderId: '',
          memberIds: [],
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('teams', JSON.stringify(defaultTeams));
      setTeams(defaultTeams);
    } else {
      setTeams(savedTeams);
    }
  };

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(savedUsers);
  };

  const saveTeams = (updatedTeams: Team[]) => {
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleCreateTeam = () => {
    if (!teamFormData.name || !teamFormData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamFormData.name,
      description: teamFormData.description,
      leaderId: teamFormData.leaderId,
      memberIds: teamFormData.leaderId ? [teamFormData.leaderId] : [],
      createdAt: new Date().toISOString()
    };

    // Update team leader's teamId if selected
    if (teamFormData.leaderId) {
      const updatedUsers = users.map(u => 
        u.id === teamFormData.leaderId ? { ...u, teamId: newTeam.id } : u
      );
      saveUsers(updatedUsers);
    }

    saveTeams([...teams, newTeam]);
    setTeamFormData({ name: '', description: '', leaderId: '' });
    setIsTeamDialogOpen(false);
    toast.success('Team created successfully');
  };

  const handleAddMemberToTeam = () => {
    if (!memberFormData.userId || !memberFormData.teamId) {
      toast.error('Please select both user and team');
      return;
    }

    // Update user's teamId
    const updatedUsers = users.map(u => 
      u.id === memberFormData.userId ? { ...u, teamId: memberFormData.teamId } : u
    );
    saveUsers(updatedUsers);

    // Update team's memberIds
    const updatedTeams = teams.map(t => 
      t.id === memberFormData.teamId 
        ? { ...t, memberIds: [...t.memberIds, memberFormData.userId] }
        : t
    );
    saveTeams(updatedTeams);

    setMemberFormData({ userId: '', teamId: '' });
    setIsMemberDialogOpen(false);
    toast.success('Member added to team successfully');
  };

  const removeMemberFromTeam = (userId: string, teamId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      // Update user's teamId
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, teamId: undefined } : u
      );
      saveUsers(updatedUsers);

      // Update team's memberIds
      const updatedTeams = teams.map(t => 
        t.id === teamId 
          ? { ...t, memberIds: t.memberIds.filter(id => id !== userId) }
          : t
      );
      saveTeams(updatedTeams);

      toast.success('Member removed from team');
    }
  };

  const getTeamMembers = (teamId: string) => {
    return users.filter(u => u.teamId === teamId);
  };

  const getTeamLeader = (leaderId: string) => {
    return users.find(u => u.id === leaderId);
  };

  const getUsersWithoutTeam = () => {
    return users.filter(u => !u.teamId && u.role !== 'admin');
  };

  if (!canViewTeams) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to view team management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.teamId).length}
            </div>
            <p className="text-xs text-muted-foreground">Assigned to teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Leaders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter(t => t.leaderId).length}
            </div>
            <p className="text-xs text-muted-foreground">Teams with leaders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Users</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getUsersWithoutTeam().length}
            </div>
            <p className="text-xs text-muted-foreground">Users without teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Management Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Manage teams and assign members</p>
            </div>
            <div className="flex space-x-2">
              {canManageTeams && (
                <>
                  <Button onClick={() => setIsTeamDialogOpen(true)} variant="outline">
                    <Plus size={16} className="mr-2" />
                    Create Team
                  </Button>
                  <Button onClick={() => setIsMemberDialogOpen(true)}>
                    <UserPlus size={16} className="mr-2" />
                    Add Member
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="members">All Members</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => {
                  const teamMembers = getTeamMembers(team.id);
                  const teamLeader = getTeamLeader(team.leaderId);
                  
                  return (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <p className="text-sm text-gray-600">{team.description}</p>
                          </div>
                          {canManageTeams && (
                            <Button variant="ghost" size="sm">
                              <Settings size={16} />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Team Leader</p>
                            <p className="text-sm text-gray-600">
                              {teamLeader ? teamLeader.name : 'Not assigned'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Members ({teamMembers.length})</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {teamMembers.slice(0, 3).map((member) => (
                                <Badge key={member.id} variant="secondary" className="text-xs">
                                  {member.name}
                                </Badge>
                              ))}
                              {teamMembers.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{teamMembers.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.teamId).map((member) => {
                    const memberTeam = teams.find(t => t.id === member.teamId);
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {member.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {memberTeam?.name || 'No Team'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canManageTeams && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMemberFromTeam(member.id, member.teamId!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="unassigned" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUsersWithoutTeam().map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canManageTeams && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMemberFormData({ userId: user.id, teamId: '' });
                              setIsMemberDialogOpen(true);
                            }}
                          >
                            <UserPlus size={14} className="mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description *</Label>
              <Input
                id="team-description"
                value={teamFormData.description}
                onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                placeholder="Enter team description"
              />
            </div>
            <div>
              <Label htmlFor="team-leader">Team Leader (Optional)</Label>
              <Select value={teamFormData.leaderId} onValueChange={(value) => setTeamFormData({ ...teamFormData, leaderId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'team-leader' && !u.teamId).map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="select-user">Select User *</Label>
              <Select value={memberFormData.userId} onValueChange={(value) => setMemberFormData({ ...memberFormData, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {getUsersWithoutTeam().map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="select-team">Select Team *</Label>
              <Select value={memberFormData.teamId} onValueChange={(value) => setMemberFormData({ ...memberFormData, teamId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMemberToTeam}>
                Add to Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};