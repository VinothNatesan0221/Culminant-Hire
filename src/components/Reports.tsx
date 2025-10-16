import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, Users, Briefcase, Calendar, Download, Filter, PieChart, CalendarIcon } from 'lucide-react';

interface ReportData {
  candidateReports: any[];
  jobReports: any[];
  interviewReports: any[];
  teamPerformance: any[];
  monthlyStats: any[];
}

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    candidateReports: [],
    jobReports: [],
    interviewReports: [],
    teamPerformance: [],
    monthlyStats: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('last2months');
  const [activeReport, setActiveReport] = useState('overview');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filteredData, setFilteredData] = useState<ReportData>({
    candidateReports: [],
    jobReports: [],
    interviewReports: [],
    teamPerformance: [],
    monthlyStats: []
  });

  useEffect(() => {
    generateSampleData();
  }, []);

  useEffect(() => {
    filterDataByDateRange();
  }, [reportData, selectedPeriod, customDateRange]);

  const generateSampleData = () => {
    // Generate 2 months of sample data
    const currentDate = new Date();
    const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
    
    // Sample candidate data
    const candidateReports = [
      { id: 1, name: 'John Smith', position: 'Software Engineer', status: 'Hired', appliedDate: '2024-07-15', salary: 85000, recruiter: 'Alice Johnson' },
      { id: 2, name: 'Sarah Wilson', position: 'Product Manager', status: 'Interview', appliedDate: '2024-07-20', salary: 95000, recruiter: 'Bob Chen' },
      { id: 3, name: 'Mike Davis', position: 'UX Designer', status: 'Rejected', appliedDate: '2024-07-25', salary: 75000, recruiter: 'Alice Johnson' },
      { id: 4, name: 'Emily Brown', position: 'Data Analyst', status: 'Hired', appliedDate: '2024-08-05', salary: 70000, recruiter: 'Carol White' },
      { id: 5, name: 'David Lee', position: 'DevOps Engineer', status: 'Pending', appliedDate: '2024-08-10', salary: 90000, recruiter: 'Bob Chen' },
      { id: 6, name: 'Lisa Garcia', position: 'Marketing Manager', status: 'Hired', appliedDate: '2024-08-15', salary: 80000, recruiter: 'Alice Johnson' },
      { id: 7, name: 'Tom Wilson', position: 'Backend Developer', status: 'Interview', appliedDate: '2024-08-20', salary: 88000, recruiter: 'Carol White' },
      { id: 8, name: 'Anna Martinez', position: 'Frontend Developer', status: 'Hired', appliedDate: '2024-09-01', salary: 82000, recruiter: 'Bob Chen' },
      { id: 9, name: 'James Taylor', position: 'QA Engineer', status: 'Rejected', appliedDate: '2024-09-05', salary: 65000, recruiter: 'Alice Johnson' },
      { id: 10, name: 'Rachel Green', position: 'Project Manager', status: 'Pending', appliedDate: '2024-09-10', salary: 92000, recruiter: 'Carol White' }
    ];

    // Sample job reports
    const jobReports = [
      { id: 1, title: 'Senior Software Engineer', department: 'Engineering', posted: '2024-07-10', applications: 45, hired: 2, status: 'Active' },
      { id: 2, title: 'Product Manager', department: 'Product', posted: '2024-07-15', applications: 32, hired: 1, status: 'Filled' },
      { id: 3, title: 'UX Designer', department: 'Design', posted: '2024-07-20', applications: 28, hired: 1, status: 'Active' },
      { id: 4, title: 'Data Scientist', department: 'Analytics', posted: '2024-08-01', applications: 38, hired: 1, status: 'Active' },
      { id: 5, title: 'DevOps Engineer', department: 'Engineering', posted: '2024-08-05', applications: 25, hired: 0, status: 'Active' },
      { id: 6, title: 'Marketing Manager', department: 'Marketing', posted: '2024-08-10', applications: 22, hired: 1, status: 'Filled' },
      { id: 7, title: 'Backend Developer', department: 'Engineering', posted: '2024-08-15', applications: 41, hired: 0, status: 'Active' },
      { id: 8, title: 'Frontend Developer', department: 'Engineering', posted: '2024-09-01', applications: 35, hired: 1, status: 'Active' }
    ];

    // Sample interview reports
    const interviewReports = [
      { id: 1, candidateName: 'John Smith', position: 'Software Engineer', interviewer: 'Tech Team', date: '2024-07-22', result: 'Pass', score: 8.5 },
      { id: 2, candidateName: 'Sarah Wilson', position: 'Product Manager', interviewer: 'Product Team', date: '2024-07-28', result: 'Pass', score: 9.0 },
      { id: 3, candidateName: 'Mike Davis', position: 'UX Designer', interviewer: 'Design Team', date: '2024-08-02', result: 'Fail', score: 6.0 },
      { id: 4, candidateName: 'Emily Brown', position: 'Data Analyst', interviewer: 'Analytics Team', date: '2024-08-12', result: 'Pass', score: 8.0 },
      { id: 5, candidateName: 'David Lee', position: 'DevOps Engineer', interviewer: 'Tech Team', date: '2024-08-18', result: 'Pending', score: 7.5 },
      { id: 6, candidateName: 'Lisa Garcia', position: 'Marketing Manager', interviewer: 'Marketing Team', date: '2024-08-25', result: 'Pass', score: 8.8 },
      { id: 7, candidateName: 'Tom Wilson', position: 'Backend Developer', interviewer: 'Tech Team', date: '2024-09-05', result: 'Pending', score: 7.8 },
      { id: 8, candidateName: 'Anna Martinez', position: 'Frontend Developer', interviewer: 'Tech Team', date: '2024-09-08', result: 'Pass', score: 9.2 }
    ];

    // Sample team performance
    const teamPerformance = [
      { recruiter: 'Alice Johnson', hires: 4, interviews: 12, applications: 85, successRate: 33.3, avgTimeToHire: 18 },
      { recruiter: 'Bob Chen', hires: 3, interviews: 10, applications: 72, successRate: 30.0, avgTimeToHire: 22 },
      { recruiter: 'Carol White', hires: 2, interviews: 8, applications: 58, successRate: 25.0, avgTimeToHire: 25 },
      { recruiter: 'David Miller', hires: 2, interviews: 7, applications: 45, successRate: 28.6, avgTimeToHire: 20 }
    ];

    // Monthly statistics
    const monthlyStats = [
      { month: 'July 2024', applications: 156, interviews: 45, hires: 8, revenue: 425000 },
      { month: 'August 2024', applications: 189, interviews: 52, hires: 12, revenue: 580000 },
      { month: 'September 2024', applications: 142, interviews: 38, hires: 6, revenue: 320000 }
    ];

    setReportData({
      candidateReports,
      jobReports,
      interviewReports,
      teamPerformance,
      monthlyStats
    });
  };

  const filterDataByDateRange = () => {
    let startDate: Date;
    let endDate: Date = new Date();

    if (selectedPeriod === 'custom') {
      if (!customDateRange.startDate || !customDateRange.endDate) {
        setFilteredData(reportData);
        return;
      }
      startDate = new Date(customDateRange.startDate);
      endDate = new Date(customDateRange.endDate);
    } else {
      switch (selectedPeriod) {
        case 'lastmonth':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'last2months':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
          break;
        case 'last3months':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'lastyear':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
          break;
        default:
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
      }
    }

    // Filter candidates
    const filteredCandidates = reportData.candidateReports.filter(candidate => {
      const candidateDate = new Date(candidate.appliedDate);
      return candidateDate >= startDate && candidateDate <= endDate;
    });

    // Filter jobs
    const filteredJobs = reportData.jobReports.filter(job => {
      const jobDate = new Date(job.posted);
      return jobDate >= startDate && jobDate <= endDate;
    });

    // Filter interviews
    const filteredInterviews = reportData.interviewReports.filter(interview => {
      const interviewDate = new Date(interview.date);
      return interviewDate >= startDate && interviewDate <= endDate;
    });

    // Filter monthly stats
    const filteredMonthlyStats = reportData.monthlyStats.filter(stat => {
      const statDate = new Date(stat.month);
      return statDate >= startDate && statDate <= endDate;
    });

    setFilteredData({
      candidateReports: filteredCandidates,
      jobReports: filteredJobs,
      interviewReports: filteredInterviews,
      teamPerformance: reportData.teamPerformance, // Team performance is not date-filtered
      monthlyStats: filteredMonthlyStats
    });
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Hired': 'bg-green-100 text-green-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-blue-100 text-blue-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Active': 'bg-blue-100 text-blue-800',
      'Filled': 'bg-green-100 text-green-800',
      'Pass': 'bg-green-100 text-green-800',
      'Fail': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const renderOverviewReport = () => {
    const totalApplications = filteredData.candidateReports.length;
    const totalHires = filteredData.candidateReports.filter(c => c.status === 'Hired').length;
    const successRate = totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0;
    const totalInterviews = filteredData.interviewReports.length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">In selected period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hires</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHires}</div>
              <p className="text-xs text-muted-foreground">Successful placements</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Hire to application ratio</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground">Interviews conducted</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Hires</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.monthlyStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stat.month}</TableCell>
                    <TableCell>{stat.applications}</TableCell>
                    <TableCell>{stat.interviews}</TableCell>
                    <TableCell>{stat.hires}</TableCell>
                    <TableCell>${stat.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCandidateReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Candidate Report</CardTitle>
          <Button onClick={() => exportToCSV(filteredData.candidateReports, 'candidate-report')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Recruiter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.candidateReports.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>{candidate.position}</TableCell>
                <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                <TableCell>{candidate.appliedDate}</TableCell>
                <TableCell>${candidate.salary.toLocaleString()}</TableCell>
                <TableCell>{candidate.recruiter}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderJobReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Job Posting Report</CardTitle>
          <Button onClick={() => exportToCSV(filteredData.jobReports, 'job-report')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Hired</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.jobReports.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.posted}</TableCell>
                <TableCell>{job.applications}</TableCell>
                <TableCell>{job.hired}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderInterviewReport = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Report</CardTitle>
          <Button onClick={() => exportToCSV(filteredData.interviewReports, 'interview-report')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.interviewReports.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-medium">{interview.candidateName}</TableCell>
                <TableCell>{interview.position}</TableCell>
                <TableCell>{interview.interviewer}</TableCell>
                <TableCell>{interview.date}</TableCell>
                <TableCell>{getStatusBadge(interview.result)}</TableCell>
                <TableCell>{interview.score}/10</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderTeamPerformance = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Performance Report</CardTitle>
          <Button onClick={() => exportToCSV(filteredData.teamPerformance, 'team-performance-report')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recruiter</TableHead>
              <TableHead>Hires</TableHead>
              <TableHead>Interviews</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Avg. Time to Hire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.teamPerformance.map((member, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{member.recruiter}</TableCell>
                <TableCell>{member.hires}</TableCell>
                <TableCell>{member.interviews}</TableCell>
                <TableCell>{member.applications}</TableCell>
                <TableCell>{member.successRate}%</TableCell>
                <TableCell>{member.avgTimeToHire} days</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last2months">Last 2 Months</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Label htmlFor="startDate" className="text-sm">From:</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center space-x-1">
                <Label htmlFor="endDate" className="text-sm">To:</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewReport()}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {renderCandidateReport()}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {renderJobReport()}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          {renderInterviewReport()}
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {renderTeamPerformance()}
        </TabsContent>
      </Tabs>
    </div>
  );
};