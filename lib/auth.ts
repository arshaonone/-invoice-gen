import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          await dbConnect()
          const user = await User.findOne({ email: credentials.email }).select('+password')
          if (!user || !user.password) return null
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            plan: user.plan,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect()
          const existing = await User.findOne({ email: user.email })
          if (!existing) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              plan: 'free',
            })
          }
        } catch { return false }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        await dbConnect()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.plan = dbUser.plan
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
