import { redirect } from 'next/navigation';

export default function AdminLayout({
  children }: {
  children: React.ReactNode;
}) {
  // This layout will be used for all admin pages
  // The authentication is handled by the AdminAuthGuard component
  return <>{children}</>;
}
