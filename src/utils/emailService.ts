export interface EmailTemplate {
  subject: string;
  body: string;
  recipients: string[];
  cc?: string[];
}

export interface EmailNotification {
  id: string;
  type: 'job_created' | 'candidate_added' | 'interview_scheduled' | 'interview_status_changed' | 'candidate_shortlisted' | 'candidate_offered' | 'candidate_joined';
  subject: string;
  body: string;
  recipients: string[];
  cc?: string[];
  timestamp: string;
  status: 'sent' | 'pending' | 'failed';
  relatedId: string; // Job ID, Candidate ID, or Interview ID
}

class EmailService {
  private notifications: EmailNotification[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    const saved = localStorage.getItem('emailNotifications');
    this.notifications = saved ? JSON.parse(saved) : [];
  }

  private saveNotifications() {
    localStorage.setItem('emailNotifications', JSON.stringify(this.notifications));
  }

  private getAdminEmails(): string[] {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users
      .filter((user: any) => user.role === 'admin')
      .map((user: any) => user.email)
      .filter(Boolean);
  }

  private getReportingPersonEmail(reportingPersonId?: string): string | null {
    if (!reportingPersonId) return null;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reportingPerson = users.find((user: any) => user.id === reportingPersonId);
    return reportingPerson?.email || null;
  }

  private createNotification(
    type: EmailNotification['type'],
    subject: string,
    body: string,
    recipients: string[],
    cc: string[] = [],
    relatedId: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      subject,
      body,
      recipients: recipients.filter(Boolean),
      cc: [...cc.filter(Boolean), ...this.getAdminEmails()],
      timestamp: new Date().toISOString(),
      status: 'sent', // In real implementation, this would be 'pending' until actually sent
      relatedId
    };

