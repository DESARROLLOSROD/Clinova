'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Patient } from '@/types/patient'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
            const { data } = await supabase
                .from('patients')
                .select('id, first_name, last_name')
                .eq('active', true)
                .order('first_name')

            if (data) setPatients(data as Patient[])
            setLoading(false)
        }
        fetchPatients()
    }, [])

    return (
        <div>
            <Label htmlFor={name}>Paciente {required && '*'}</Label>
            <Select name={name} required={required} disabled={loading}>
                <SelectTrigger id={name}>
                    <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar paciente..."} />
                </SelectTrigger>
                <SelectContent>
                    {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
