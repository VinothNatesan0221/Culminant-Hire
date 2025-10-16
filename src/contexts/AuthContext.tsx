import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { apiService } from '@/services/apiService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Auto clock-in on login
        setTimeout(() => {
          const today = new Date().toISOString().split('T')[0];
          const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
          const existingEntry = timeEntries.find((entry: any) => 
            entry.userId === userData.id && entry.date === today && entry.status === 'clocked-in'
          );
          
          if (!existingEntry) {
            const newEntry = {
              id: Date.now().toString(),
              userId: userData.id,
              userName: userData.name,
              clockInTime: new Date().toISOString(),
              date: today,
              status: 'clocked-in'
            };
            timeEntries.push(newEntry);
            localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
          }
        }, 100);
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      // Auto clock-out on logout
      const today = new Date().toISOString().split('T')[0];
      const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const activeEntry = timeEntries.find((entry: any) => 
        entry.userId === user.id && entry.date === today && entry.status === 'clocked-in'
      );
      
      if (activeEntry) {
        const now = new Date();
        const clockInTime = new Date(activeEntry.clockInTime);
        const totalHours = Math.round(((now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;
        
        const updatedEntry = {
          ...activeEntry,
          clockOutTime: now.toISOString(),
          totalHours,
          status: 'clocked-out'
        };
        
        const updatedEntries = timeEntries.map((entry: any) => 
          entry.id === activeEntry.id ? updatedEntry : entry
        );
        
        localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
      }
    }
    
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};