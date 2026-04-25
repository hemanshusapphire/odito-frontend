import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  // Secret is required for JWT strategy
  secret: process.env.NEXTAUTH_SECRET,
  // Increase timeout for Google OAuth discovery
  debug: process.env.NODE_ENV === 'development',
  // Add global timeout configuration
  maxAge: 60 * 60 * 24 * 7, // 7 days
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 15000, // 15 seconds timeout
      },
      issuer: "https://accounts.google.com",
      wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
      client: {
        token_endpoint_auth_method: "client_secret_post",
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      // Store Google profile data for jwt callback
      if (account?.provider === "google" && profile) {
        user.googleProfile = {
          email: profile.email,
          googleId: profile.sub,
          name: profile.name,
          avatar: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name
        };
      }
      
      // Always return true for Google to prevent AccessDenied
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the callbackUrl is provided and it's relative to the baseUrl, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For relative URLs, prepend baseUrl
      if (url.startsWith('/')) {
        return baseUrl + url;
      }
      
      // Default fallback
      return baseUrl;
    },
    async jwt({ token, account, user }) {
      // Store provider info
      if (account) {
        token.provider = account.provider;
      }
      
      // Handle backend token exchange for Google
      if (account?.provider === "google" && user?.googleProfile) {
        try {
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/google/callback`;
          
          const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user.googleProfile)
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
              token.backendToken = result.data.token;
              token.backendUser = result.data.user;
              token.isNewUser = result.data.user.isNewUser;
            }
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Make backend token and user data available to client
      if (token.backendToken) {
        session.backendToken = token.backendToken;
      }
      if (token.backendUser) {
        session.backendUser = token.backendUser;
        // Include emailVerified status from backend user data
        session.backendUser.isEmailVerified = token.backendUser.isEmailVerified || false;
      }
      if (token.provider) {
        session.provider = token.provider;
      }
      if (token.isNewUser !== undefined) {
        session.isNewUser = token.isNewUser;
      }
      
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  events: {
    async error(message) {
      // Silent error handling
    }
  }
})

export { handler as GET, handler as POST }
