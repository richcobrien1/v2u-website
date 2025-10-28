// website/app/admin/r2-manager/page.tsx
import R2ManagerPage from '@/components/admin/R2ManagerPage'

export const metadata = {
  title: 'R2 Manager - Admin',
  description: 'Manage R2 storage buckets',
}

export default function R2ManagerRoute() {
  return <R2ManagerPage />
}
