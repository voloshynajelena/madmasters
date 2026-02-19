import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';
import { AdminSidebar } from '@/components/admin/sidebar';

async function verifyAuth() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <AdminSidebar user={user} />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
