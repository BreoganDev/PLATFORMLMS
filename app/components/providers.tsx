
'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
