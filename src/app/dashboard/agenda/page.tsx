
import { createClient } from '@/utils/supabase/server'
import { CalendarView } from '@/components/agenda/CalendarView'
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns'
import { AgendaClientWrapper } from '@/components/agenda/AgendaClientWrapper'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// We need to use a client wrapper to handle the routing logic for date changes if we want to keep the page strictly server-side for fetching.
// OR we can pass a server action or just use router in the Client Component.
// Let's go with the Client Component passing `onDateChange` that updates the URL.

export default async function AgendaPage({
    searchParams,
}: {
    searchParams: { date?: string }
}) {
    const supabase = await createClient()

    // Parse date from URL or default to today
    // Await searchParams before accessing properties
    const params = await searchParams;
    const currentDate = params.date ? parseISO(params.date) : new Date()

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

    // Fetch appointments for the week
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, patients(first_name, last_name)')
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())

    if (error) {
        console.error('Error fetching appointments:', error)
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                    <p className="text-gray-600 text-sm">Gestiona las citas y sesiones.</p>
                </div>
                <Link href="/dashboard/agenda/nueva">
                    <Button className="gap-2">
                        <Plus size={18} />
                        Nueva Cita
                    </Button>
                </Link>
            </div>

            <div className="flex-1 min-h-0">
                <AgendaClientWrapper
                    appointments={appointments || []}
                    currentDate={currentDate}
                />
            </div>
        </div>
    )
}
