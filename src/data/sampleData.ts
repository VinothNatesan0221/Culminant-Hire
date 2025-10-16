import { Candidate } from '@/types';

export const sampleCandidates: Candidate[] = [
  {
    id: '1',
    date: '2025-04-01',
    jobCode: 'KAPR25-009',
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
  },
  {
    id: '3',
    date: '2025-04-01',
    jobCode: 'KAPR25-009',
    client: 'HCL',
    clientName: 'Saurabh Dwivedi',
    location: 'Noida/Bangalore',
    name: 'Dayasundar P',
    mobile: '9966562421',
    status: 'Not Interested',
    email: 'sundayana@email.com',
    skill: 'Network',
    status1: 'Location Issue',
    recruiter: 'Pancharatna',
    am: 'Divya Bharathi'
  },
  {
    id: '4',
    date: '2025-04-01',
    jobCode: 'KAPR25-009',
    client: 'HCL',
    clientName: 'Saurabh Dwivedi',
    location: 'Noida/Bangalore',
    name: 'Sathish Kumar',
    mobile: '9044072111',
    status: 'Not Interested',
    email: 'sathish1402@email.com',
    skill: 'Network',
    status1: 'Salary Issue',
    recruiter: 'Pancharatna',
    am: 'Divya Bharathi'
  },
  {
    id: '5',
    date: '2025-04-01',
    jobCode: 'KAPR25-009',
    client: 'HCL',
    clientName: 'Saurabh Dwivedi',
    location: 'Noida/Bangalore',
    name: 'Firoz Ahmed',
    mobile: '8747841387',
    status: 'No Response',
    email: 'badakhan1@email.com',
    skill: 'Network',
    status1: 'Phone Not Reachable',
    recruiter: 'Pancharatna',
    am: 'Divya Bharathi'
  }
];

// Function to initialize sample data on first load
export const initializeSampleData = () => {
  const existingCandidates = localStorage.getItem('candidates');
  if (!existingCandidates) {
    localStorage.setItem('candidates', JSON.stringify(sampleCandidates));
  }
};