'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(t('toast.signInSuccess'));
      router.push('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error cases
      if (error.message.includes('UserNotConfirmedException')) {
        toast.error(t('toast.verifyEmail'));
        router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
      } else if (error.message.includes('NotAuthorizedException')) {
        toast.error(t('toast.invalidCredentials'));
      } else if (error.message.includes('UserNotFoundException')) {
        toast.error(t('toast.userNotFound'));
      } else {
        toast.error(error.message || t('toast.signInFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('auth.signin.title')}</CardTitle>
            <p className="text-gray-600">{t('auth.signin.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('auth.signin.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.signin.emailPlaceholder')}
                />
              </div>
              
              <div>
                <Label htmlFor="password">{t('auth.signin.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.signin.passwordPlaceholder')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signin.signingIn') : t('auth.signin.button')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signin.noAccount')}{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:underline">
                  {t('nav.signup')}
                </Link>
              </p>
            </div>

            {/* Demo credentials info - you can remove this later */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">{t('auth.signin.demoAccount')}</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>{t('auth.signin.demoDesc1')}</p>
                <p>{t('auth.signin.demoDesc2')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}