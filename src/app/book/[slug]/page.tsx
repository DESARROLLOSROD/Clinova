'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
    ChevronRight,
    MapPin,
    Phone,
    Globe,
    Clock,
    User,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Clinic {
    id: string;
    name: string;
    slug: string;
    address: string;
    phone: string;
    website: string;
    logo_url: string;
    primary_color: string;
    business_hours: any;
}

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
}

interface Therapist {
    id: string;
    first_name: string;
    last_name: string;
}

export default function BookingPage({ params }: { params: { slug: string } }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    // Selection State
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null); // Optional

    // Form State
    const [patientForm, setPatientForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: ''
    });

    const supabase = createClient();

    useEffect(() => {
        fetchClinicData();
    }, []);

    const fetchClinicData = async () => {
        try {
            const { data: clinicData } = await supabase
                .from('clinics')
                .select('*')
                .eq('slug', params.slug)
                .eq('is_active', true)
                .eq('allow_online_booking', true)
                .single();

            if (!clinicData) {
                // Handle not found or booking disabled
                return;
            }

            setClinic(clinicData);

            // Fetch Services
            const { data: servicesData } = await supabase
                .from('clinic_services')
                .select('*')
                .eq('clinic_id', clinicData.id)
                .eq('is_active', true);

            setServices(servicesData || []);
        } catch (error) {
            console.error('Error fetching clinic:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!clinic || !selectedService || !selectedDate || !selectedTime) return;

        setLoading(true);
        try {
            // 1. Create or Find Patient
            // Simple logic: If email exists in this clinic, link. If not, create new patient.
            // Note: In real app, we might need stricter auth or defined flows.

            let patientId;

            const { data: existingPatient } = await supabase
                .from('patients')
                .select('id')
                .eq('clinic_id', clinic.id)
                .eq('email', patientForm.email)
                .single();

            if (existingPatient) {
                patientId = existingPatient.id;
            } else {
                const { data: newPatient, error: createError } = await supabase
                    .from('patients')
                    .insert({
                        clinic_id: clinic.id,
                        first_name: patientForm.firstName,
                        last_name: patientForm.lastName,
                        email: patientForm.email,
                        phone: patientForm.phone,
                        active: true
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                patientId = newPatient.id;
            }

            // 2. Create Appointment
            const startTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            startTime.setHours(hours, minutes);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + selectedService.duration_minutes);

            const { error: bookingError } = await supabase
                .from('appointments')
                .insert({
                    clinic_id: clinic.id,
                    patient_id: patientId,
                    service_id: selectedService.id, // Ensure this column is added via migration
                    title: `Cita Online - ${selectedService.name}`,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'scheduled',
                    notes: `Reserva Online. ${patientForm.notes}`
                });

            if (bookingError) throw bookingError;

            setStep(4); // Success

        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error('Error al agendar la cita. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !clinic) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    if (!clinic) {
        return <div className="min-h-screen flex items-center justify-center">Clínica no encontrada o reservas deshabilitadas.</div>;
    }

    // Helper to generate time slots (Simplified)
    const generateTimeSlots = () => {
        // In real app: Check existing appointments to exclude overlaps
        // For now: specific slots
        return ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00'];
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {clinic.logo_url && <img src={clinic.logo_url} alt={clinic.name} className="h-10 w-10 rounded-full object-cover" />}
                        <div>
                            <h1 className="font-bold text-gray-900 leading-tight">{clinic.name}</h1>
                            <p className="text-xs text-gray-500">Reserva de Citas Online</p>
                        </div>
                    </div>
                    {/* Step Indicator */}
                    <div className="text-sm font-medium text-gray-500 hidden sm:block">
                        Paso {step} de 3
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Selecciona un Servicio</h2>
                            <p className="text-gray-600">Elige el tratamiento que necesitas</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => { setSelectedService(service); setStep(2); }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-500">
                                                <span className="flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</span>
                                                <span className="flex items-center gap-1 text-green-600 font-bold">${service.price}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
                                    </div>
                                </div>
                            ))}
                            {services.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    No hay servicios disponibles para reservar online.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-900 mb-2">← Volver</button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Elige Fecha y Hora</h2>
                            <p className="text-gray-600">Disponibilidad para {selectedService?.name}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    locale={es}
                                    className="rounded-md border-none"
                                    disabled={(date: Date) => date < new Date() || date.getDay() === 0} // Disable past and sundays (todo: use business hours)
                                />
                            </div>

                            <div>
                                {selectedDate ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {generateTimeSlots().map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all
                                            ${selectedTime === time
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                                        `}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        Selecciona una fecha para ver horarios
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep(3)}
                                className="w-full md:w-auto"
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900 mb-2">← Volver</button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Tus Datos</h2>
                            <p className="text-gray-600">Completa la información para confirmar la cita</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                            <h4 className="text-blue-800 font-semibold mb-2">Resumen de la Cita</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p><span className="font-medium">Servicio:</span> {selectedService?.name}</p>
                                <p><span className="font-medium">Fecha:</span> {selectedDate?.toLocaleDateString()} a las {selectedTime}</p>
                                <p><span className="font-medium">Duración:</span> {selectedService?.duration_minutes} min</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={patientForm.firstName}
                                    onChange={e => setPatientForm({ ...patientForm, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Apellido</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={patientForm.lastName}
                                    onChange={e => setPatientForm({ ...patientForm, lastName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={patientForm.email}
                                    onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    type="tel"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={patientForm.phone}
                                    onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Notas / Motivo de consulta</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    value={patientForm.notes}
                                    onChange={e => setPatientForm({ ...patientForm, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            size="lg"
                            onClick={handleBook}
                            disabled={!patientForm.firstName || !patientForm.email || !patientForm.phone}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
                        </Button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-12">
                        <div className="bg-green-100 text-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Hemos enviado un correo de confirmación a <strong>{patientForm.email}</strong> con los detalles de tu cita.
                        </p>
                        <div className="max-w-sm mx-auto bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left">
                            <p className="font-semibold text-gray-900 mb-2">{selectedService?.name}</p>
                            <p className="text-gray-600 text-sm mb-1">{selectedDate?.toLocaleDateString()} - {selectedTime}</p>
                            <p className="text-gray-600 text-sm">{clinic?.address}</p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Agendar otra cita
                        </Button>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                <p>Powered by <strong>Clinova</strong></p>
            </footer>
        </div>
    );
}
