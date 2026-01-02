
import { createClient } from '@/utils/supabase/server'
import { SOAPForm } from '@/components/sessions/SOAPForm'
import { redirect } from 'next/navigation'

export default async function NewSessionPage({
    searchParams,
}: {
    searchParams: { appointment_id?: string }
}) {
    const supabase = await createClient()
    const params = await searchParams;
    const appointmentId = params.appointment_id

    if (!appointmentId) {
        redirect('/dashboard/agenda')
    }

    // Fetch appointment details to show context
    const { data: appointment } = await supabase
        .from('appointments')
        .select('*, patients(first_name, last_name)')
        .eq('id', appointmentId)
        .single()

    if (!appointment) {
        return <div>Cita no encontrada</div>
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <SOAPForm
                appointmentId={appointmentId}
                patientName={`${appointment.patients.first_name} ${appointment.patients.last_name}`}
            />
        </div>
    )
}
