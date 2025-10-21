"use client";

import { AuthContext, useAuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

export const useAuth = () => {
  const context = useAuthContext();
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
