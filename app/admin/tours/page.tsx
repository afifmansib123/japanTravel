// app/admin/tours/page.tsx
import dynamic from 'next/dynamic';

const AdminTours = dynamic(() => import('@/components/admin/AdminTours'), { ssr: false });

export default function AdminToursPage() {
  return <AdminTours />;
}