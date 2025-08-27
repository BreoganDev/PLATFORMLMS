import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Maternidad en Calma - Plataforma de Aprendizaje',
  description: 'Aprende a estar en calma, gestionarte, nutrición, psicología y trenzas profesionales. Cursos para madres, padres y profesionales.',
  keywords: ['maternidad', 'trenzas', 'entrenzarte', 'nutrición', 'psicología', 'calma', 'cursos online'],
  authors: [{ name: 'Maternidad en Calma' }],
  creator: 'Maternidad en Calma',
  publisher: 'Maternidad en Calma',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rosa Delia Cabrera - Plataforma de Aprendizaje',
    description: 'Aprende a estar en calma, gestionarte, nutrición, psicología y trenzas profesionales.',
    url: '/',
    siteName: 'Rosa Delia Cabrera',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rosa Delia Cabrera - Plataforma de Aprendizaje',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosa Delia Cabrera - Plataforma de Aprendizaje',
    description: 'Aprende a estar en calma, gestionarte, nutrición, psicología y trenzas profesionales.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Favicon básico */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              expand
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}