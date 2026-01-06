'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Key, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TherapistAccessManagerProps {
  therapistId: string;
  email: string;
  hasAccess: boolean;
  firstName: string;
  lastName: string;
}

export function TherapistAccessManager({
  therapistId,
  email,
  hasAccess,
}: TherapistAccessManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCreateAccess() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/therapists/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          email,
          sendInvite: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account');
      }

      setMessage({
        type: 'success',
        text: data.inviteSent
          ? `Cuenta creada e invitación enviada a ${email}`
          : 'Cuenta creada exitosamente',
      });

      // Refresh the page to update UI
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
      <div className="flex flex-wrap gap-2">
        {!hasAccess ? (
          <Button
            onClick={handleCreateAccess}
            disabled={isLoading}
            className="gap-2"
            size="sm"
          >
            <UserPlus size={16} />
            {isLoading ? 'Creando...' : 'Crear Acceso y Enviar Invitación'}
          </Button>
        ) : (
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
        )}
      </div>

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
              <strong>Crear Acceso:</strong> Crea una cuenta de usuario y envía un email de invitación para que el fisioterapeuta configure su contraseña
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
