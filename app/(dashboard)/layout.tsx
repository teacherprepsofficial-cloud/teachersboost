import { DashboardShell } from '@/components/DashboardShell'
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
    <DashboardShell>
      <OnboardingGuard>{children}</OnboardingGuard>
    </DashboardShell>
  )
}
