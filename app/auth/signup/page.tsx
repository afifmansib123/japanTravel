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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('auth.signup.title')}
            </CardTitle>
            <p className="text-gray-600 text-sm">{t('auth.signup.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('auth.signup.name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('auth.signup.fullNamePlaceholder')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('auth.signin.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.signup.emailPlaceholder')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  {t('auth.signup.accountType')}
                </Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'user' | 'admin')} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer">
                    <RadioGroupItem value="user" id="user" className="text-emerald-600" />
                    <Label htmlFor="user" className="cursor-pointer font-medium text-gray-700">
                      {t('auth.signup.user')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" className="text-emerald-600" />
                    <Label htmlFor="admin" className="cursor-pointer font-medium text-gray-700">
                      {t('auth.signup.admin')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('auth.signin.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  minLength={8}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300"
                />
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium">
                    {t('auth.signup.passwordRequirements')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  {t('auth.signup.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mt-6" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('auth.signup.creating')}</span>
                  </div>
                ) : (
                  t('auth.signup.button')
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.signup.hasAccount')}{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
                >
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