import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ NextAuth: credenciales faltantes')
          return null
        }

        const user = await db.user.findUnique({ where: { email: credentials.email } })
        console.log('👤 NextAuth: Usuario encontrado:', !!user)

        if (!user || !user.password) {
          console.log('❌ NextAuth: usuario inexistente o sin password')
          return null
        }

        const ok = await bcrypt.compare(credentials.password, user.password)
        console.log('🔐 NextAuth: contraseña válida:', ok)

        if (!ok) return null

        // Devuelve lo mínimo necesario; el resto se hidrata en callbacks
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role, // <- lo propagamos al token en jwt()
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Primer login: copiar campos del user al token
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role ?? 'STUDENT'
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
        token.picture = (user as any).image ?? token.picture
      }

      // Rehidratar desde DB en peticiones posteriores (sin perder campos internos)
      if (token.email) {
        try {
          const dbUser = await db.user.findUnique({ where: { email: token.email } })
          if (dbUser) {
            token = {
              ...token,                 // 👈 mantener sub/iat/exp etc.
              id: dbUser.id,
              role: dbUser.role,
              name: dbUser.name ?? token.name,
              picture: dbUser.image ?? token.picture,
            }
          }
        } catch (e) {
          console.error('💥 Error en JWT callback:', e)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = (token.role as any) ?? 'STUDENT'
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email
        session.user.image = (token.picture as any) ?? session.user.image
      }
      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
