'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Handle auth callback and check session
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        console.log('Checking session in setup-password page...')
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('User check error:', userError);
          setError('Error al verificar el usuario');
          setLoading(false);
          return;
        }

        if (!user) {
          console.warn('No user found in setup-password initial check. Checking for fragments or waiting for session...');
          // Fragments (#access_token=...) are parsed by the Supabase client automatically.
          // Wait a full second to give it time to parse and set the cookie.
          setTimeout(async () => {
            console.log('Retrying session check after 1s...');
            const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();

            if (retryError || !retrySession) {
              console.error('Final check: Still no session', retryError);
              setError('No pudimos detectar tu sesión automáticamente. Por favor, asegúrate de haber hecho clic en el enlace del correo más reciente. Si el problema persiste, intenta copiar y pegar el enlace directamente en una pestaña nueva.');
              setLoading(false);
            } else {
              console.log('Retry success: Session found for', retrySession.user.email);
              setIsReady(true);
              setLoading(false);
            }
          }, 1500); // 1.5 seconds to be safe
          return;
        }

        console.log('User authenticated:', user.email);
        // User is authenticated, show the password form
        setIsReady(true);
        setLoading(false);
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError('Error al procesar la autenticación');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Error setting password:', err);
      setError(err.message || 'Error al establecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (!isReady && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Verificando sesión...</CardTitle>
            <CardDescription className="text-gray-600">
              Por favor espera un momento
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">¡Contraseña Establecida!</CardTitle>
            <CardDescription className="text-gray-600">
              Redirigiendo al dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Configura tu Contraseña</CardTitle>
          <CardDescription className="text-gray-600">
            Crea una contraseña segura para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900">
                Nueva Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="text-gray-900 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="text-gray-900 bg-white border-gray-300"
              />
            </div>

            {error && (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
                {!isReady && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Regresar al Inicio de Sesión
                  </Button>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Estableciendo contraseña...' : 'Establecer Contraseña'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p className="mt-2">
                Una vez establecida tu contraseña, podrás acceder al sistema.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}