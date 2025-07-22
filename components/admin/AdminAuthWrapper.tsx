"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute'; // Adjust path if needed
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

const AdminAuthWrapper: React.FC<AdminAuthWrapperProps> = ({ children }) => {
  const { t } = useLanguage();

  return (
    <ProtectedRoute 
      allowedRoles={['admin']} 
      redirectTo="/auth/signin"
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminAuthWrapper;