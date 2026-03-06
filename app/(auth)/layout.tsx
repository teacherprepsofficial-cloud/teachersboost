import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

export const metadata = {
  title: 'Auth - TeachersBoost',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
