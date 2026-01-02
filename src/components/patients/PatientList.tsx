'use client'

import React from 'react'
import { Patient } from '@/types/patient'
import Link from 'next/link'
import { Edit, Trash2, Eye } from 'lucide-react'

interface PatientListProps {
    initialPatients: Patient[]
}

export function PatientList({ initialPatients }: PatientListProps) {
    // In a real app we might want client-side search/filter here, 
    // but for now we just display the initial data passed from server.
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Contacto</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {initialPatients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No hay pacientes registrados.
                                </td>
                            </tr>
                        ) : (
                            initialPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {patient.first_name} {patient.last_name}
                                        </div>
                                        {patient.date_of_birth && (
                                            <div className="text-xs text-gray-500">
                                                {new Date(patient.date_of_birth).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{patient.email}</div>
                                        <div className="text-gray-500 text-xs">{patient.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {patient.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/dashboard/pacientes/${patient.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Eye size={18} />
                                            </Link>
                                            {/* 
                            For MVP we might not implement Edit/Delete immediately in this turn, 
                            but keeping icons as placeholders or for next steps.
                        */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
