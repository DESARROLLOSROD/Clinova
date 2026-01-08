'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, Activity } from 'lucide-react';
import { BodyMap, type BodyMark } from '@/components/shared/BodyMap';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface SessionEditFormProps {
  session: any;
}

export function SessionEditForm({ session }: SessionEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<BodyMark[]>([]);
  const [initialMarksLoaded, setInitialMarksLoaded] = useState(false);

  useEffect(() => {
    if (isEditing && !initialMarksLoaded) {
      fetchBodyMarks();
    }
  }, [isEditing, initialMarksLoaded]);

  const fetchBodyMarks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('session_body_marks')
      .select('*')
      .eq('session_id', session.id);

    if (error) {
      console.error('Error fetching body marks:', error);
    } else {
      setMarks(data || []);
      setInitialMarksLoaded(true);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      subjective: formData.get('subjective') as string || null,
      objective: formData.get('objective') as string || null,
      assessment: formData.get('assessment') as string || null,
      plan: formData.get('plan') as string || null,
      pain_level: formData.get('pain_level')
        ? parseInt(formData.get('pain_level') as string)
        : null,
    };

    try {
      // 1. Actualizar datos de la sesión (SOAP)
      const { error: sessionError } = await supabase.from('sessions').update(updatedData).eq('id', session.id);
      if (sessionError) throw sessionError;

      // 2. Actualizar marcas del mapa corporal
      // Primero borramos las anteriores (simplificación técnica de sincronización)
      const { error: deleteError } = await supabase
        .from('session_body_marks')
        .delete()
        .eq('session_id', session.id);

      if (deleteError) throw deleteError;

      // Insertamos las nuevas (si las hay)
      if (marks.length > 0) {
        const marksToInsert = marks.map(m => ({
          session_id: session.id,
          patient_id: session.patient_id,
          x_pos: m.x_pos,
          y_pos: m.y_pos,
          side: m.side,
          mark_type: m.mark_type,
          notes: m.notes
        }));

        const { error: insertError } = await supabase
          .from('session_body_marks')
          .insert(marksToInsert);

        if (insertError) throw insertError;
      }

      toast.success('Sesión actualizada correctamente');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="flex justify-end">
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Edit size={18} />
          Editar Notas SOAP
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Notas SOAP</CardTitle>
        <CardDescription>Actualiza las notas de la sesión clínica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="pain_level">Nivel de Dolor (0-10)</Label>
            <Input
              id="pain_level"
              name="pain_level"
              type="number"
              min="0"
              max="10"
              defaultValue={session.pain_level || ''}
              placeholder="0-10"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = Sin dolor, 10 = Dolor máximo
            </p>
          </div>

          <div>
            <Label htmlFor="subjective">Subjetivo (S)</Label>
            <Textarea
              id="subjective"
              name="subjective"
              rows={4}
              defaultValue={session.subjective || ''}
              placeholder="¿Qué dice el paciente? Síntomas, quejas, molestias..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Síntomas y descripción del paciente sobre su condición
            </p>
          </div>

          <div>
            <Label htmlFor="objective">Objetivo (O)</Label>
            <Textarea
              id="objective"
              name="objective"
              rows={4}
              defaultValue={session.objective || ''}
              placeholder="Observaciones, mediciones, tests realizados..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Observaciones clínicas, mediciones y hallazgos objetivos
            </p>
          </div>

          <div className="border-y py-6 bg-slate-50/50 -mx-6 px-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Activity className="text-blue-600" size={20} />
              Evaluación Visual del Cuerpo
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Marca los puntos de dolor, tensión o lesiones detectadas en la sesión.
            </p>
            <BodyMap
              onMarksChange={setMarks}
              initialMarks={marks}
            />
          </div>

          <div>
            <Label htmlFor="assessment">Evaluación (A)</Label>
            <Textarea
              id="assessment"
              name="assessment"
              rows={4}
              defaultValue={session.assessment || ''}
              placeholder="Análisis de la situación, diagnóstico..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Análisis profesional, diagnóstico y progreso del paciente
            </p>
          </div>

          <div>
            <Label htmlFor="plan">Plan (P)</Label>
            <Textarea
              id="plan"
              name="plan"
              rows={4}
              defaultValue={session.plan || ''}
              placeholder="Tratamiento aplicado, plan para siguiente sesión..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Tratamiento realizado y plan para próximas sesiones
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save size={18} />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
