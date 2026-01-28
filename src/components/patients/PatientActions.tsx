'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { invitePatient } from '@/app/actions/patientActions';
import { toast } from 'sonner';

interface PatientActionsProps {
  patientId: string;
  email: string | null;
  hasAccess: boolean;
  onInviteSent?: () => void;
}

export function PatientActions({ patientId, email, hasAccess, onInviteSent }: PatientActionsProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error('El paciente no tiene un email registrado');
      return;
    }

    setLoading(true);
    try {
      const result = await invitePatient(patientId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Invitación enviada correctamente al correo del paciente');
      setSent(true);
      if (onInviteSent) onInviteSent();

    } catch (error: any) {
      console.error('Error inviting patient:', error);
      toast.error(error.message || 'Error al enviar invitación');
    } finally {
      setLoading(false);
    }
  };

  if (hasAccess) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
        <CheckCircle size={16} />
        Acceso al Portal Activo
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleInvite}
      disabled={loading || !email || sent}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail size={16} />}
      {sent ? 'Enviado' : 'Invitar al Portal'}
    </Button>
  );
}
