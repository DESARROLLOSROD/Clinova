'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Key, CheckCircle, XCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface TherapistAccessManagerProps {
  therapistId: string;
  email: string;
  hasAccess: boolean;
  firstName: string;
  lastName: string;
}

function generateSecurePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = pwd.length; i < 12; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  return pwd.join('');
}

export function TherapistAccessManager({
  therapistId,
  email,
  hasAccess,
}: TherapistAccessManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleGeneratePassword = () => {
    const pwd = generateSecurePassword();
    setPassword(pwd);
    setGeneratedPassword(pwd);
    setCopied(false);
  };

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  async function handleCreateAccess() {
    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/therapists/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          therapistId,
          email,
          password,
          sendInvite: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account');
      }

      setMessage({
        type: 'success',
        text: `Cuenta creada exitosamente. El fisioterapeuta ya puede iniciar sesión con su email y contraseña.`,
      });

      setTimeout(() => router.refresh(), 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al crear la cuenta',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendInvite() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/therapists/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setMessage({
        type: 'success',
        text: `Email de restablecimiento enviado a ${email}`,
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al enviar el email',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {hasAccess ? (
          <>
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">Tiene acceso al sistema</span>
          </>
        ) : (
          <>
            <XCircle size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">Sin acceso al sistema</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!hasAccess ? (
        <div className="space-y-4">
          {!showPasswordForm ? (
            <Button
              onClick={() => { setShowPasswordForm(true); handleGeneratePassword(); }}
              className="gap-2"
              size="sm"
            >
              <UserPlus size={16} />
              Crear Acceso al Sistema
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">Asignar Contraseña</h4>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  Generar Nueva
                </button>
              </div>

              {generatedPassword && (
                <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-md">
                  <code className="flex-1 text-sm font-mono font-bold text-green-800 select-all">
                    {generatedPassword}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    {copied ? <><Check size={12} /> Copiada!</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contraseña (o escríbela manualmente)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setGeneratedPassword(null); }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAccess}
                  disabled={isLoading || !password || password.length < 6}
                  className="gap-2"
                  size="sm"
                >
                  <UserPlus size={16} />
                  {isLoading ? 'Creando...' : 'Crear Acceso'}
                </Button>
                <Button
                  onClick={() => { setShowPasswordForm(false); setPassword(''); setGeneratedPassword(null); }}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleResendInvite}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
            size="sm"
          >
            <Key size={16} />
            {isLoading ? 'Enviando...' : 'Enviar Email de Recuperación'}
          </Button>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p className="font-medium mb-1">¿Cómo funciona?</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          {!hasAccess ? (
            <li>
              <strong>Crear Acceso:</strong> Asigna una contraseña para que el fisioterapeuta pueda iniciar sesión con su email
            </li>
          ) : (
            <li>
              <strong>Enviar Email de Recuperación:</strong> Envía un email para que el fisioterapeuta pueda establecer una nueva contraseña
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
