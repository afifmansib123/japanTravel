import dynamic from 'next/dynamic';

const AdminCategories = dynamic(() => import('@/components/admin/AdminCategories'), { ssr: false });

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}