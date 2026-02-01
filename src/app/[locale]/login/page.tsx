'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import clientApi from '@/lib/apis/axios-client';
import { ForgotPasswordDialog } from '@/components/auth/forgot-password-dialog';
import LanguageSwitcher from '@/components/layout/language-switcher';
import { toastService } from '@/services/toasts-service';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const locale = useLocale();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`;
  const router = useRouter();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const finalUsername = (formData.get('username') as string) || username;
    const finalPassword = (formData.get('password') as string) || password;

    if (isSignUp) {
      if (password !== confirmPassword) {
        toastService.error(t('passwordsDoNotMatch'));
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(password)) {
        toastService.error(t('passwordComplexity')); // Need to make sure this key exists or use hardcoded if t fails? I added it to en.json
        return;
      }

      try {
        await clientApi.post('/auth/register', {
          email,
          username,
          password,
          fullName,
        });
        toastService.success(t('registrationSuccess'));

        // Auto login after successful registration
        const result = await signIn('credentials', {
          username: finalUsername,
          password: finalPassword,
          redirect: false,
        });

        if (result?.error) {
          toastService.error(t('loginFailed'));
        } else {
          // Success: Redirect manually
          router.push(callbackUrl);
          router.refresh(); // Optional: ensures session cookies are recognized
        }
      } catch (error: any) {
        toastService.error(
          error.response?.data?.message || t('registrationFailed')
        );
      }
    } else {
      const result = await signIn('credentials', {
        username: finalUsername,
        password: finalPassword,
        redirect: false,
      });

      if (result?.error) {
        toastService.error(t('loginFailed'));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    }
  };

  const handleGoogleLogin = async () => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/google';
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600">
            {t('welcome')}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? t('createAccount')
              : t('enterLogin')}
          </CardDescription>
        </CardHeader>

        {/* 3. Wrap inputs in a <form> tag */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    placeholder={t('email')}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder={t('fullName')}
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Input
                id="username"
                name="username" // 4. Add 'name' attribute for autofill
                placeholder={t('username')}
                type="text"
                autoCapitalize="none"
                autoComplete="username" // 5. Help browser identify field
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Input
                id="password"
                name="password" // 4. Add 'name' attribute
                placeholder={t('password')}
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? 'new-password' : 'current-password'} // 5. Help browser
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {/* {!isSignUp && (
              <div className="flex justify-end">
                <ForgotPasswordDialog />
              </div>
            )} */}
            {isSignUp && (
              <div className="space-y-2 relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  placeholder={t('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {/* 6. Change type to "submit" to allow Enter key submission */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              type="submit"
            >
              {isSignUp ? t('signUp') : t('login')}
            </Button>
          </form>


        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
            <span
              onClick={toggleMode}
              className="underline underline-offset-4 hover:text-primary cursor-pointer font-medium"
            >
              {isSignUp ? t('login') : t('signUp')}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
