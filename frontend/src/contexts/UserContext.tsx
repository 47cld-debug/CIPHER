import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserProfile } from '../types/user';

interface UserContextType {
  userProfile: UserProfile | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const userProfile: UserProfile | null = user
    ? {
        id: user.id,
        employee_number: user.employee_number,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
      }
    : null;

  return (
    <UserContext.Provider value={{ userProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
