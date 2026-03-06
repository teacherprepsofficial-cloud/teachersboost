'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) return
    if (pathname === '/onboarding') return
    if (!(session.user as any).onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [session, status, pathname])

  return <>{children}</>
}
