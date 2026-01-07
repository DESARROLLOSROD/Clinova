
import { createClient } from '@/utils/supabase/server'
import { PatientsPageContent } from '@/components/patients/PatientsPageContent'

export const dynamic = 'force-dynamic'

export default async function PacientesPage() {
    const supabase = await createClient()

    const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching patients:', error)
    }

    return <PatientsPageContent initialPatients={patients || []} />
}
