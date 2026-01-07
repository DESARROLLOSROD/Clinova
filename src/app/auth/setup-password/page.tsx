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
        setLoading(true);
        setError(null);
        console.log('Starting auth discovery at', window.location.href);

        // 1. Initial check (cookies/storage)
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          console.log('Session already exists:', initialSession.user.email);
          setIsReady(true);
          setLoading(false);
          return;
        }

        // 2. Check for PKCE code in query params
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          console.log('Code found, exchanging for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange failed:', exchangeError);
          }
        }

        // 3. Manual Fragment Parsing (Implicit Flow fallback)
        // Some browsers don't trigger the internal pulse of Supabase client on fragment changes or redirects
        if (window.location.hash) {
          console.log('Hash fragment detected, parsing...');
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            console.log('Found access_token in fragment, setting session manually...');
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (setSessionError) console.error('Error setting manual session:', setSessionError);
          }
        }

        // 4. Robustly wait for session to persist
        const checkSession = async (retryCount = 0): Promise<any> => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) return session;

          if (retryCount < 8) { // Wait up to ~5 seconds total
            await new Promise(r => setTimeout(r, 600));
            return checkSession(retryCount + 1);
          }
          return null;
        };

        const session = await checkSession();

        if (!session) {
          console.error('All session detection attempts failed');
          setError('No se pudo detectar tu sesión. Por favor, asegúrate de usar el enlace más reciente que recibiste. Si persiste, intenta copiar y pegar el enlace directamente en una ventana nueva de incógnito.');
          setLoading(false);
          return;
        }

        console.log('User authenticated successfully');
        setIsReady(true);
        setLoading(false);
      } catch (err: any) {
        console.error('Unexpected error in auth flow:', err);
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
            {isReady
              ? 'Crea una contraseña segura para acceder a tu cuenta'
              : 'Verificando tu cuenta...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isReady ? (
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
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {error}
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
          ) : (
            <div className="space-y-4 py-4">
              {error ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                    {error}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Regresar al Inicio de Sesión
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-600">Detectando autenticación...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}