'use client'

import React, { useState } from 'react'
import { Patient } from '@/types/patient'
import Link from 'next/link'
import { Edit, Trash2, Eye } from 'lucide-react'
import { Can } from '@/components/auth/Can'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PatientListProps {
    initialPatients: Patient[]
}

export function PatientList({ initialPatients }: PatientListProps) {
    const router = useRouter()
    const [patients, setPatients] = useState(initialPatients)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (patient: Patient) => {
        setPatientToDelete(patient)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!patientToDelete) return

        setIsDeleting(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', patientToDelete.id)

            if (error) throw error

            // Remove patient from local state
            setPatients(patients.filter(p => p.id !== patientToDelete.id))

            toast.success('Paciente eliminado', {
                description: `${patientToDelete.first_name} ${patientToDelete.last_name} ha sido eliminado correctamente.`
            })

            setDeleteDialogOpen(false)
            setPatientToDelete(null)
            router.refresh()
        } catch (err: any) {
            toast.error('Error al eliminar', {
                description: err.message || 'No se pudo eliminar el paciente'
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No hay pacientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {patient.first_name} {patient.last_name}
                                            </div>
                                            {patient.date_of_birth && (
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    {new Date(patient.date_of_birth).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-gray-100">{patient.email}</div>
                                            <div className="text-gray-500 dark:text-gray-500 text-xs">{patient.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                }`}>
                                                {patient.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Can permission="patients:view">
                                                    <Link href={`/dashboard/pacientes/${patient.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Eye size={18} />
                                                    </Link>
                                                </Can>
                                                <Can permission="patients:edit">
                                                    <Link href={`/dashboard/pacientes/${patient.id}/editar`} className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                        <Edit size={18} />
                                                    </Link>
                                                </Can>
                                                <Can permission="patients:delete">
                                                    <button
                                                        onClick={() => handleDeleteClick(patient)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </Can>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar paciente?</DialogTitle>
                        <DialogDescription>
                            {patientToDelete && (
                                <>
                                    Estás a punto de eliminar a <strong>{patientToDelete.first_name} {patientToDelete.last_name}</strong>.
                                    Esta acción no se puede deshacer y se eliminarán todos los datos asociados al paciente.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
