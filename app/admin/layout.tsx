// app/admin/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
// import { getAuthUser } from '@/lib/auth'; // Replace with your auth logic
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  // Add your admin authentication check here
  // const user = await getAuthUser();
  // if (!user || user.role !== 'admin') {
  //   redirect('/signin');
  // }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </AdminAuthWrapper>
  );
}
