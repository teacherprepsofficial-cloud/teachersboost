import { Sidebar } from '@/components/Sidebar'

export const metadata = {
  title: 'Dashboard - TeachersBoost',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
