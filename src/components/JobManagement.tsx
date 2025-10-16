import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

interface Job {
  id: string;
  requirementSharedDate: string;
  jobCode: string;
  client: string;
  skillType: string;
  skill: string;
  clientSpoc: string;
  budget: string;
  culminantSpoc: string;
  teamLead: string;
  principleConsultant: string;
  weekDayWeekEnd: string;
  workLocation: string;
  openPosition: string;
  status: string;
}

export const JobManagement: React.FC = () => {
  const { user } = useAuth();
  const { sendJobCreatedEmail } = useEmailNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    requirementSharedDate: new Date().toISOString().split('T')[0],
    jobCode: '',
    client: '',
    skillType: '',
    skill: '',
    clientSpoc: '',
    budget: '',
    culminantSpoc: user?.name || '',
    teamLead: '',
    principleConsultant: '',
    weekDayWeekEnd: '',
    workLocation: '',
    openPosition: '',
    status: 'Open'
  });

  const generateJobCode = () => {
    const existingJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const jobCount = existingJobs.length + 1;
    const paddedNumber = jobCount.toString().padStart(3, '0');
    return `JC-Cul-${paddedNumber}`;
  };

  const skillTypes = [
    'Technical',
    'Functional',
    'Management',
    'Creative',
    'Sales',
    'Support'
  ];

  const workLocationOptions = [
    'Remote',
    'On-site',
    'Hybrid',
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Pune',
    'Hyderabad',
    'Chennai'
  ];

  const weekDayWeekEndOptions = [
    'WeekDay Only',
    'WeekEnd Only',
    'Both WeekDay & WeekEnd',
    'Flexible'
  ];

  const statusOptions = [
    'Open',
    'In Progress',
    'On Hold',
    'Closed',
    'Cancelled'
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const loadJobs = () => {
    const savedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    setJobs(savedJobs);
  };

  const saveJobs = (updatedJobs: Job[]) => {
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    setJobs(updatedJobs);
  };

  const filterJobs = () => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
      return;
    }
    const filtered = jobs.filter(job =>
      Object.values(job).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredJobs(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobCode || !formData.client || !formData.skill) {
      toast.error('Please fill in required fields (Job Code, Client, Skill)');
      return;
    }

    const existingJobs = [...jobs];
    if (editingJob) {
      const updatedJobs = existingJobs.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...formData }
          : job
      );
      saveJobs(updatedJobs);
      toast.success('Job updated successfully');
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        ...formData
      };
      saveJobs([...existingJobs, newJob]);
      toast.success('Job created successfully');
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      requirementSharedDate: job.requirementSharedDate,
      jobCode: job.jobCode,
      client: job.client,
      skillType: job.skillType,
      skill: job.skill,
      clientSpoc: job.clientSpoc,
      budget: job.budget,
      culminantSpoc: job.culminantSpoc,
      teamLead: job.teamLead,
      principleConsultant: job.principleConsultant,
      weekDayWeekEnd: job.weekDayWeekEnd,
      workLocation: job.workLocation,
      openPosition: job.openPosition,
      status: job.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      saveJobs(updatedJobs);
      toast.success('Job deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      requirementSharedDate: new Date().toISOString().split('T')[0],
      jobCode: generateJobCode(),
      client: '',
      skillType: '',
      skill: '',
      clientSpoc: '',
      budget: '',
      culminantSpoc: user?.name || '',
      teamLead: '',
      principleConsultant: '',
      weekDayWeekEnd: '',
      workLocation: '',
      openPosition: '',
      status: 'Open'
    });
    setEditingJob(null);
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Requirement Shared Date', 'Job Code', 'Client', 'Skill Type', 'Skill', 'Client SPOC', 'Budget', 'Culminant SPOC', 'Team Lead', 'Principle Consultant', 'WeekDay/WeekEnd', 'Work Location', 'Open Position', 'Status'],
      ...filteredJobs.map(j => [
        j.requirementSharedDate, j.jobCode, j.client, j.skillType, j.skill, j.clientSpoc, j.budget, 
        j.culminantSpoc, j.teamLead, j.principleConsultant, j.weekDayWeekEnd, j.workLocation, j.openPosition, j.status
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Jobs exported to CSV');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2" size={20} />
                Search Jobs
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Filter Jobs by Code, Client, Skill, and More...</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>Total jobs: {jobs.length}</span>
                <span>Filtered jobs: {filteredJobs.length}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by job code, client, skill, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Job Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus size={16} className="mr-2" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requirementSharedDate">Requirement Shared Date *</Label>
                    <Input
                      id="requirementSharedDate"
                      type="date"
                      value={formData.requirementSharedDate}
                      onChange={(e) => setFormData({ ...formData, requirementSharedDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobCode">Job Code *</Label>
                    <Input
                      id="jobCode"
                      value={formData.jobCode}
                      onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                      placeholder="Auto-generated (e.g., JC-Cul-001)"
                      required
                      readOnly={!editingJob}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">Client *</Label>
                    <Input
                      id="client"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="Client company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="skillType">Skill Type</Label>
                    <Select value={formData.skillType} onValueChange={(value) => setFormData({ ...formData, skillType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill type" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="skill">Skill *</Label>
                    <Input
                      id="skill"
                      value={formData.skill}
                      onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                      placeholder="Required skill/technology"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientSpoc">Client SPOC</Label>
                    <Input
                      id="clientSpoc"
                      value={formData.clientSpoc}
                      onChange={(e) => setFormData({ ...formData, clientSpoc: e.target.value })}
                      placeholder="Client point of contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="Budget range"
                    />
                  </div>
                  <div>
                    <Label htmlFor="culminantSpoc">Culminant SPOC</Label>
                    <Input
                      id="culminantSpoc"
                      value={formData.culminantSpoc}
                      onChange={(e) => setFormData({ ...formData, culminantSpoc: e.target.value })}
                      placeholder="Internal point of contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamLead">Team Lead</Label>
                    <Input
                      id="teamLead"
                      value={formData.teamLead}
                      onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                      placeholder="Team lead name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="principleConsultant">Principle Consultant</Label>
                    <Input
                      id="principleConsultant"
                      value={formData.principleConsultant}
                      onChange={(e) => setFormData({ ...formData, principleConsultant: e.target.value })}
                      placeholder="Principle consultant name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekDayWeekEnd">WeekDay / WeekEnd</Label>
                    <Select value={formData.weekDayWeekEnd} onValueChange={(value) => setFormData({ ...formData, weekDayWeekEnd: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDayWeekEndOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workLocation">Work Location</Label>
                    <Select value={formData.workLocation} onValueChange={(value) => setFormData({ ...formData, workLocation: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work location" />
                      </SelectTrigger>
                      <SelectContent>
                        {workLocationOptions.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="openPosition">Open Position</Label>
                    <Input
                      id="openPosition"
                      type="number"
                      value={formData.openPosition}
                      onChange={(e) => setFormData({ ...formData, openPosition: e.target.value })}
                      placeholder="Number of open positions"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingJob ? 'Update' : 'Create'} Job
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white hover:bg-gray-800">
                  <TableHead className="text-white">Req. Date</TableHead>
                  <TableHead className="text-white">Job Code</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Skill Type</TableHead>
                  <TableHead className="text-white">Skill</TableHead>
                  <TableHead className="text-white">Client SPOC</TableHead>
                  <TableHead className="text-white">Budget</TableHead>
                  <TableHead className="text-white">Work Location</TableHead>
                  <TableHead className="text-white">Open Positions</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job, index) => (
                  <TableRow key={job.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <TableCell>{job.requirementSharedDate}</TableCell>
                    <TableCell className="font-medium">{job.jobCode}</TableCell>
                    <TableCell>{job.client}</TableCell>
                    <TableCell>{job.skillType}</TableCell>
                    <TableCell>{job.skill}</TableCell>
                    <TableCell>{job.clientSpoc}</TableCell>
                    <TableCell>{job.budget}</TableCell>
                    <TableCell>{job.workLocation}</TableCell>
                    <TableCell>{job.openPosition}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={job.status === 'Open' ? 'default' : 
                                job.status === 'Closed' ? 'secondary' : 
                                job.status === 'Cancelled' ? 'destructive' : 'outline'}
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(job)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No jobs found. Click "Create Job" to add your first job.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};