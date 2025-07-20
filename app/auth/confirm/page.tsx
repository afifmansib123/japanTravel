'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ConfirmPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const usernameParam = searchParams.get('username');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (usernameParam) {
      setUsername(decodeURIComponent(usernameParam));
    }
    
    console.log('Confirmation page loaded with:', { 
      email: emailParam, 
      username: usernameParam 
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast.error('Username is required for verification');
      return;
    }

    if (code.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      await confirmSignUp(username, code);
      toast.success('Email verified successfully!');
      router.push('/auth/signin');
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!username) {
      toast.error('Username is required to resend code');
      return;
    }

    setResending(true);

    try {
      await resendConfirmationCode(username);
      toast.success('Verification code sent to your email');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <p className="text-gray-600">
              We've sent a verification code to your email address
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Verification code will be sent to this email
                </p>
              </div>

              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !username}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resending || !username}
                className="text-sm"
              >
                {resending ? 'Resending...' : 'Resend verification code'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already verified?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <p>Debug: Email = {email}</p>
                <p>Debug: Username = {username}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}