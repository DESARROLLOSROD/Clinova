'use server'

import { createClient } from "@/utils/supabase/server"

export interface DashboardData {
    patient: {
        id: string;
        first_name: string;
    } | null;
    appointments: any[];
    pendingExercises: number;
    error?: string;
}

export async function getDashboardData() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'No autenticado' }
        }

        // Fetch patient profile
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('first_name, id')
            .eq('auth_user_id', user.id)
            .single()

        if (patientError) {
            console.error("Server Patient fetch error:", patientError)
            if (patientError.code === 'PGRST116') {
                return { error: 'No tienes un perfil de paciente creado.' }
            }
            return { error: `Error de perfil: ${patientError.message}` }
        }

        if (!patient) {
            return { error: 'No se encontró el perfil de paciente.' }
        }

        // Fetch appointments
        const { data: appointmentsData, error: apptError } = await supabase
            .from('appointments')
            .select(`
                *,
                therapist:therapists(first_name, last_name),
                clinic:clinics(name, address)
            `)
            .eq('patient_id', patient.id)
            .order('start_time', { ascending: true })

        if (apptError) console.error("Server Appointments fetch error:", apptError)

        // Fetch exercise count
        const { count, error: exError } = await supabase
            .from('patient_exercise_prescriptions')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', patient.id)
            .eq('status', 'active')

        if (exError) console.error("Server Exercises fetch error:", exError)

        return {
            patient,
            appointments: appointmentsData || [],
            pendingExercises: count || 0
        }
    } catch (error: any) {
        console.error('Server error in getDashboardData:', error)
        return { error: 'Error inesperado en el servidor.' }
    }
}
