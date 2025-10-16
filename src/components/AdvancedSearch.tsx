import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Phone,
  Mail,
  Eye,
  Star,
  TrendingUp,
  Building,
  Clock,
  ChevronDown,
  ChevronUp,
  Save,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  email: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  lastActive: string;
  matchScore: number;
  trending?: boolean;
  activelyApplying?: boolean;
  premium?: boolean;
}

export const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<SearchCandidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [hideProfiles, setHideProfiles] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [showCount, setShowCount] = useState('160');
  const [activeIn, setActiveIn] = useState('1day');
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [keywordsFilter, setKeywordsFilter] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);

  useEffect(() => {
    // Load sample candidates data with diverse skillsets
    const sampleCandidates: SearchCandidate[] = [
      {
        id: '1',
        name: 'Arya Kumar Maharana',
        title: 'Senior Java Developer at Accenture',
        company: 'Accenture',
        location: 'Bengaluru',
        experience: '7y 5m',
        education: 'MCA Biju Patnaik University of Technology (BPUT) 2018, BSc Utkal University 2015',
        skills: ['Java', 'Spring', 'Spring Boot', 'Microservices', 'Spring Data JPA', 'J2EE', 'Maven', 'Web Services', 'SQL', 'Git', 'Jenkins', 'AWS Cloud', 'API Integration', 'Angular', 'Kafka', 'Redis'],
        email: 'arya.maharana@email.com',
        phone: '+91 9876543210',
        avatar: '',
        isActive: true,
        lastActive: '2 hours ago',
        matchScore: 95,
        trending: true,
        activelyApplying: true,
        premium: false
      },
      {
        id: '2',
        name: 'Priya Sharma',
        title: 'Full Stack Developer at TCS',
        company: 'TCS',
        location: 'Hyderabad',
        experience: '5y 2m',
        education: 'B.Tech Computer Science Engineering 2019',
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'Express.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Redux', 'Next.js'],
        email: 'priya.sharma@email.com',
        phone: '+91 9876543211',
        avatar: '',
        isActive: true,
        lastActive: '1 day ago',
        matchScore: 88,
        trending: false,
        activelyApplying: true,
        premium: true
      },
      {
        id: '3',
        name: 'Rahul Verma',
        title: 'DevOps Engineer at Infosys',
        company: 'Infosys',
        location: 'Pune',
        experience: '6y 8m',
        education: 'B.E. Information Technology 2017',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python', 'Linux', 'CI/CD', 'Monitoring', 'Ansible', 'Prometheus', 'Grafana'],
        email: 'rahul.verma@email.com',
        phone: '+91 9876543212',
        avatar: '',
        isActive: false,
        lastActive: '3 days ago',
        matchScore: 82,
        trending: false,
        activelyApplying: false,
        premium: false
      },
      {
        id: '4',
        name: 'Sneha Patel',
        title: 'Data Scientist at Microsoft',
        company: 'Microsoft',
        location: 'Bengaluru',
        experience: '4y 3m',
        education: 'M.Tech Data Science IIT Delhi 2020, B.Tech CSE 2018',
        skills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Tableau', 'Power BI', 'Azure ML'],
        email: 'sneha.patel@email.com',
        phone: '+91 9876543213',
        avatar: '',
        isActive: true,
        lastActive: '5 hours ago',
        matchScore: 92,
        trending: true,
        activelyApplying: true,
        premium: true
      },
      {
        id: '5',
        name: 'Amit Singh',
        title: 'Frontend Developer at Flipkart',
        company: 'Flipkart',
        location: 'Bengaluru',
        experience: '3y 8m',
        education: 'B.Tech Computer Science 2020',
        skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'SASS', 'Webpack', 'Jest', 'Cypress', 'Figma', 'Adobe XD'],
        email: 'amit.singh@email.com',
        phone: '+91 9876543214',
        avatar: '',
        isActive: true,
        lastActive: '1 day ago',
        matchScore: 85,
        trending: false,
        activelyApplying: true,
        premium: false
      },
      {
        id: '6',
        name: 'Kavya Reddy',
        title: 'QA Automation Engineer at Amazon',
        company: 'Amazon',
        location: 'Hyderabad',
        experience: '5y 6m',
        education: 'B.E. Electronics and Communication 2018',
        skills: ['Selenium', 'TestNG', 'Java', 'Python', 'Cucumber', 'RestAssured', 'Postman', 'JIRA', 'Jenkins', 'Git', 'API Testing', 'Mobile Testing'],
        email: 'kavya.reddy@email.com',
        phone: '+91 9876543215',
        avatar: '',
        isActive: true,
        lastActive: '3 hours ago',
        matchScore: 78,
        trending: false,
        activelyApplying: false,
        premium: false
      },
      {
        id: '7',
        name: 'Ravi Kumar',
        title: 'Mobile App Developer at Paytm',
        company: 'Paytm',
        location: 'Noida',
        experience: '4y 1m',
        education: 'B.Tech Information Technology 2019',
        skills: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android', 'Swift', 'Kotlin', 'Firebase', 'Redux', 'GraphQL', 'REST APIs', 'Git'],
        email: 'ravi.kumar@email.com',
        phone: '+91 9876543216',
        avatar: '',
        isActive: true,
        lastActive: '6 hours ago',
        matchScore: 87,
        trending: true,
        activelyApplying: true,
        premium: true
      },
      {
        id: '8',
        name: 'Anita Joshi',
        title: 'Product Manager at Zomato',
        company: 'Zomato',
        location: 'Gurgaon',
        experience: '6y 2m',
        education: 'MBA Product Management ISB 2018, B.Tech CSE 2016',
        skills: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'Analytics', 'A/B Testing', 'Wireframing', 'SQL', 'Python', 'Tableau', 'JIRA', 'Confluence'],
        email: 'anita.joshi@email.com',
        phone: '+91 9876543217',
        avatar: '',
        isActive: true,
        lastActive: '2 days ago',
        matchScore: 90,
        trending: false,
        activelyApplying: true,
        premium: true
      },
      {
        id: '9',
        name: 'Vikram Malhotra',
        title: 'Backend Developer at Swiggy',
        company: 'Swiggy',
        location: 'Bengaluru',
        experience: '5y 9m',
        education: 'B.Tech Computer Science NIT Trichy 2018',
        skills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Kafka', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'TypeScript'],
        email: 'vikram.malhotra@email.com',
        phone: '+91 9876543218',
        avatar: '',
        isActive: true,
        lastActive: '4 hours ago',
        matchScore: 89,
        trending: true,
        activelyApplying: false,
        premium: false
      },
      {
        id: '10',
        name: 'Pooja Agarwal',
        title: 'UI/UX Designer at Adobe',
        company: 'Adobe',
        location: 'Noida',
        experience: '4y 7m',
        education: 'M.Des Interaction Design NID 2019, B.Des 2017',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision', 'Principle', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML/CSS'],
        email: 'pooja.agarwal@email.com',
        phone: '+91 9876543219',
        avatar: '',
        isActive: true,
        lastActive: '1 day ago',
        matchScore: 83,
        trending: false,
        activelyApplying: true,
        premium: true
      },
      {
        id: '11',
        name: 'Suresh Babu',
        title: 'Database Administrator at Oracle',
        company: 'Oracle',
        location: 'Chennai',
        experience: '8y 3m',
        education: 'M.Tech Computer Science Anna University 2016, B.E CSE 2014',
        skills: ['Oracle Database', 'MySQL', 'PostgreSQL', 'MongoDB', 'SQL Server', 'Database Tuning', 'Backup Recovery', 'PL/SQL', 'Shell Scripting', 'Linux', 'AWS RDS', 'Performance Monitoring'],
        email: 'suresh.babu@email.com',
        phone: '+91 9876543220',
        avatar: '',
        isActive: false,
        lastActive: '1 week ago',
        matchScore: 75,
        trending: false,
        activelyApplying: false,
        premium: false
      },
      {
        id: '12',
        name: 'Nisha Gupta',
        title: 'Cybersecurity Analyst at IBM',
        company: 'IBM',
        location: 'Pune',
        experience: '3y 4m',
        education: 'M.Tech Cybersecurity IIT Bombay 2021, B.Tech IT 2019',
        skills: ['Ethical Hacking', 'Penetration Testing', 'CISSP', 'CEH', 'Network Security', 'Vulnerability Assessment', 'SIEM', 'Splunk', 'Wireshark', 'Metasploit', 'Python', 'Linux'],
        email: 'nisha.gupta@email.com',
        phone: '+91 9876543221',
        avatar: '',
        isActive: true,
        lastActive: '8 hours ago',
        matchScore: 91,
        trending: true,
        activelyApplying: true,
        premium: true
      },
      {
        id: '13',
        name: 'Karthik Iyer',
        title: 'Cloud Architect at Google',
        company: 'Google',
        location: 'Bengaluru',
        experience: '9y 1m',
        education: 'M.Tech Cloud Computing IISc 2015, B.E CSE 2013',
        skills: ['Google Cloud Platform', 'AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Microservices', 'Serverless', 'BigQuery', 'Cloud Functions', 'Python', 'Go'],
        email: 'karthik.iyer@email.com',
        phone: '+91 9876543222',
        avatar: '',
        isActive: true,
        lastActive: '30 minutes ago',
        matchScore: 96,
        trending: true,
        activelyApplying: false,
        premium: true
      },
      {
        id: '14',
        name: 'Deepika Rao',
        title: 'Business Analyst at Capgemini',
        company: 'Capgemini',
        location: 'Mumbai',
        experience: '4y 5m',
        education: 'MBA Business Analytics XLRI 2019, B.Com 2017',
        skills: ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'SQL', 'Excel', 'Power BI', 'Tableau', 'JIRA', 'Confluence', 'Agile', 'Scrum', 'Stakeholder Management'],
        email: 'deepika.rao@email.com',
        phone: '+91 9876543223',
        avatar: '',
        isActive: true,
        lastActive: '2 days ago',
        matchScore: 80,
        trending: false,
        activelyApplying: true,
        premium: false
      },
      {
        id: '15',
        name: 'Rohit Sharma',
        title: 'Blockchain Developer at Coinbase',
        company: 'Coinbase',
        location: 'Remote',
        experience: '2y 8m',
        education: 'B.Tech Computer Science IIT Delhi 2021',
        skills: ['Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3.js', 'Truffle', 'Ganache', 'DeFi', 'NFT', 'JavaScript', 'Node.js', 'React'],
        email: 'rohit.sharma@email.com',
        phone: '+91 9876543224',
        avatar: '',
        isActive: true,
        lastActive: '1 hour ago',
        matchScore: 94,
        trending: true,
        activelyApplying: true,
        premium: true
      },
      {
        id: '16',
        name: 'Meera Krishnan',
        title: 'Machine Learning Engineer at Uber',
        company: 'Uber',
        location: 'Hyderabad',
        experience: '5y 3m',
        education: 'Ph.D Machine Learning IIT Madras 2019, M.Tech AI 2017',
        skills: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'MLOps', 'Kubeflow', 'Docker', 'Python'],
        email: 'meera.krishnan@email.com',
        phone: '+91 9876543225',
        avatar: '',
        isActive: true,
        lastActive: '3 hours ago',
        matchScore: 93,
        trending: true,
        activelyApplying: false,
        premium: true
      },
      {
        id: '17',
        name: 'Ajay Patel',
        title: 'SAP Consultant at Deloitte',
        company: 'Deloitte',
        location: 'Mumbai',
        experience: '7y 6m',
        education: 'B.Tech Mechanical Engineering 2016, SAP Certification 2017',
        skills: ['SAP FICO', 'SAP MM', 'SAP SD', 'SAP HANA', 'ABAP', 'SAP S/4HANA', 'Business Process', 'ERP Implementation', 'Project Management', 'Client Interaction', 'Training', 'Documentation'],
        email: 'ajay.patel@email.com',
        phone: '+91 9876543226',
        avatar: '',
        isActive: false,
        lastActive: '5 days ago',
        matchScore: 72,
        trending: false,
        activelyApplying: false,
        premium: false
      },
      {
        id: '18',
        name: 'Sanya Malhotra',
        title: 'Data Engineer at Netflix',
        company: 'Netflix',
        location: 'Bengaluru',
        experience: '4y 9m',
        education: 'M.Tech Big Data Analytics IIT Kharagpur 2019, B.Tech CSE 2017',
        skills: ['Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'Python', 'Scala', 'SQL', 'NoSQL', 'AWS', 'Snowflake', 'dbt', 'Data Modeling'],
        email: 'sanya.malhotra@email.com',
        phone: '+91 9876543227',
        avatar: '',
        isActive: true,
        lastActive: '6 hours ago',
        matchScore: 88,
        trending: false,
        activelyApplying: true,
        premium: true
      },
      {
        id: '19',
        name: 'Manish Kumar',
        title: 'iOS Developer at Apple',
        company: 'Apple',
        location: 'Hyderabad',
        experience: '6y 4m',
        education: 'B.Tech Computer Science 2017',
        skills: ['Swift', 'Objective-C', 'iOS SDK', 'Xcode', 'Core Data', 'Core Animation', 'UIKit', 'SwiftUI', 'Combine', 'MVVM', 'Git', 'App Store'],
        email: 'manish.kumar@email.com',
        phone: '+91 9876543228',
        avatar: '',
        isActive: true,
        lastActive: '2 hours ago',
        matchScore: 86,
        trending: false,
        activelyApplying: true,
        premium: true
      },
      {
        id: '20',
        name: 'Priyanka Singh',
        title: 'Salesforce Developer at Accenture',
        company: 'Accenture',
        location: 'Pune',
        experience: '3y 7m',
        education: 'B.Tech Information Technology 2020, Salesforce Certified',
        skills: ['Salesforce', 'Apex', 'Lightning', 'Visualforce', 'SOQL', 'SOSL', 'Salesforce Admin', 'Process Builder', 'Flow', 'Integration', 'REST API', 'SOAP API'],
        email: 'priyanka.singh@email.com',
        phone: '+91 9876543229',
        avatar: '',
        isActive: true,
        lastActive: '1 day ago',
        matchScore: 79,
        trending: false,
        activelyApplying: true,
        premium: false
      }
    ];
    
    setCandidates(sampleCandidates);
    setFilteredCandidates(sampleCandidates);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = candidates;

    // Boolean search logic
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/);
      const booleanOperators = ['AND', 'OR', 'NOT', '(', ')'];
      
      filtered = filtered.filter(candidate => {
        const searchableText = `${candidate.name} ${candidate.title} ${candidate.company} ${candidate.skills.join(' ')} ${candidate.education}`.toLowerCase();
        
        // Simple boolean search implementation
        if (searchQuery.includes('AND') || searchQuery.includes('OR') || searchQuery.includes('NOT')) {
          // Advanced boolean search
          let query = searchQuery.toLowerCase();
          query = query.replace(/\bAND\b/g, '&&');
          query = query.replace(/\bOR\b/g, '||');
          query = query.replace(/\bNOT\b/g, '!');
          
          // For now, simple keyword matching
          return searchTerms.some(term => 
            !booleanOperators.includes(term.toUpperCase()) && 
            searchableText.includes(term)
          );
        } else {
          // Simple keyword search
          return searchTerms.some(term => searchableText.includes(term));
        }
      });
    }

    // Apply other filters
    if (locationFilter) {
      filtered = filtered.filter(candidate => 
        candidate.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (companyFilter) {
      filtered = filtered.filter(candidate => 
        candidate.company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    if (keywordsFilter) {
      const keywords = keywordsFilter.toLowerCase().split(',').map(k => k.trim());
      filtered = filtered.filter(candidate => 
        keywords.some(keyword => 
          candidate.skills.some(skill => skill.toLowerCase().includes(keyword)) ||
          candidate.title.toLowerCase().includes(keyword)
        )
      );
    }

    if (premiumOnly) {
      filtered = filtered.filter(candidate => candidate.premium);
    }

    // Sort results
    if (sortBy === 'relevance') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => {
        const expA = parseInt(a.experience.split('y')[0]);
        const expB = parseInt(b.experience.split('y')[0]);
        return expB - expA;
      });
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, candidates, locationFilter, companyFilter, keywordsFilter, premiumOnly, sortBy]);

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSaveSearch = () => {
    toast.success('Search saved successfully!');
  };

  const handleCustomize = () => {
    toast.info('Customization options will be available soon!');
  };

  const handleAddToList = () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates to add to list');
      return;
    }
    toast.success(`${selectedCandidates.length} candidates added to list`);
  };

  const handleSetReminder = () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates to set reminder');
      return;
    }
    toast.success(`Reminder set for ${selectedCandidates.length} candidates`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Advanced Search</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {filteredCandidates.length} profiles found
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveSearch} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              <Button onClick={handleCustomize} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-semibold">Filters</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="premium" 
                    checked={premiumOnly}
                    onCheckedChange={setPremiumOnly}
                  />
                  <Label htmlFor="premium" className="text-sm">Premium Institute Candidates</Label>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">Keywords</Label>
                  <Input
                    placeholder="Java, Spring, React..."
                    value={keywordsFilter}
                    onChange={(e) => setKeywordsFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Current Company</Label>
                  <Input
                    placeholder="Company name"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Location</Label>
                  <Input
                    placeholder="City, State"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Experience (Years)</Label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder='Try: "JAVA DEVELOPER" AND ("Kafka" OR "Spring" OR "Spring Boot") AND NOT "Selenium"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hide-profiles" 
                        checked={hideProfiles}
                        onCheckedChange={setHideProfiles}
                      />
                      <Label htmlFor="hide-profiles" className="text-sm">Hide Profiles</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Active in:</Label>
                      <Select value={activeIn} onValueChange={setActiveIn}>
                        <SelectTrigger className="w-24 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1day">1 day</SelectItem>
                          <SelectItem value="3days">3 days</SelectItem>
                          <SelectItem value="1week">1 week</SelectItem>
                          <SelectItem value="1month">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Sort by:</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">AI-relevance</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="experience">Experience</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Show:</Label>
                      <Select value={showCount} onValueChange={setShowCount}>
                        <SelectTrigger className="w-20 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="160">160</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <span className="text-sm text-gray-500">Page 1 of 1</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    Want to email candidates? <Button variant="link" className="p-0 h-auto text-blue-600">Switch to Write</Button>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm">Select all</Label>
                  
                  <Button variant="outline" size="sm" onClick={handleAddToList}>
                    Add to
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleSetReminder}>
                    Set reminder
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id)}
                      />
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-blue-600">{candidate.name}</h3>
                              {candidate.trending && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              {candidate.activelyApplying && (
                                <Badge variant="outline" className="text-xs">
                                  Actively applying
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{candidate.experience}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-500">Java Backend Full Stack Developer (7+ Yrs) in Banking &</div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View phone number
                              </Button>
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-1" />
                                Call candidate
                              </Button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Verified phone & email
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4" />
                              <span>Current: {candidate.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>Previous: Software Engineer at CGI</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4" />
                            <span>Education: {candidate.education}</span>
                          </div>

                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>Pref. locations: {candidate.location}</span>
                          </div>

                          <div className="text-sm">
                            <span className="text-gray-600">Key skills: </span>
                            <span className="text-blue-600">
                              {candidate.skills.slice(0, 8).join(' | ')}
                              {candidate.skills.length > 8 && '...'}
                            </span>
                          </div>

                          <div className="text-sm text-blue-600">
                            May also know: Java Application Development, Spring M... more
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            300 similar profiles
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-xs">
                              Comment
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No candidates found matching your search criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};