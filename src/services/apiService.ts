// API Service for Hostinger MySQL Database Integration
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://ats.culminantexes.com/api';
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Making API request to:', url);
      console.log('Request options:', options);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response detected. Response text:', await response.text());
        throw new Error(`Server returned non-JSON response. Content-Type: ${contentType}`);
      }

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error; // Don't fall back to localStorage, throw the error instead
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const rawResponse = await this.makeRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email,
        password
      })
    });

    console.log('🔍 Normalizing API login response:', rawResponse);

    // Normalize backend response for consistent structure
    if (rawResponse && (rawResponse as any).success) {
      const res: any = rawResponse as any;
      const normalizedData = res.data || {
        user: res.user,
        token: res.token,
        permissions: res.permissions,
      };

      return {
        success: true,
        data: normalizedData,
        message: res.message || 'Login successful',
      };
    }

    return {
      success: false,
      message: (rawResponse as any)?.message || 'Login failed. Please check your credentials.',
    };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        ...userData
      })
    });
  }

  // User Management APIs
  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' })
    });
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/users.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...userData
      })
    });
  }

  async updateUser(userId: string, userData: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/users.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        id: userId,
        ...userData
      })
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/users.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        id: userId
      })
    });
  }

  // Candidate Management APIs
  async getCandidates(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/candidates.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' })
    });
  }

  async createCandidate(candidateData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/candidates.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...candidateData
      })
    });
  }

  async updateCandidate(candidateId: string, candidateData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/candidates.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        id: candidateId,
        ...candidateData
      })
    });
  }

  async deleteCandidate(candidateId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/candidates.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        id: candidateId
      })
    });
  }

  // Job Management APIs
  async getJobs(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/jobs.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' })
    });
  }

  async createJob(jobData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/jobs.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...jobData
      })
    });
  }

  async updateJob(jobId: string, jobData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/jobs.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        id: jobId,
        ...jobData
      })
    });
  }

  async deleteJob(jobId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/jobs.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        id: jobId
      })
    });
  }

  // Interview Management APIs
  async getInterviews(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/interviews.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' })
    });
  }

  async createInterview(interviewData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/interviews.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...interviewData
      })
    });
  }

  async updateInterview(interviewId: string, interviewData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/interviews.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        id: interviewId,
        ...interviewData
      })
    });
  }

  async deleteInterview(interviewId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/interviews.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        id: interviewId
      })
    });
  }

  // Email Logs APIs
  async getEmailLogs(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/email_logs.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' })
    });
  }

  async createEmailLog(emailData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/email_logs.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        ...emailData
      })
    });
  }
}

export const apiService = new ApiService();