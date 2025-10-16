import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Clock, Search, X, Bell, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'job' | 'candidate' | 'interview' | 'team';
  title: string;
  subtitle: string;
  data: any;
}

interface NavbarProps {
  onSearchResult?: (result: SearchResult) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchResult, onNavigateToTab }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState<string>('00:00:00');
  const [isClocked, setIsClocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [todayInterviews, setTodayInterviews] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      checkClockStatus();
      loadTodayInterviews();
      loadAnnouncements();
    }
  }, [user, currentTime]);

  useEffect(() => {
    // Load announcements and refresh periodically
    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTodayInterviews = () => {
    const today = new Date().toISOString().split('T')[0];
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    
    const todaysInterviews = interviews.filter((interview: any) => {
      const interviewDate = interview.interviewDate;
      return interviewDate === today && 
             (interview.status === 'Scheduled' || 
              interview.status === 'L1 Scheduled' || 
              interview.status === 'L2 Scheduled');
    });
    
    setTodayInterviews(todaysInterviews);
  };

  const loadAnnouncements = () => {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const allAnnouncements: any[] = [];

    // Interview Schedule Notifications
    const todaysInterviews = interviews.filter((interview: any) => {
      const interviewDate = interview.interviewDate ? new Date(interview.interviewDate).toISOString().split('T')[0] : null;
      return interviewDate === today && (interview.status === 'Scheduled' || interview.status === 'L1 Scheduled' || interview.status === 'L2 Scheduled');
    });

    todaysInterviews.forEach((interview: any) => {
      allAnnouncements.push({
        id: `interview-${interview.id}`,
        type: 'interview',
        title: 'Interview Scheduled Today',
        message: `${interview.candidateName} - ${interview.jobCode} at ${interview.interviewTime || 'Time TBD'}`,
        timestamp: new Date().toISOString(),
        priority: 'high',
        read: false
      });
    });

    // Job Code Created by Account Manager Notifications
    const recentJobs = jobs.filter((job: any) => {
      const jobDate = job.createdDate || job.date;
      if (!jobDate) return false;
      const daysDiff = Math.floor((new Date().getTime() - new Date(jobDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7; // Jobs created in last 7 days
    });

    recentJobs.forEach((job: any) => {
      allAnnouncements.push({
        id: `job-${job.id}`,
        type: 'job',
        title: 'New Job Code Created',
        message: `${job.jobCode} - ${job.client} (${job.skill}) by ${job.teamLead || 'Account Manager'}`,
        timestamp: job.createdDate || job.date,
        priority: 'medium',
        read: false
      });
    });

    // Admin Messages from localStorage
    announcements.forEach((announcement: any) => {
      allAnnouncements.push({
        ...announcement,
        type: 'admin'
      });
    });

    // Sort by timestamp (newest first)
    allAnnouncements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setAnnouncements(allAnnouncements);
    
    // Count unread announcements
    const unreadCount = allAnnouncements.filter(a => !a.read).length;
    setUnreadAnnouncements(unreadCount);
  };

  const markAnnouncementAsRead = (announcementId: string) => {
    const updatedAnnouncements = announcements.map(announcement =>
      announcement.id === announcementId
        ? { ...announcement, read: true }
        : announcement
    );
    setAnnouncements(updatedAnnouncements);
    
    // Update unread count
    const unreadCount = updatedAnnouncements.filter(a => !a.read).length;
    setUnreadAnnouncements(unreadCount);
  };

  const markAllAsRead = () => {
    const updatedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      read: true
    }));
    setAnnouncements(updatedAnnouncements);
    setUnreadAnnouncements(0);
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'interview': return '📅';
      case 'job': return '💼';
      case 'admin': return '📢';
      default: return '📄';
    }
  };

  const getAnnouncementColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const checkClockStatus = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const activeEntry = timeEntries.find((entry: any) => 
      entry.userId === user.id && entry.date === today && entry.status === 'clocked-in'
    );
    
    if (activeEntry) {
      setIsClocked(true);
      const clockInTime = new Date(activeEntry.clockInTime);
      const diff = currentTime.getTime() - clockInTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setWorkingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setIsClocked(false);
      setWorkingTime('00:00:00');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const performGlobalSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results: SearchResult[] = [];
    const searchLower = term.toLowerCase();

    // Search Jobs
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    jobs.forEach((job: any) => {
      if (
        job.jobCode?.toLowerCase().includes(searchLower) ||
        job.client?.toLowerCase().includes(searchLower) ||
        job.skill?.toLowerCase().includes(searchLower) ||
        job.workLocation?.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: job.id,
          type: 'job',
          title: `${job.jobCode} - ${job.client}`,
          subtitle: `${job.skill} | ${job.workLocation || 'Location not specified'}`,
          data: job
        });
      }
    });

    // Search Candidates
    const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    candidates.forEach((candidate: any) => {
      if (
        candidate.name?.toLowerCase().includes(searchLower) ||
        candidate.email?.toLowerCase().includes(searchLower) ||
        candidate.mobile?.toLowerCase().includes(searchLower) ||
        candidate.jobCode?.toLowerCase().includes(searchLower) ||
        candidate.client?.toLowerCase().includes(searchLower) ||
        candidate.skill?.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: candidate.id,
          type: 'candidate',
          title: candidate.name,
          subtitle: `${candidate.jobCode} | ${candidate.client} | ${candidate.skill}`,
          data: candidate
        });
      }
    });

    // Search Interviews
    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    interviews.forEach((interview: any) => {
      if (
        interview.candidateName?.toLowerCase().includes(searchLower) ||
        interview.jobCode?.toLowerCase().includes(searchLower) ||
        interview.client?.toLowerCase().includes(searchLower) ||
        interview.interviewer?.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: interview.id,
          type: 'interview',
          title: `Interview: ${interview.candidateName}`,
          subtitle: `${interview.jobCode} | ${interview.client} | ${interview.status}`,
          data: interview
        });
      }
    });

    // Search Team Members
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    teamMembers.forEach((member: any) => {
      if (
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.role?.toLowerCase().includes(searchLower) ||
        member.department?.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: member.id,
          type: 'team',
          title: member.name,
          subtitle: `${member.role} | ${member.department || 'No department'}`,
          data: member
        });
      }
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setShowResults(true);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performGlobalSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');
    
    // Navigate to appropriate tab
    const tabMap = {
      job: 'jobs',
      candidate: 'candidates',
      interview: 'interviews',
      team: 'team'
    };
    
    if (onNavigateToTab) {
      onNavigateToTab(tabMap[result.type]);
    }
    
    if (onSearchResult) {
      onSearchResult(result);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'job': return '💼';
      case 'candidate': return '👤';
      case 'interview': return '📅';
      case 'team': return '👥';
      default: return '📄';
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-800';
      case 'candidate': return 'bg-green-100 text-green-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Recruitment Portal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, candidates, interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-80"
                  onFocus={() => searchTerm && setShowResults(true)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
                  <CardContent className="p-0">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getResultIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <Badge className={`text-xs ${getResultTypeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* No Results Message */}
              {showResults && searchTerm && searchResults.length === 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">No results found for "{searchTerm}"</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Working Timer */}
            {isClocked && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                <Clock size={16} className="text-green-600" />
                <span className="text-sm font-mono font-semibold text-green-700">
                  {workingTime}
                </span>
                <span className="text-xs text-green-600">Working</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};