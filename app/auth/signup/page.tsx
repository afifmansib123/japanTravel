'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t('toast.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('toast.passwordTooShort'));
      return;
    }

    // Basic password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error(t('toast.passwordWeak'));
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, name, role);
      
      if (result.needsConfirmation) {
        toast.success(t('toast.accountCreated'));
        // Pass both email and username to confirmation page
        router.push(`/auth/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(result.username)}`);
      } else {
        toast.success(t('toast.accountSuccess'));
        router.push('/');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || t('toast.createAccountFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('auth.signup.title')}</CardTitle>
            <p className="text-gray-600">{t('auth.signup.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('auth.signup.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('auth.signup.fullNamePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="email">{t('auth.signin.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.signup.emailPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="role">{t('auth.signup.accountType')}</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'user' | 'admin')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user">{t('auth.signup.user')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">{t('auth.signup.admin')}</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="password">{t('auth.signin.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.signup.passwordRequirements')}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signup.creating') : t('auth.signup.button')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signup.hasAccount')}{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  {t('nav.signin')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}