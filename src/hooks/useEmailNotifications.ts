import { useAuth } from '@/contexts/AuthContext';
import { emailService, EmailNotification } from '@/utils/emailService';
import { toast } from 'sonner';

export const useEmailNotifications = () => {
  const { user } = useAuth();

  const sendJobCreatedEmail = (job: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendJobCreatedEmail(job, user);
      toast.success('Job creation notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send job creation notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendCandidateAddedEmail = (candidate: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendCandidateAddedEmail(candidate, user);
      toast.success('Candidate addition notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send candidate addition notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendInterviewScheduledEmail = (interview: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendInterviewScheduledEmail(interview, user);
      toast.success('Interview scheduled notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send interview scheduled notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendInterviewStatusChangedEmail = (interview: any, oldStatus: string, newStatus: string): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendInterviewStatusChangedEmail(interview, oldStatus, newStatus, user);
      toast.success('Interview status change notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send interview status change notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendCandidateShortlistedEmail = (candidate: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendCandidateShortlistedEmail(candidate, user);
      toast.success('Candidate shortlisted notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send candidate shortlisted notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendCandidateOfferedEmail = (candidate: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendCandidateOfferedEmail(candidate, user);
      toast.success('Candidate offered notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send candidate offered notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const sendCandidateJoinedEmail = (candidate: any): EmailNotification | null => {
    if (!user) return null;
    
    try {
      const notification = emailService.sendCandidateJoinedEmail(candidate, user);
      toast.success('Candidate joined notification sent successfully');
      return notification;
    } catch (error) {
      toast.error('Failed to send candidate joined notification');
      console.error('Email notification error:', error);
      return null;
    }
  };

  const getAllNotifications = (): EmailNotification[] => {
    return emailService.getAllNotifications();
  };

  const getNotificationsByType = (type: EmailNotification['type']): EmailNotification[] => {
    return emailService.getNotificationsByType(type);
  };

  const getNotificationsForId = (relatedId: string): EmailNotification[] => {
    return emailService.getNotificationsForId(relatedId);
  };

  const markAsProcessed = (notificationId: string): void => {
    emailService.markAsProcessed(notificationId);
  };

  const deleteNotification = (notificationId: string): void => {
    emailService.deleteNotification(notificationId);
    toast.success('Notification deleted successfully');
  };

  const clearAllNotifications = (): void => {
    emailService.clearAllNotifications();
    toast.success('All notifications cleared successfully');
  };

  return {
    sendJobCreatedEmail,
    sendCandidateAddedEmail,
    sendInterviewScheduledEmail,
    sendInterviewStatusChangedEmail,
    sendCandidateShortlistedEmail,
    sendCandidateOfferedEmail,
    sendCandidateJoinedEmail,
    getAllNotifications,
    getNotificationsByType,
    getNotificationsForId,
    markAsProcessed,
    deleteNotification,
    clearAllNotifications
  };
};