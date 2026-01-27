'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface PatientActionsProps {
  patientId: string;
  email: string | null;
  hasAccess: boolean;
  onInviteSent?: () => void;
}

export function PatientActions({ patientId, email, hasAccess, onInviteSent }: PatientActionsProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleInvite = async () => {
    if (!email) {
      toast.error('El paciente no tiene un email registrado');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Supabase Auth user (sends magic link/invite)
      // Note: This requires the "Enable Signup" option in Supabase or using a dedicated Edge Function if admin-only.
      // For now, we simulate the invite or use the client-side invite if enabled.

      // In a real production environment with service role:
      // const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

      // Using client side (works if "Allow unauthenticated signups" is on or if we just want to send a reset password)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/setup-password`,
      });

      if (error) throw error;

      toast.success('Invitación enviada correctamente al correo del paciente');
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
      disabled={loading || !email}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail size={16} />}
      Invitar al Portal
    </Button>
  );
}
