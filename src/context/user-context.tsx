'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Plan, User } from '@/lib/types';

const defaultUser: User = {
    name: 'Guest User',
    avatarUrl: '',
};

type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  plan: Plan;
  setPlan: Dispatch<SetStateAction<Plan>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [plan, setPlan] = useState<Plan>('Basic');

  return (
    <UserContext.Provider value={{ user, setUser, plan, setPlan }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
