import { compareSync } from 'bcrypt-ts-edge'
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null

        //Find User in DB
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        })

        // Check if the user exists and the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          )

          // If PW is correct, return User
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        }

        // If User does not exist of PW does not match
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // Set User ID from the token
      session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      // If there is an update, set the user's name
      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    },
    async jwt({ token, user }: any) {
      // Assign user fields to the token
      if (user) {
        token.role = user.role

        // If user has no name, use first part of email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0]

          // Update database to reflect token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          })
        }
      }
      return token
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
