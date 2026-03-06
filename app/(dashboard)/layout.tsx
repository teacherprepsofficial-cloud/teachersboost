import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { OnboardingGuard } from '@/components/OnboardingGuard'

export const metadata = {
  title: 'Dashboard - TeachersBoost',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      {/* Full-width top bar */}
      <TopBar />
      {/* Below top bar: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <OnboardingGuard>{children}</OnboardingGuard>
        </main>
      </div>
    </div>
  )
}