    this.notifications.push(notification);
    this.saveNotifications();
    return notification;
  }

  // Job Creation Email
  sendJobCreatedEmail(job: any, createdBy: any): EmailNotification {
    const subject = `New Job Created: ${job.jobCode} - ${job.client}`;
    const body = `
      <h3>New Job Requirement Created</h3>
      <p><strong>Job Code:</strong> ${job.jobCode}</p>
      <p><strong>Client:</strong> ${job.client}</p>
      <p><strong>Skill:</strong> ${job.skill}</p>
      <p><strong>Work Location:</strong> ${job.workLocation}</p>
      <p><strong>Open Positions:</strong> ${job.openPosition}</p>
      <p><strong>Team Lead:</strong> ${job.teamLead}</p>
      <p><strong>Principle Consultant:</strong> ${job.principleConsultant}</p>
      <p><strong>Budget:</strong> ${job.budget}</p>
      <p><strong>Created By:</strong> ${createdBy.name} (${createdBy.email})</p>
      <p><strong>Created On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const recipients = [job.teamLead, job.principleConsultant].filter(Boolean);
    return this.createNotification('job_created', subject, body, recipients, [], job.id);
  }

  // Candidate Added Email
  sendCandidateAddedEmail(candidate: any, addedBy: any): EmailNotification {
    const subject = `New Candidate Added: ${candidate.name} - ${candidate.jobCode}`;
    const body = `
      <h3>New Candidate Registered</h3>
      <p><strong>Candidate Name:</strong> ${candidate.name}</p>
      <p><strong>Job Code:</strong> ${candidate.jobCode}</p>
      <p><strong>Client:</strong> ${candidate.client}</p>
      <p><strong>Skill:</strong> ${candidate.skill}</p>
      <p><strong>Experience:</strong> ${candidate.experience}</p>
      <p><strong>Mobile:</strong> ${candidate.mobile}</p>
      <p><strong>Email:</strong> ${candidate.email}</p>
      <p><strong>Location:</strong> ${candidate.location}</p>
      <p><strong>Recruiter:</strong> ${candidate.recruiter}</p>
      <p><strong>Added By:</strong> ${addedBy.name} (${addedBy.email})</p>
      <p><strong>Added On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(addedBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('candidate_added', subject, body, recipients, [], candidate.id);
  }

  // Interview Scheduled Email
  sendInterviewScheduledEmail(interview: any, scheduledBy: any): EmailNotification {
    const subject = `Interview Scheduled: ${interview.candidateName} - ${interview.jobCode}`;
    const body = `
      <h3>Interview Scheduled</h3>
      <p><strong>Candidate:</strong> ${interview.candidateName}</p>
      <p><strong>Job Code:</strong> ${interview.jobCode}</p>
      <p><strong>Client:</strong> ${interview.client}</p>
      <p><strong>Interview Date:</strong> ${interview.interviewDate}</p>
      <p><strong>Interview Time:</strong> ${interview.interviewTime}</p>
      <p><strong>Interview Type:</strong> ${interview.interviewType}</p>
      <p><strong>Interviewer:</strong> ${interview.interviewer}</p>
      <p><strong>Candidate Mobile:</strong> ${interview.candidateMobile}</p>
      <p><strong>Candidate Email:</strong> ${interview.candidateEmail}</p>
      <p><strong>Scheduled By:</strong> ${scheduledBy.name} (${scheduledBy.email})</p>
      <p><strong>Scheduled On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(scheduledBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('interview_scheduled', subject, body, recipients, [], interview.id);
  }

  // Interview Status Changed Email
  sendInterviewStatusChangedEmail(interview: any, oldStatus: string, newStatus: string, updatedBy: any): EmailNotification {
    const subject = `Interview Status Updated: ${interview.candidateName} - ${oldStatus} → ${newStatus}`;
    const body = `
      <h3>Interview Status Changed</h3>
      <p><strong>Candidate:</strong> ${interview.candidateName}</p>
      <p><strong>Job Code:</strong> ${interview.jobCode}</p>
      <p><strong>Client:</strong> ${interview.client}</p>
      <p><strong>Previous Status:</strong> <span style="color: #dc3545;">${oldStatus}</span></p>
      <p><strong>New Status:</strong> <span style="color: #28a745;">${newStatus}</span></p>
      <p><strong>Interview Date:</strong> ${interview.interviewDate}</p>
      <p><strong>Interview Time:</strong> ${interview.interviewTime}</p>
      <p><strong>Interviewer:</strong> ${interview.interviewer}</p>
      <p><strong>Updated By:</strong> ${updatedBy.name} (${updatedBy.email})</p>
      <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
      
      ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
      
      <hr>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(updatedBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('interview_status_changed', subject, body, recipients, [], interview.id);
  }

  // Candidate Shortlisted Email
  sendCandidateShortlistedEmail(candidate: any, updatedBy: any): EmailNotification {
    const subject = `Candidate Shortlisted: ${candidate.name} - ${candidate.jobCode}`;
    const body = `
      <h3>🎉 Candidate Shortlisted</h3>
      <p><strong>Candidate:</strong> ${candidate.name}</p>
      <p><strong>Job Code:</strong> ${candidate.jobCode}</p>
      <p><strong>Client:</strong> ${candidate.client}</p>
      <p><strong>Skill:</strong> ${candidate.skill}</p>
      <p><strong>Experience:</strong> ${candidate.experience}</p>
      <p><strong>Status:</strong> <span style="color: #28a745;">Shortlisted</span></p>
      <p><strong>Status Details:</strong> ${candidate.status1}</p>
      <p><strong>Mobile:</strong> ${candidate.mobile}</p>
      <p><strong>Email:</strong> ${candidate.email}</p>
      <p><strong>Updated By:</strong> ${updatedBy.name} (${updatedBy.email})</p>
      <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><strong>Next Steps:</strong> Prepare offer letter and salary negotiation.</p>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(updatedBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('candidate_shortlisted', subject, body, recipients, [], candidate.id);
  }

  // Candidate Offered Email
  sendCandidateOfferedEmail(candidate: any, updatedBy: any): EmailNotification {
    const subject = `Offer Extended: ${candidate.name} - ${candidate.jobCode}`;
    const body = `
      <h3>💼 Offer Extended to Candidate</h3>
      <p><strong>Candidate:</strong> ${candidate.name}</p>
      <p><strong>Job Code:</strong> ${candidate.jobCode}</p>
      <p><strong>Client:</strong> ${candidate.client}</p>
      <p><strong>Skill:</strong> ${candidate.skill}</p>
      <p><strong>Status:</strong> <span style="color: #ffc107;">Offer Extended</span></p>
      <p><strong>Status Details:</strong> ${candidate.status1}</p>
      <p><strong>Mobile:</strong> ${candidate.mobile}</p>
      <p><strong>Email:</strong> ${candidate.email}</p>
      <p><strong>Updated By:</strong> ${updatedBy.name} (${updatedBy.email})</p>
      <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><strong>Next Steps:</strong> Follow up for offer acceptance and joining date confirmation.</p>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(updatedBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('candidate_offered', subject, body, recipients, [], candidate.id);
  }

  // Candidate Joined Email
  sendCandidateJoinedEmail(candidate: any, updatedBy: any): EmailNotification {
    const subject = `🎉 Candidate Joined: ${candidate.name} - ${candidate.jobCode}`;
    const body = `
      <h3>🎉 Successful Placement - Candidate Joined</h3>
      <p><strong>Candidate:</strong> ${candidate.name}</p>
      <p><strong>Job Code:</strong> ${candidate.jobCode}</p>
      <p><strong>Client:</strong> ${candidate.client}</p>
      <p><strong>Skill:</strong> ${candidate.skill}</p>
      <p><strong>Experience:</strong> ${candidate.experience}</p>
      <p><strong>Status:</strong> <span style="color: #28a745;">Joined</span></p>
      <p><strong>Status Details:</strong> ${candidate.status1}</p>
      <p><strong>Mobile:</strong> ${candidate.mobile}</p>
      <p><strong>Email:</strong> ${candidate.email}</p>
      <p><strong>Recruiter:</strong> ${candidate.recruiter}</p>
      <p><strong>Updated By:</strong> ${updatedBy.name} (${updatedBy.email})</p>
      <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><strong>🎊 Congratulations on the successful placement!</strong></p>
      <p><em>This is an automated notification from the Recruitment Management System.</em></p>
    `;

    const reportingEmail = this.getReportingPersonEmail(updatedBy.reportingTo);
    const recipients = reportingEmail ? [reportingEmail] : [];
    return this.createNotification('candidate_joined', subject, body, recipients, [], candidate.id);
  }

  // Get all notifications
  getAllNotifications(): EmailNotification[] {
    return this.notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get notifications by type
  getNotificationsByType(type: EmailNotification['type']): EmailNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get notifications for a specific related ID
  getNotificationsForId(relatedId: string): EmailNotification[] {
    return this.notifications.filter(n => n.relatedId === relatedId);
  }

  // Mark notification as read/processed
  markAsProcessed(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'sent';
      this.saveNotifications();
    }
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }
}

// Simple email sending function for user credentials
export const sendEmail = async (emailData: {
  to: string;
  toName: string;
  subject: string;
  message: string;
}): Promise<boolean> => {
  try {
    // In a real application, this would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate email sending and log it
    console.log('Sending email to:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Message:', emailData.message);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const emailService = new EmailService();