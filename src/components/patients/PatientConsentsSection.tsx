'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FileText, Plus, CheckCircle, Clock, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { type ConsentTemplate, type PatientSignature } from '@/types/consent';
import { toast } from 'sonner';

interface PatientConsentsSectionProps {
    patientId: string;
}

export function PatientConsentsSection({ patientId }: PatientConsentsSectionProps) {
    const supabase = createClient();
    const [signatures, setSignatures] = useState<PatientSignature[]>([]);
    const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ConsentTemplate | null>(null);

    const fetchSignatures = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('patient_signatures')
            .select('*, templates:consent_templates(*)')
            .eq('patient_id', patientId)
            .order('signed_at', { ascending: false });

        if (error) {
            console.error('Error fetching signatures:', error.message);
            toast.error('Error al cargar consentimientos');
        } else {
            setSignatures(data || []);
        }
        setLoading(false);
    }, [patientId, supabase]);

    const fetchTemplates = useCallback(async () => {
        const { data, error } = await supabase
            .from('consent_templates')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching templates:', error.message);
        } else {
            setTemplates(data || []);
        }
    }, [supabase]);

    useEffect(() => {
        fetchSignatures();
        fetchTemplates();
    }, [fetchSignatures, fetchTemplates]);



    const handleSaveSignature = async (signatureDataUrl: string) => {
        if (!selectedTemplate) return;

        try {
            await supabase.auth.getUser();

            const { error } = await supabase
                .from('patient_signatures')
                .insert({
                    patient_id: patientId,
                    consent_template_id: selectedTemplate.id,
                    signature_image_url: signatureDataUrl, // Guardamos Base64 por simplicidad técnica inicial
                    signed_at: new Date().toISOString(),
                    user_agent: window.navigator.userAgent,
                    // Ip address se capturaría mejor en el servidor, aquí es opcional o vía API externa
                });

            if (error) throw error;

            toast.success('Consentimiento firmado con éxito');
            setIsAdding(false);
            setSelectedTemplate(null);
            fetchSignatures();
        } catch (error) {
            console.error('Error saving signature:', error);
            toast.error('Error al guardar la firma');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este registro? Esto debe hacerse solo bajo supervición legal.')) return;

        const { error } = await supabase
            .from('patient_signatures')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Error al eliminar');
        } else {
            toast.success('Registro eliminado');
            fetchSignatures();
        }
    };

    if (loading && signatures.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <p className="text-center text-gray-500">Cargando documentos...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    Consentimientos y Firmas
                </h2>
                {!isAdding && (
                    <Button size="sm" onClick={() => setIsAdding(true)}>
                        <Plus size={16} className="mr-2" />
                        Nuevo Consentimiento
                    </Button>
                )}
            </div>

            {isAdding ? (
                <div className="space-y-6 border-t pt-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium">Nuevo Consentimiento Informado</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                            <X size={16} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seleccione una Plantilla
                            </label>
                            <select
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => {
                                    const template = templates.find(t => t.id === e.target.value);
                                    setSelectedTemplate(template || null);
                                }}
                                value={selectedTemplate?.id || ''}
                            >
                                <option value="">-- Seleccionar --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                                ))}
                            </select>
                        </div>

                        {selectedTemplate && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-2">{selectedTemplate.title}</h4>
                                <div className="prose prose-sm max-w-none text-blue-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {selectedTemplate.content}
                                </div>
                            </div>
                        )}

                        {selectedTemplate && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Firma del Paciente
                                </label>
                                <SignaturePad onSave={handleSaveSignature} />
                                <p className="text-xs text-gray-500 italic">
                                    Al firmar, el paciente acepta los términos descritos en el documento seleccionado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {signatures.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                            <Clock className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">No hay consentimientos firmados aún.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {signatures.map((sig) => (
                                <div
                                    key={sig.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="text-green-600 w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {sig.templates?.title || 'Documento sin título'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Firmado el {new Date(sig.signed_at).toLocaleDateString()} a las {new Date(sig.signed_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {sig.signature_image_url && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={sig.signature_image_url}
                                                alt="Firma"
                                                className="h-10 border rounded bg-white"
                                            />
                                        )}
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(sig.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
