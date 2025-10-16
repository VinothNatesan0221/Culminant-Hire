import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Calendar, User, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  clockInTime: string;
  clockOutTime?: string;
  date: string;
  totalHours?: number;
  status: 'clocked-in' | 'clocked-out';
}

export const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<TimeEntry | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    loadTimeEntries();
    loadUsers();
    checkCurrentUserStatus();
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [timeEntries, filterDate, filterUser]);

  const loadTimeEntries = () => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setTimeEntries(savedEntries);
  };

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setAllUsers(savedUsers);
  };

  const saveTimeEntries = (entries: TimeEntry[]) => {
    localStorage.setItem('timeEntries', JSON.stringify(entries));
    setTimeEntries(entries);
  };

  const checkCurrentUserStatus = () => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = savedEntries.find((entry: TimeEntry) => 
      entry.userId === user?.id && entry.date === today && entry.status === 'clocked-in'
    );
    setCurrentUserEntry(todayEntry || null);
  };

  const filterEntries = () => {
    let filtered = timeEntries;

    if (filterDate) {
      filtered = filtered.filter(entry => entry.date === filterDate);
    }

    if (filterUser && filterUser !== 'all') {
      filtered = filtered.filter(entry => entry.userId === filterUser);
    }

    // Sort by date and time (newest first)
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime();
    });

    setFilteredEntries(filtered);
  };

  const handleClockIn = () => {
    if (!user) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if user already clocked in today
    const existingEntry = timeEntries.find(entry => 
      entry.userId === user.id && entry.date === today && entry.status === 'clocked-in'
    );

    if (existingEntry) {
      toast.error('You are already clocked in today');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      clockInTime: now.toISOString(),
      date: today,
      status: 'clocked-in'
    };

    const updatedEntries = [...timeEntries, newEntry];
    saveTimeEntries(updatedEntries);
    setCurrentUserEntry(newEntry);
    toast.success('Clocked in successfully');
  };

  const handleClockOut = () => {
    if (!user || !currentUserEntry) return;

    const now = new Date();
    const clockInTime = new Date(currentUserEntry.clockInTime);
    const totalHours = Math.round(((now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;

    const updatedEntry = {
      ...currentUserEntry,
      clockOutTime: now.toISOString(),
      totalHours,
      status: 'clocked-out' as const
    };

    const updatedEntries = timeEntries.map(entry => 
      entry.id === currentUserEntry.id ? updatedEntry : entry
    );

    saveTimeEntries(updatedEntries);
    setCurrentUserEntry(null);
    toast.success(`Clocked out successfully. Total hours: ${totalHours}`);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'clocked-in' ? (
      <Badge className="bg-green-100 text-green-800">Clocked In</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Clocked Out</Badge>
    );
  };

  const CurrentTimeDisplay = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    return (
      <span>
        {currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </span>
    );
  };

  // Only show admin view if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        {/* User Clock In/Out Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" size={20} />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-2xl font-mono">
                <CurrentTimeDisplay />
              </div>
              <div className="text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              {currentUserEntry ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Clocked in at</div>
                    <div className="text-lg font-semibold text-green-800">
                      {formatTime(currentUserEntry.clockInTime)}
                    </div>
                  </div>
                  <Button 
                    onClick={handleClockOut}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    <LogOut className="mr-2" size={16} />
                    Clock Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleClockIn}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <LogIn className="mr-2" size={16} />
                  Clock In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User's Personal Time History */}
        <Card>
          <CardHeader>
            <CardTitle>My Time History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries
                    .filter(entry => entry.userId === user?.id)
                    .slice(0, 10)
                    .map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                      <TableCell>
                        {entry.clockOutTime ? formatTime(entry.clockOutTime) : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.totalHours ? `${entry.totalHours}h` : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin view - can see all users' time tracking
  return (
    <div className="space-y-6">
      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Clocked In</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.filter(entry => entry.status === 'clocked-in').length}
            </div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Clock in/out today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
            <p className="text-xs text-muted-foreground">All time entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.filter(e => e.totalHours).length > 0 
                ? Math.round(timeEntries.filter(e => e.totalHours).reduce((sum, e) => sum + (e.totalHours || 0), 0) / timeEntries.filter(e => e.totalHours).length * 10) / 10
                : 0}h
            </div>
            <p className="text-xs text-muted-foreground">Per completed day</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2" size={20} />
            Time Tracking Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
            <div className="flex-1">
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterDate('');
                setFilterUser('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white hover:bg-gray-800">
                  <TableHead className="text-white">User</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Clock In</TableHead>
                  <TableHead className="text-white">Clock Out</TableHead>
                  <TableHead className="text-white">Total Hours</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span>{entry.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{formatTime(entry.clockInTime)}</TableCell>
                    <TableCell>
                      {entry.clockOutTime ? formatTime(entry.clockOutTime) : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.totalHours ? `${entry.totalHours}h` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};