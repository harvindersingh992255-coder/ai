'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Plan, User } from '@/lib/types';

const defaultUser: User = {
    name: 'John Doe',
    avatarUrl: 'https://picsum.photos/seed/1/100/100',
};

type UserContextType = {
  user: User;
  plan: Plan;
  setPlan: Dispatch<SetStateAction<Plan>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>(defaultUser);
  const [plan, setPlan] = useState<Plan>('Basic');

  return (
    <UserContext.Provider value={{ user, plan, setPlan }}>
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
