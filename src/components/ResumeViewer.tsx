import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Download, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Star,
  Award,
  Code,
  Languages,
  X
} from 'lucide-react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    location: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
    languages: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}

interface ResumeViewerProps {
  candidateName: string;
  resumeUrl?: string;
  resumeData?: ResumeData;
  trigger?: React.ReactNode;
}

export const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  candidateName, 
  resumeUrl, 
  resumeData,
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sample resume data if none provided
  const defaultResumeData: ResumeData = {
    personalInfo: {
      name: candidateName,
      email: `${candidateName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: '+91 9876543210',
      location: 'Bengaluru, Karnataka',
      linkedin: 'linkedin.com/in/profile',
      portfolio: 'portfolio.dev'
    },
    summary: "Experienced software developer with 7+ years in full-stack development, specializing in Java, Spring Boot, and modern web technologies. Proven track record of delivering scalable applications and leading development teams.",
    experience: [
      {
        title: 'Senior Software Developer',
        company: 'Accenture',
        duration: 'Jan 2020 - Present',
        location: 'Bengaluru, India',
        description: [
          'Led development of microservices architecture serving 1M+ users',
          'Implemented CI/CD pipelines reducing deployment time by 60%',
          'Mentored junior developers and conducted code reviews',
          'Collaborated with cross-functional teams to deliver features on time'
        ]
      },
      {
        title: 'Software Developer',
        company: 'TCS',
        duration: 'Jun 2017 - Dec 2019',
        location: 'Chennai, India',
        description: [
          'Developed and maintained Java-based web applications',
          'Integrated third-party APIs and payment gateways',
          'Optimized database queries improving performance by 40%',
          'Participated in agile development processes'
        ]
      }
    ],
    education: [
      {
        degree: 'Master of Computer Applications (MCA)',
        institution: 'Biju Patnaik University of Technology',
        year: '2018',
        grade: '8.5 CGPA'
      },
      {
        degree: 'Bachelor of Science (Computer Science)',
        institution: 'Utkal University',
        year: '2015',
        grade: '7.8 CGPA'
      }
    ],
    skills: {
      technical: ['Java', 'Spring Boot', 'Spring MVC', 'Hibernate', 'REST APIs', 'Microservices', 'SQL', 'NoSQL'],
      tools: ['Git', 'Jenkins', 'Docker', 'Kubernetes', 'AWS', 'Maven', 'IntelliJ IDEA', 'Postman'],
      languages: ['Java', 'JavaScript', 'Python', 'SQL', 'HTML/CSS']
    },
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a scalable e-commerce platform with microservices architecture',
        technologies: ['Spring Boot', 'React', 'PostgreSQL', 'Redis', 'AWS'],
        link: 'github.com/project'
      },
      {
        name: 'Banking Application',
        description: 'Developed secure banking application with real-time transaction processing',
        technologies: ['Java', 'Spring Security', 'Oracle DB', 'Angular']
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        year: '2022'
      },
      {
        name: 'Oracle Certified Java Programmer',
        issuer: 'Oracle',
        year: '2019'
      }
    ]
  };

  const resumeToDisplay = resumeData || defaultResumeData;

  const handleDownload = () => {
    // Simulate resume download
    const link = document.createElement('a');
    link.href = resumeUrl || '#';
    link.download = `${candidateName}_Resume.pdf`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{candidateName}'s Resume</span>
            </DialogTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{resumeToDisplay.personalInfo.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{resumeToDisplay.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{resumeToDisplay.personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{resumeToDisplay.personalInfo.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{resumeToDisplay.summary}</p>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Work Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeToDisplay.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                    <Badge variant="secondary">{exp.duration}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="font-medium text-blue-600">{exp.company}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{exp.location}</span>
                  </div>
                  <ul className="space-y-1">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Education</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeToDisplay.education.map((edu, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-blue-600">{edu.institution}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{edu.year}</Badge>
                    {edu.grade && <p className="text-sm text-gray-500 mt-1">{edu.grade}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeToDisplay.skills.technical.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeToDisplay.skills.tools.map((tool, index) => (
                    <Badge key={index} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Programming Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeToDisplay.skills.languages.map((lang, index) => (
                    <Badge key={index} variant="default">{lang}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeToDisplay.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeToDisplay.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                  </div>
                  <Badge variant="outline">{cert.year}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};