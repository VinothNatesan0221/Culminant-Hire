import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  data: any[];
}

interface CandidateImportProps {
  onImportComplete: (candidates: any[]) => void;
  onClose: () => void;
}

export const CandidateImport: React.FC<CandidateImportProps> = ({ onImportComplete, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expected column headers for candidate import
  const expectedHeaders = [
    'name',
    'email', 
    'mobile',
    'currentLocation',
    'workLocation',
    'education',
    'totalExperience',
    'relevantExperience',
    'currentCTC',
    'expectedCTC',
    'noticePeriod',
    'currentCompany',
    'skill',
    'source',
    'status',
    'remarks'
  ];

  const headerMapping = {
    'name': ['name', 'candidate name', 'full name', 'candidate_name'],
    'email': ['email', 'email address', 'email_address', 'mail'],
    'mobile': ['mobile', 'phone', 'contact', 'mobile number', 'phone_number'],
    'currentLocation': ['current location', 'location', 'current_location', 'city'],
    'workLocation': ['work location', 'preferred location', 'work_location', 'preferred_location'],
    'education': ['education', 'qualification', 'degree', 'educational_qualification'],
    'totalExperience': ['total experience', 'experience', 'total_experience', 'exp'],
    'relevantExperience': ['relevant experience', 'relevant_experience', 'rel_exp'],
    'currentCTC': ['current ctc', 'current salary', 'current_ctc', 'ctc'],
    'expectedCTC': ['expected ctc', 'expected salary', 'expected_ctc', 'exp_ctc'],
    'noticePeriod': ['notice period', 'notice_period', 'np'],
    'currentCompany': ['current company', 'company', 'current_company', 'employer'],
    'skill': ['skills', 'skill', 'technology', 'tech_skills'],
    'source': ['source', 'channel', 'recruitment_source'],
    'status': ['status', 'candidate_status'],
    'remarks': ['remarks', 'comments', 'notes', 'description']
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData([]);
      setImportResult(null);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await readFile(file);
      if (data.length > 0) {
        const mappedData = mapColumns(data);
        setPreviewData(mappedData.slice(0, 5)); // Show first 5 rows for preview
      }
    } catch (error) {
      toast.error('Error reading file: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let jsonData: any[] = [];

          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            jsonData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              return obj;
            });
          } else {
            // Parse Excel
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
          }

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const mapColumns = (data: any[]) => {
    if (data.length === 0) return [];

    const fileHeaders = Object.keys(data[0]).map(h => h.toLowerCase().trim());
    const mappedData = data.map(row => {
      const mappedRow: any = {};
      
      expectedHeaders.forEach(expectedHeader => {
        const possibleHeaders = headerMapping[expectedHeader as keyof typeof headerMapping];
        const matchedHeader = fileHeaders.find(fileHeader => 
          possibleHeaders.some(possible => 
            fileHeader.includes(possible.toLowerCase()) || 
            possible.toLowerCase().includes(fileHeader)
          )
        );
        
        if (matchedHeader) {
          const originalKey = Object.keys(row).find(key => 
            key.toLowerCase().trim() === matchedHeader
          );
          mappedRow[expectedHeader] = originalKey ? row[originalKey] : '';
        } else {
          mappedRow[expectedHeader] = '';
        }
      });

      return mappedRow;
    });

    return mappedData;
  };

  const validateCandidate = (candidate: any): string[] => {
  const errors: string[] = [];

  const name = String(candidate.name || '').trim();
  const email = String(candidate.email || '').trim();
  const mobile = String(candidate.mobile || '').trim();

  if (!name) {
    errors.push('Name is required');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!mobile) {
    errors.push('Mobile number is required');
  }

  return errors;
};


  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      const data = await readFile(file);
      const mappedData = mapColumns(data);
      
      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
        data: []
      };

      const validCandidates: any[] = [];
      
      mappedData.forEach((candidate, index) => {
        const errors = validateCandidate(candidate);
        
        if (errors.length === 0) {
          // Add additional fields
          const processedCandidate = {
            ...candidate,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: candidate.status || 'new',
            source: candidate.source || 'Import'
          };
          
          validCandidates.push(processedCandidate);
          result.success++;
        } else {
          result.failed++;
          result.errors.push(`Row ${index + 2}: ${errors.join(', ')}`);
        }
      });

      result.data = validCandidates;
      setImportResult(result);

      if (validCandidates.length > 0) {
        onImportComplete(validCandidates);
        toast.success(`Successfully imported ${validCandidates.length} candidates`);
      }

    } catch (error) {
      toast.error('Error processing import: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
      currentLocation: 'Mumbai',
      workLocation: 'Bangalore',
      education: 'B.Tech Computer Science',
      totalExperience: '5 years',
      relevantExperience: '4 years',
      currentCTC: '8 LPA',
      expectedCTC: '12 LPA',
      noticePeriod: '30 days',
      currentCompany: 'Tech Corp',
      skill: 'React, Node.js, MongoDB',
      source: 'Naukri',
      status: 'new',
      remarks: 'Good candidate for frontend role'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidate Template');
    XLSX.writeFile(wb, 'candidate_import_template.xlsx');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Candidates from Excel/CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Download Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Download the template to see the expected format and column headers.
              </p>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Upload Your File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select Excel (.xlsx) or CSV file</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    File selected: {file.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Data */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Preview Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Preview of first 5 rows. Check if the data looks correct before importing.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Skills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.mobile}</TableCell>
                          <TableCell>{row.currentLocation}</TableCell>
                          <TableCell>{row.totalExperience}</TableCell>
                          <TableCell>{row.skill}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleImport} 
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Import Candidates'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✓ Success: {importResult.success}
                    </Badge>
                    {importResult.failed > 0 && (
                      <Badge variant="destructive">
                        ✗ Failed: {importResult.failed}
                      </Badge>
                    )}
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                      <div className="bg-red-50 p-3 rounded-md max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};