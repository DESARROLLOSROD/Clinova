'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Loader2, ArrowRight, Building, User } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CreateClinicWizardPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clinicId, setClinicId] = useState<string | null>(null);

    const [clinicForm, setClinicForm] = useState({
        name: '',
        slug: '',
        email: '',
        address: '',
        subscription_tier: 'basic'
    });

    const [managerForm, setManagerForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const supabase = createClient();
    const router = useRouter();

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setClinicForm(prev => ({ ...prev, name, slug: prev.slug ? prev.slug : slug }));
    };

    const handleCreateClinic = async () => {
        if (!clinicForm.name || !clinicForm.slug) return toast.error('Nombre y Slug requeridos');

        setLoading(true);
        try {
            // 1. Check if slug exists
            const { data: existing } = await supabase.from('clinics').select('id').eq('slug', clinicForm.slug).single();
            if (existing) throw new Error('El slug ya existe. Elige otro.');

            // 2. Create Clinic
            const { data: newClinic, error } = await supabase
                .from('clinics')
                .insert({
                    name: clinicForm.name,
                    slug: clinicForm.slug,
                    email: clinicForm.email,
                    address: clinicForm.address,
                    subscription_tier: clinicForm.subscription_tier,
                    subscription_status: 'trial',
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            setClinicId(newClinic.id);
            setStep(2); // Move to invite manager
            toast.success('Clínica creada correctamente');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al crear clínica');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteManager = async () => {
        if (!clinicId) return;
        if (!managerForm.email || !managerForm.firstName) return toast.error('Datos del administrador incompletos');

        setLoading(true);
        try {
            // 1. Invite User
            // We use the same flow as patients: resetPasswordForEmail
            // But we should probably check if user exists first? Standard Supabase invite flow.
            // Since we are Super Admin, we might want to use admin.inviteUserByEmail if we had service role,
            // but client side we use regular methods or a specialized edge function.
            // For prototype: We use separate 'invite' logic.

            // We can Create a Profile first?
            // Actually, without an Auth User ID, we can't create a profile linked to auth. 
            // So flow is: Send Invite -> They Click -> They Signup/Setup Password -> Trigger creates profile?
            // OR: We pre-create profile? No, User Profile needs ID.

            // Workaround: Send manual email (simulated) OR use resetPasswordForEmail if we assume we created the user?
            // Let's use `signInWithOtp` (Magic Link) as invite? Or just `resetPasswordForEmail` to init account.
            // Better: Just display a message that we "Would send an email" and maybe create a placeholder if needed.

            // REAL IMPLEMENTATION:
            // Ideally, call an Edge Function to `supabaseAdmin.auth.inviteUserByEmail()`.
            // Client-side fallback: We can't really invite a NEW user easily without them engaging.
            // EXCEPT: `supabase.auth.signInWithOtp({ email })`.

            // Let's go with a simple simulation + Log to console for verifying.

            toast.success(`Invitación enviada a ${managerForm.email} (Simulado)`);

            // Since we can't create the user/profile properly from client without their interaction,
            // we will skip actual DB insertion of the profile for now until they register.
            // But we can instruct the Super Admin to tell them to register at `/register?clinic=${clinicForm.slug}` ??

            setStep(3); // Done

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nueva Clínica</h1>
                <p className="text-gray-500">Asistente para dar de alta un nuevo cliente en Clinova.</p>
            </div>

            {/* Steps */}
            <div className="flex justify-between items-center px-8">
                <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                        <Building size={20} />
                    </div>
                    <span className="text-xs font-medium">Clínica</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                        <User size={20} />
                    </div>
                    <span className="text-xs font-medium">Administrador</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                        <CheckCircle size={20} />
                    </div>
                    <span className="text-xs font-medium">Listo</span>
                </div>
            </div>

            {/* Step 1: Clinic Info */}
            {step === 1 && (
                <Card className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre de la Clínica</Label>
                        <Input
                            value={clinicForm.name}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder="Ej. Fisioterapia Bienestar"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (URL única)</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">clinova.app/</span>
                            <Input
                                value={clinicForm.slug}
                                onChange={e => setClinicForm({ ...clinicForm, slug: e.target.value })}
                                placeholder="fisioterapia-bienestar"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Plan de Suscripción</Label>
                            <Select
                                value={clinicForm.subscription_tier}
                                onValueChange={v => setClinicForm({ ...clinicForm, subscription_tier: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">Básico</SelectItem>
                                    <SelectItem value="professional">Profesional</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Email de Contacto</Label>
                            <Input
                                type="email"
                                value={clinicForm.email}
                                onChange={e => setClinicForm({ ...clinicForm, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Dirección</Label>
                        <Input
                            value={clinicForm.address}
                            onChange={e => setClinicForm({ ...clinicForm, address: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleCreateClinic} disabled={loading} className="gap-2">
                            {loading && <Loader2 className="animate-spin h-4 w-4" />}
                            Crear Clínica <ArrowRight size={16} />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 2: Manager Invite */}
            {step === 2 && (
                <Card className="p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Invitar Administrador</h3>
                        <p className="text-sm text-gray-500">¿A quién le daremos acceso principal?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                value={managerForm.firstName}
                                onChange={e => setManagerForm({ ...managerForm, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Apellido</Label>
                            <Input
                                value={managerForm.lastName}
                                onChange={e => setManagerForm({ ...managerForm, lastName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={managerForm.email}
                            onChange={e => setManagerForm({ ...managerForm, email: e.target.value })}
                            placeholder="admin@clinica.com"
                        />
                    </div>

                    <div className="pt-4 flex justify-between">
                        <Button variant="outline" onClick={() => setStep(3)}>Omitir por ahora</Button>
                        <Button onClick={handleInviteManager} disabled={loading} className="gap-2">
                            {loading && <Loader2 className="animate-spin h-4 w-4" />}
                            Enviar Invitación <ArrowRight size={16} />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <Card className="p-12 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Todo Listo!</h2>
                        <p className="text-gray-600 mt-2">La clínica <strong>{clinicForm.name}</strong> ha sido creada correctamente.</p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard/admin/clinics')}>
                            Volver al Listado
                        </Button>
                        <Button onClick={() => setStep(1)}>
                            Crear Otra
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
