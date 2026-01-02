'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Patient } from '@/types/patient'
// For MVP speed, let's use a native select styled with Tailwind
import { Label } from '@/components/ui/label'

interface PatientSelectProps {
    name: string
    required?: boolean
}

export function PatientSelect({ name, required }: PatientSelectProps) {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPatients() {
            const supabase = createClient()
            const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('active', true)
            if (data) setPatients(data as Patient[])
            setLoading(false)
        }
        fetchPatients()
    }, [])

    return (
        <div>
            <Label htmlFor={name}>Paciente {required && '*'}</Label>
            <select
                name={name}
                id={name}
                required={required}
                className="flex h-11 w-full rounded-xl border-2 border-gray-100 bg-white px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
            >
                <option value="">Seleccionar paciente...</option>
                {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                    </option>
                ))}
            </select>
        </div>
    )
}
