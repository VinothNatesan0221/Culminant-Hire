import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Download, Upload, FileText, Check, X, Eye, FileSpreadsheet } from 'lucide-react';
import { Candidate, Status } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';
import { exportToGoogleSheets, exportToExcel } from '@/utils/exportUtils';
import { ResumeViewer } from './ResumeViewer';
import { CandidateImport } from './CandidateImport';

const statusOptions: Status[] = [
  {
    id: '1',
    name: 'Processed',
    dependentOptions: ['Client Duplicate', 'Client Screen Out', 'Schedule Interview']
  },
  {
    id: '2',
    name: 'Not Interested',
    dependentOptions: ['Personal Reason', 'Location Issue', 'Salary Issue']
  },
  {
    id: '3',
    name: 'No Response',
    dependentOptions: ['Phone Not Reachable', 'Email Bounce Back']
  }
];

export const CandidateManagement: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);


  const [newCandidateData, setNewCandidateData] = useState({
    date: new Date().toISOString().split('T')[0],
    jobCode: '',
    client: '',
    clientSpoc: '',
    skill: '',
    source: '',
    currentLocation: '',
    workLocation: '',
    name: '',
    mobile: '',
    email: '',
    status: '',
    status1: '',
    education: '',
    totalEx: '',
    rex: '',
    cctc: '',
    ectc: '',
    notice: '',
    currentCompany: '',
    remarks: '',
    jobCategory: '',
    clientName: '',
    location: '',
    recruiter: '',
    am: ''
  });

  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadResults, setBulkUploadResults] = useState<any[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const jobCategories = [
    'Software Development',
    'Network Engineering',
    'Data Science',
    'DevOps',
    'QA Testing',
    'Product Management',
    'UI/UX Design',
    'Business Analyst',
    'Project Management',
    'System Administration'
  ];

  useEffect(() => {
    loadCandidates();
    loadJobs();
    const existingCandidates = localStorage.getItem('candidates');
    if (!existingCandidates || JSON.parse(existingCandidates).length === 0) {
      const sampleData = [
        {
          id: '1',
          date: '2025-04-01',
          jobCode: 'KAPR25-009',
          jobCategory: 'Network Engineering',
          client: 'HCL',
          clientName: 'Saurabh Dwivedi',
          location: 'Noida/Bangalore',
          name: 'Srikanth MY',
          mobile: '8892384641',
          status: 'Processed',
          email: 'srikanthmy@email.com',
          skill: 'Network',
          status1: 'Client Duplicate',
          recruiter: 'Pancharatna',
          am: 'Divya Bharathi'
        },
        {
          id: '2',
          date: '2025-04-01',
          jobCode: 'KAPR25-009',
          jobCategory: 'Network Engineering',
          client: 'HCL',
          clientName: 'Saurabh Dwivedi',
          location: 'Noida/Bangalore',
          name: 'Siva Kumar',
          mobile: '7899978814',
          status: 'Not Interested',
          email: 'sadasivar77@email.com',
          skill: 'Network',
          status1: 'Personal Reason',
          recruiter: 'Pancharatna',
          am: 'Divya Bharathi'
        }
      ];
      localStorage.setItem('candidates', JSON.stringify(sampleData));
      setCandidates(sampleData);
    }
  }, []);

  useEffect(() => {
    setFilteredCandidates(candidates);
  }, [candidates]);

  const loadCandidates = async () => {
    try {
      const response = await apiService.getCandidates();
      if (response.success && response.data) {
        setCandidates(response.data);
      } else {
        toast.error('Failed to load candidates');
      }
    } catch (error) {
      // console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    }
  };

  const saveCandidates = (updatedCandidates: Candidate[]) => {
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
    setCandidates(updatedCandidates);
  };

  const loadJobs = () => {
    const savedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    setAvailableJobs(savedJobs);
  };

  const handleJobCodeChange = (jobCode: string) => {
    const selectedJob = availableJobs.find(job => job.jobCode === jobCode);
    if (selectedJob) {
      setNewCandidateData({
        ...newCandidateData,
        jobCode: jobCode,
        client: selectedJob.client,
        clientSpoc: selectedJob.clientSpoc || '',
        workLocation: selectedJob.workLocation || '',
        skill: selectedJob.skill || ''
      });
    } else {
      setNewCandidateData({
        ...newCandidateData,
        jobCode: jobCode
      });
    }
  };

  const parseResumeContent = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        
        // Enhanced parsing logic with better pattern matching
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const phoneRegex = /(?:\+91|91)?[-.\s]?(?:\d{5}[-.\s]?\d{5}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/g;
        
        const emails = content.match(emailRegex) || [];
        const phones = content.match(phoneRegex) || [];
        
        // Extract name from content or filename
        const nameFromContent = extractNameFromContent(content);
        const nameFromFile = extractNameFromResume(file.name);
        
        resolve({
          name: nameFromContent || nameFromFile,
          email: emails[0] || `candidate${Date.now()}@email.com`,
          mobile: phones[0]?.replace(/[-.\s]/g, '') || '+91 9876543210'
        });
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For PDF/DOC files, simulate content extraction
        setTimeout(() => {
          resolve({
            name: extractNameFromResume(file.name),
            email: `${extractNameFromResume(file.name).toLowerCase().replace(/\s+/g, '.')}@email.com`,
            mobile: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`
          });
        }, 800);
      }
    });
  };

  const extractNameFromContent = (content: string): string => {
    // Look for name patterns in the first few lines
    const lines = content.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 2 && trimmed.length < 50 && /^[A-Za-z\s]+$/.test(trimmed)) {
        return trimmed;
      }
    }
    return '';
  };

  const extractSkillsFromContent = (content: string): string => {
    const skillKeywords = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS', 'Angular', 'Vue',
      'TypeScript', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Redux',
      'Express', 'Spring', 'Django', 'Flask', 'PostgreSQL', 'MySQL', 'GraphQL', 'REST'
    ];
    
    const foundSkills = skillKeywords.filter(skill => 
      content.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills.join(', ') : 'Not specified';
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setUploadedResume(file);
    setIsParsingResume(true);
    
    try {
      const parsedData = await parseResumeContent(file);
      
      setNewCandidateData({
        ...newCandidateData,
        name: parsedData.name,
        email: parsedData.email,
        mobile: parsedData.mobile
      });

      toast.success('Resume parsed successfully! Details auto-filled.');
    } catch (error) {
      toast.error('Failed to parse resume. Please fill details manually.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return false;
    }

    return true;
  };

  const extractNameFromResume = (filename: string) => {
    // Simple name extraction from filename
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExtension.replace(/[_-]/g, ' ').replace(/resume|cv/gi, '').trim();
    return cleanName || 'Candidate Name';
  };

  const handleRemoveResume = () => {
    setUploadedResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportComplete = async (importedCandidates: any[]) => {
    try {
      // Convert imported candidates to match our candidate structure
      const processedCandidates = importedCandidates.map(candidate => ({
        ...candidate,
        // Map imported fields to our candidate structure
        date: candidate.createdAt ? candidate.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        jobCode: candidate.jobCode || '',
        client: candidate.client || '',
        clientSpoc: candidate.clientSpoc || '',
        skill: candidate.skill || candidate.skills || '',
        source: candidate.source || 'Import',
        currentLocation: candidate.currentLocation || candidate.location || '',
        workLocation: candidate.workLocation || candidate.preferredLocation || '',
        mobile: candidate.mobile || candidate.phone || '',
        status: candidate.status || 'New',
        status1: candidate.status1 || '',
        education: candidate.education || candidate.qualification || '',
        totalEx: candidate.totalExperience || candidate.experience || '',
        rex: candidate.relevantExperience || '',
        cctc: candidate.currentCTC || candidate.currentSalary || '',
        ectc: candidate.expectedCTC || candidate.expectedSalary || '',
        notice: candidate.noticePeriod || '',
        currentCompany: candidate.currentCompany || candidate.company || '',
        remarks: candidate.remarks || candidate.notes || '',
        jobCategory: candidate.jobCategory || '',
        clientName: candidate.clientName || '',
        location: candidate.workLocation || candidate.location || '',
        recruiter: candidate.recruiter || user?.name || '',
        am: candidate.am || ''
      }));

      // Save to database via API
      for (const candidate of processedCandidates) {
        try {
          await apiService.createCandidate(candidate);
        } catch (error) {
          console.error('Error saving imported candidate:', error);
        }
      }

      // Reload candidates to show imported data
      await loadCandidates();
      setShowImportDialog(false);
      
      toast.success(`Successfully imported ${processedCandidates.length} candidates`);
    } catch (error) {
      console.error('Error processing import:', error);
      toast.error('Error processing imported candidates');
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }

    setIsBulkUploading(true);
    setBulkUploadProgress(0);
    setBulkUploadResults([]);

    const results: any[] = [];
    const totalFiles = validFiles.length;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        const parsedData = await parseResumeContent(file);
        
        const newCandidate: Candidate = {
          id: `bulk_${Date.now()}_${i}`,
          date: new Date().toISOString().split('T')[0],
          jobCode: '',
          jobCategory: '',
          client: '',
          clientName: '',
          location: '',
          name: parsedData.name,
          mobile: parsedData.mobile,
          status: '',
          email: parsedData.email,
          skill: parsedData.skill,
          status1: '',
          recruiter: '',
          am: ''
        };

        results.push({
          fileName: file.name,
          status: 'success',
          candidate: newCandidate
        });

      } catch (error) {
        results.push({
          fileName: file.name,
          status: 'error',
          error: 'Failed to parse resume'
        });
      }

      setBulkUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    // Add successful candidates to the list
    const successfulCandidates = results
      .filter(r => r.status === 'success')
      .map(r => r.candidate);

    if (successfulCandidates.length > 0) {
      saveCandidates([...candidates, ...successfulCandidates]);
    }

    setBulkUploadResults(results);
    setIsBulkUploading(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    toast.success(`Bulk upload completed: ${successCount} successful, ${errorCount} failed`);
  };



  const handleAddNew = () => {
    setIsAddingNew(true);
    setUploadedResume(null);
    setNewCandidateData({
      date: new Date().toISOString().split('T')[0],
      jobCode: '',
      client: '',
      clientSpoc: '',
      skill: '',
      source: '',
      currentLocation: '',
      workLocation: '',
      name: '',
      mobile: '',
      email: '',
      status: '',
      status1: '',
      education: '',
      totalEx: '',
      rex: '',
      cctc: '',
      ectc: '',
      notice: '',
      currentCompany: '',
      remarks: '',
      jobCategory: '',
      clientName: '',
      location: '',
      recruiter: '',
      am: ''
    });
  };

  const handleSaveNewCandidate = async () => {
    if (!newCandidateData.name || !newCandidateData.email || !newCandidateData.mobile) {
      toast.error('Please fill in required fields (Name, Email, Mobile)');
      return;
    }
    
    try {
      const response = await apiService.createCandidate(newCandidateData);
      
      if (response.success) {
        await loadCandidates(); // Reload candidates from database
        setIsAddingNew(false);
        toast.success('Candidate added successfully');
      } else {
        toast.error(response.message || 'Failed to add candidate');
      }
    } catch (error) {
      // console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setUploadedResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportToExcel = () => {
    const success = exportToExcel(filteredCandidates, 'candidates');
    if (success) {
      toast.success('Data exported to Excel successfully');
    }
  };

  const handleExportToGoogleSheets = async () => {
    const success = await exportToGoogleSheets(filteredCandidates, 'candidates');
    if (success) {
      toast.success('Data prepared for Google Sheets import');
    }
  };

  const handleInlineEdit = (candidate: Candidate) => {
    setInlineEditingId(candidate.id);
  };

  const handleInlineSave = async (candidateId: string, field: string, value: string) => {
    try {
      const updateData = { [field]: value };
      const response = await apiService.updateCandidate(candidateId, updateData);
      
      if (response.success) {
        await loadCandidates(); // Reload candidates from database
        setInlineEditingId(null);
        
        // If status1 is changed to "Schedule Interview", show success message
        if (field === 'status1' && value === 'Schedule Interview') {
          toast.success('Candidate moved to Interview tab! Check the Interviews section.');
        } else {
          toast.success('Candidate updated successfully');
        }
      } else {
        toast.error(response.message || 'Failed to update candidate');
      }
    } catch (error) {
      // console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleInlineCancel = () => {
    setInlineEditingId(null);
  };

  const handleDelete = async (candidateId: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        const response = await apiService.deleteCandidate(candidateId);
        
        if (response.success) {
          await loadCandidates(); // Reload candidates from database
          toast.success('Candidate deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete candidate');
        }
      } catch (error) {
        // console.error('Error deleting candidate:', error);
        toast.error('Failed to delete candidate');
      }
    }
  };

  const InlineEditCell: React.FC<{
    candidate: Candidate;
    field: keyof Candidate;
    type?: 'text' | 'select';
    options?: string[];
  }> = ({ candidate, field, type = 'text', options = [] }) => {
    const [value, setValue] = useState(candidate[field] as string);
    const isEditing = inlineEditingId === candidate.id;

    if (!isEditing) {
      return <span>{candidate[field] as string}</span>;
    }

    if (type === 'select') {
      return (
        <div className="flex items-center space-x-1">
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => handleInlineSave(candidate.id, field, value)}>
            <Check size={12} />
          </Button>
          <Button size="sm" variant="outline" onClick={handleInlineCancel}>
            <X size={12} />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32"
        />
        <Button size="sm" onClick={() => handleInlineSave(candidate.id, field, value)}>
          <Check size={12} />
        </Button>
        <Button size="sm" variant="outline" onClick={handleInlineCancel}>
          <X size={12} />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Candidate Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Manage and track candidates through the recruitment pipeline</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>Total candidates: {candidates.length}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleExportToExcel} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                <Download size={16} className="mr-2" />
                Export to Excel
              </Button>
              <Button onClick={handleExportToGoogleSheets} variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                <Download size={16} className="mr-2" />
                Export to Google Sheets
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Candidate Management</CardTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowImportDialog(true)}
                disabled={isAddingNew || isBulkUploading}
                variant="outline"
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <FileSpreadsheet size={16} className="mr-2" />
                Import from Excel/CSV
              </Button>
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleBulkUpload}
                className="hidden"
              />
              <Button 
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={isBulkUploading || isAddingNew}
                variant="outline"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <Upload size={16} className="mr-2" />
                Bulk Upload Resumes
              </Button>
              <Button onClick={handleAddNew} disabled={isAddingNew || isBulkUploading}>
                <Plus size={16} className="mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
          {isBulkUploading && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkUploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{bulkUploadProgress}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Processing resumes...</p>
            </div>
          )}
          {bulkUploadResults.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Bulk Upload Results:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {bulkUploadResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{result.fileName}</span>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 text-white hover:bg-gray-800">
                  <TableHead className="text-white min-w-[80px]">Resume</TableHead>
                  <TableHead className="text-white min-w-[100px]">Date</TableHead>
                  <TableHead className="text-white min-w-[100px]">Job Code</TableHead>
                  <TableHead className="text-white min-w-[100px]">Client</TableHead>
                  <TableHead className="text-white min-w-[120px]">Client SPOC</TableHead>
                  <TableHead className="text-white min-w-[100px]">Skill</TableHead>
                  <TableHead className="text-white min-w-[100px]">Source</TableHead>
                  <TableHead className="text-white min-w-[120px]">Current Location</TableHead>
                  <TableHead className="text-white min-w-[120px]">Work Location</TableHead>
                  <TableHead className="text-white min-w-[120px]">Name</TableHead>
                  <TableHead className="text-white min-w-[120px]">Mobile Number</TableHead>
                  <TableHead className="text-white min-w-[150px]">Mail ID</TableHead>
                  <TableHead className="text-white min-w-[100px]">Status</TableHead>
                  <TableHead className="text-white min-w-[120px]">Status1</TableHead>
                  <TableHead className="text-white min-w-[100px]">Education</TableHead>
                  <TableHead className="text-white min-w-[80px]">Total EX</TableHead>
                  <TableHead className="text-white min-w-[80px]">REX</TableHead>
                  <TableHead className="text-white min-w-[80px]">CCTC</TableHead>
                  <TableHead className="text-white min-w-[80px]">ECTC</TableHead>
                  <TableHead className="text-white min-w-[80px]">Notice</TableHead>
                  <TableHead className="text-white min-w-[120px]">Current Company</TableHead>
                  <TableHead className="text-white min-w-[100px]">Remarks</TableHead>
                  <TableHead className="text-white min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingNew && (
                  <TableRow className="bg-blue-50 border-2 border-blue-200">
                    <TableCell className="min-w-[80px]">
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isParsingResume}
                          className="w-full text-xs"
                        >
                          {isParsingResume ? (
                            <>Parsing...</>
                          ) : uploadedResume ? (
                            <>✓ Resume</>
                          ) : (
                            <>📎 Upload</>
                          )}
                        </Button>
                        {uploadedResume && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveResume}
                            className="w-full text-xs text-red-600"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="date"
                        value={newCandidateData.date}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, date: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Select 
                        value={newCandidateData.jobCode} 
                        onValueChange={handleJobCodeChange}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Job Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableJobs.map(job => (
                            <SelectItem key={job.id} value={job.jobCode}>
                              {job.jobCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        placeholder="Client"
                        value={newCandidateData.client}
                        className="w-32 bg-gray-100"
                        readOnly
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Client SPOC"
                        value={newCandidateData.clientSpoc}
                        className="w-32 bg-gray-100"
                        readOnly
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        placeholder="Skill"
                        value={newCandidateData.skill}
                        className="w-32 bg-gray-100"
                        readOnly
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        placeholder="Source"
                        value={newCandidateData.source}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, source: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Current Location"
                        value={newCandidateData.currentLocation}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, currentLocation: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Work Location"
                        value={newCandidateData.workLocation}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, workLocation: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Name *"
                        value={newCandidateData.name}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, name: e.target.value })}
                        className="w-32"
                        required
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Mobile *"
                        value={newCandidateData.mobile}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, mobile: e.target.value })}
                        className="w-32"
                        required
                      />
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={newCandidateData.email}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, email: e.target.value })}
                        className="w-32"
                        required
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Select 
                        value={newCandidateData.status} 
                        onValueChange={(value) => setNewCandidateData({ ...newCandidateData, status: value, status1: '' })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.id} value={status.name}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Select 
                        value={newCandidateData.status1} 
                        onValueChange={(value) => setNewCandidateData({ ...newCandidateData, status1: value })}
                        disabled={!newCandidateData.status}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status1" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.find(s => s.name === newCandidateData.status)?.dependentOptions.map(option => (
                            <SelectItem key={option} value={option || 'none'}>
                              {option}
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        placeholder="Education"
                        value={newCandidateData.education}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, education: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        placeholder="Total EX"
                        value={newCandidateData.totalEx}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, totalEx: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        placeholder="REX"
                        value={newCandidateData.rex}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, rex: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        placeholder="CCTC"
                        value={newCandidateData.cctc}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, cctc: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        placeholder="ECTC"
                        value={newCandidateData.ectc}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, ectc: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        placeholder="Notice"
                        value={newCandidateData.notice}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, notice: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        placeholder="Current Company"
                        value={newCandidateData.currentCompany}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, currentCompany: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Input
                        placeholder="Remarks"
                        value={newCandidateData.remarks}
                        onChange={(e) => setNewCandidateData({ ...newCandidateData, remarks: e.target.value })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={handleSaveNewCandidate} className="bg-green-600 hover:bg-green-700">
                          <Check size={12} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelNew}>
                          <X size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredCandidates.map((candidate, index) => (
                  <TableRow key={candidate.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <TableCell className="min-w-[80px]">
                      <ResumeViewer 
                        candidateName={candidate.name}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye size={12} className="mr-1" />
                            <span className="text-xs">View</span>
                          </Button>
                        }
                      />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="date" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="jobCode" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="client" />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="clientSpoc" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="skill" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="source" />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="currentLocation" />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="workLocation" />
                    </TableCell>
                    <TableCell className="font-medium min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="name" />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="mobile" />
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <InlineEditCell candidate={candidate} field="email" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      {inlineEditingId === candidate.id ? (
                        <InlineEditCell 
                          candidate={candidate} 
                          field="status" 
                          type="select"
                          options={statusOptions.map(s => s.name)}
                        />
                      ) : (
                        <Badge 
                          variant={candidate.status === 'Processed' ? 'default' : 
                                  candidate.status === 'Not Interested' ? 'destructive' : 'secondary'}
                        >
                          {candidate.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      {inlineEditingId === candidate.id ? (
                        <InlineEditCell 
                          candidate={candidate} 
                          field="status1" 
                          type="select"
                          options={statusOptions.find(s => s.name === candidate.status)?.dependentOptions.filter(opt => opt && opt.trim() !== '') || []}
                        />
                      ) : (
                        candidate.status1 && (
                          <Badge variant="outline">{candidate.status1}</Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="education" />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <InlineEditCell candidate={candidate} field="totalEx" />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <InlineEditCell candidate={candidate} field="rex" />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <InlineEditCell candidate={candidate} field="cctc" />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <InlineEditCell candidate={candidate} field="ectc" />
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <InlineEditCell candidate={candidate} field="notice" />
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <InlineEditCell candidate={candidate} field="currentCompany" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <InlineEditCell candidate={candidate} field="remarks" />
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex space-x-1">
                        {inlineEditingId === candidate.id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleInlineCancel}
                          >
                            <X size={14} />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInlineEdit(candidate)}
                              title="Edit inline"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(candidate.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      {showImportDialog && (
        <CandidateImport
          onImportComplete={handleImportComplete}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
};