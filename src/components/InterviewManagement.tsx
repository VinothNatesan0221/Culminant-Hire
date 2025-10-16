import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, MapPin, Phone, Mail, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  jobCode: string;
  client: string;
  location: string;
  skill: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'Phone' | 'Video' | 'In-Person';
  interviewer: string;
  status: 'Scheduled' | 'L1 Scheduled' | 'L2 Scheduled' | 'Shortlisted' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes: string;
  recruiter: string;
  createdAt: string;
}

export const InterviewManagement: React.FC = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchTerm, statusFilter]);

  const loadInterviews = () => {
    // Load interviews from candidates who have "Schedule Interview" in status1
    const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    const existingInterviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    
    // Find candidates with "Schedule Interview" status1 who don't already have interviews
    const candidatesForInterview = candidates.filter((candidate: any) => 
      candidate.status === 'Processed' && candidate.status1 === 'Schedule Interview'
    );

    const newInterviews: Interview[] = [];
    
    candidatesForInterview.forEach((candidate: any) => {
      const existingInterview = existingInterviews.find((interview: Interview) => 
        interview.candidateId === candidate.id
      );
      
      if (!existingInterview) {
        const newInterview: Interview = {
          id: `interview_${candidate.id}_${Date.now()}`,
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          candidateMobile: candidate.mobile,
          jobCode: candidate.jobCode,
          client: candidate.client,
          location: candidate.location,
          skill: candidate.skill,
          interviewDate: '',
          interviewTime: '',
          interviewType: 'Phone',
          interviewer: '',
          status: 'Scheduled',
          notes: '',
          recruiter: candidate.recruiter,
          createdAt: new Date().toISOString()
        };
        newInterviews.push(newInterview);
      }
    });

    const allInterviews = [...existingInterviews, ...newInterviews];
    
    if (newInterviews.length > 0) {
      localStorage.setItem('interviews', JSON.stringify(allInterviews));
      toast.success(`${newInterviews.length} new interviews added from candidates`);
    }
    
    setInterviews(allInterviews);
  };

  const filterInterviews = () => {
    let filtered = interviews;

    if (searchTerm) {
      filtered = filtered.filter(interview =>
        Object.values(interview).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredInterviews(filtered);
  };

  const updateInterview = (interviewId: string, updates: Partial<Interview>) => {
    const updatedInterviews = interviews.map(interview =>
      interview.id === interviewId ? { ...interview, ...updates } : interview
    );
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
    setInterviews(updatedInterviews);
    
    // If status is changed to "Shortlisted", update candidate status
    if (updates.status === 'Shortlisted') {
      const interview = interviews.find(i => i.id === interviewId);
      if (interview) {
        const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
        const updatedCandidates = candidates.map((candidate: any) =>
          candidate.id === interview.candidateId
            ? { ...candidate, status: 'Shortlisted', status1: 'Selected for Final Round' }
            : candidate
        );
        localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
        toast.success('Candidate moved to Shortlisted in Candidates tab!');
      }
    } else {
      toast.success('Interview updated successfully');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'L1 Scheduled': 'bg-indigo-100 text-indigo-800',
      'L2 Scheduled': 'bg-purple-100 text-purple-800',
      'Shortlisted': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Rescheduled': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'Phone': return <Phone size={14} className="text-blue-500" />;
      case 'Video': return <Calendar size={14} className="text-green-500" />;
      case 'In-Person': return <MapPin size={14} className="text-purple-500" />;
      default: return <Calendar size={14} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
            <p className="text-xs text-muted-foreground">All interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === 'Scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === 'Completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.length > 0 
                ? Math.round((interviews.filter(i => i.status === 'Completed').length / interviews.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by candidate name, job code, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="L1 Scheduled">L1 Scheduled</SelectItem>
                  <SelectItem value="L2 Scheduled">L2 Scheduled</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Schedule</CardTitle>
          <p className="text-sm text-gray-600">
            Total: {interviews.length} | Filtered: {filteredInterviews.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white hover:bg-gray-800">
                  <TableHead className="text-white">Candidate</TableHead>
                  <TableHead className="text-white">Job Code</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Contact</TableHead>
                  <TableHead className="text-white">Interview Date</TableHead>
                  <TableHead className="text-white">Time</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Interviewer</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.map((interview, index) => (
                  <TableRow key={interview.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <TableCell>
                      <div className="font-medium">{interview.candidateName}</div>
                      <div className="text-sm text-gray-500">{interview.skill}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{interview.jobCode}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{interview.client}</div>
                      <div className="text-sm text-gray-500">{interview.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone size={12} />
                        <span>{interview.candidateMobile}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Mail size={12} />
                        <span className="truncate max-w-32">{interview.candidateEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={interview.interviewDate}
                        onChange={(e) => updateInterview(interview.id, { interviewDate: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={interview.interviewTime}
                        onChange={(e) => updateInterview(interview.id, { interviewTime: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getInterviewTypeIcon(interview.interviewType)}
                        <Select 
                          value={interview.interviewType} 
                          onValueChange={(value) => updateInterview(interview.id, { interviewType: value as any })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Video">Video</SelectItem>
                            <SelectItem value="In-Person">In-Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Interviewer name"
                        value={interview.interviewer}
                        onChange={(e) => updateInterview(interview.id, { interviewer: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={interview.status} 
                        onValueChange={(value) => updateInterview(interview.id, { status: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="L1 Scheduled">L1 Scheduled</SelectItem>
                          <SelectItem value="L2 Scheduled">L2 Scheduled</SelectItem>
                          <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Add notes for this interview:', interview.notes);
                          if (notes !== null) {
                            updateInterview(interview.id, { notes });
                          }
                        }}
                      >
                        Notes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredInterviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No interviews found</p>
              <p className="text-sm">Candidates with "Schedule Interview" status will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};