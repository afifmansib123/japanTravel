// contexts/AuthContext.tsx - Updated to create users in database
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signUp as amplifySignUp, 
  signIn as amplifySignIn, 
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import '../lib/amplify-config';

interface User {
  id: string;          // Cognito ID
  email: string;
  name?: string;
  role: 'user' | 'admin';
  emailVerified?: boolean;
  _id?: string;        // MongoDB ID
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'user' | 'admin') => Promise<{ needsConfirmation: boolean; username: string }>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuthState();
          break;
        case 'signedOut':
          setUser(null);
          break;
        case 'tokenRefresh':
          checkAuthState();
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Function to create user in database
  const createUserInDatabase = async (cognitoUser: any, idToken: any) => {
    try {
      const userData = {
        cognitoId: cognitoUser.userId,
        email: idToken?.payload.email || '',
        name: idToken?.payload.name || '',
        role: (idToken?.payload['custom:role'] || 'user')
      };

      console.log('Creating user in database:', userData);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const dbUser = await response.json();
        console.log('User created in database:', dbUser);
        return dbUser;
      } else {
        const error = await response.json();
        console.error('Failed to create user in database:', error);
        return null;
      }
    } catch (error) {
      console.error('Error creating user in database:', error);
      return null;
    }
  };

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      if (currentUser && session.tokens) {
        const idToken = session.tokens.idToken;
        const userRole = (idToken?.payload['custom:role'] as string) || 'user';
        
        console.log('Cognito user found:', {
          userId: currentUser.userId,
          email: idToken?.payload.email,
          role: userRole
        });

        // Create user in database (API will handle duplicates)
        const dbUser = await createUserInDatabase(currentUser, idToken);
        
        // Set user state with combined data
        setUser({
          id: currentUser.userId,
          email: idToken?.payload.email as string || '',
          name: idToken?.payload.name as string,
          role: userRole as 'user' | 'admin',
          emailVerified: idToken?.payload.email_verified as boolean,
          _id: dbUser?._id,
          createdAt: dbUser?.createdAt,
          updatedAt: dbUser?.updatedAt
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await amplifySignIn({ 
        username: email,
        password 
      });
      
      if (result.isSignedIn) {
        await checkAuthState();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'user' | 'admin' = 'user'
  ): Promise<{ needsConfirmation: boolean; username: string }> => {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const username = `${email.split('@')[0]}_${timestamp}_${randomStr}`;
      
      console.log('Creating Cognito user:', { username, email, name, role });
      
      const result = await amplifySignUp({
        username: username,
        password,
        options: {
          userAttributes: {
            email,
            name,
            'custom:role': role
          }
        }
      });

      console.log('Cognito signup result:', result);

      return {
        needsConfirmation: !result.isSignUpComplete,
        username: username
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      console.log('Confirming signup with username:', username, 'and code:', code);
      
      await amplifyConfirmSignUp({
        username: username,
        confirmationCode: code
      });
      
      console.log('Confirmation successful');
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      throw new Error(error.message || 'Failed to confirm account');
    }
  };

  const resendConfirmationCode = async (username: string) => {
    try {
      console.log('Resending code for username:', username);
      
      await amplifyResendSignUpCode({
        username: username
      });
      
      console.log('Code resent successfully');
    } catch (error: any) {
      console.error('Resend confirmation code error:', error);
      throw new Error(error.message || 'Failed to resend confirmation code');
    }
  };

  const signOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    resendConfirmationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}