'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { MoreHorizontal, Power, PowerOff, ExternalLink, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUser } from '@/contexts/UserContext';

interface Clinic {
    id: string;
    name: string;
    slug: string;
    subscription_tier: string;
    subscription_status: string;
    next_payment_date: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminClinicsPage() {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { viewAsClinic } = useUser();

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Error al cargar clínicas');
            console.error(error);
        } else {
            setClinics(data || []);
        }
        setLoading(false);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('clinics')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Error al actualizar estado');
        } else {
            toast.success(`Clínica ${!currentStatus ? 'activada' : 'desactivada'}`);
            fetchClinics();
        }
    };

    if (loading) return <div className="p-8">Cargando listado...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Clínicas</h1>
                    <p className="text-gray-600">Administra todas las clínicas registradas en el sistema.</p>
                </div>
                <a href="/dashboard/admin/clinics/new">
                    <Button>+ Nueva Clínica</Button>
                </a>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado Subs.</TableHead>
                            <TableHead>Próx. Pago</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clinics.map((clinic) => (
                            <TableRow key={clinic.id}>
                                <TableCell className="font-medium">{clinic.name}</TableCell>
                                <TableCell className="text-gray-500">{clinic.slug}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {clinic.subscription_tier}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                        ${clinic.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                                            clinic.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {clinic.subscription_status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {clinic.next_payment_date ? format(new Date(clinic.next_payment_date), 'PP', { locale: es }) : '-'}
                                </TableCell>
                                <TableCell>
                                    {clinic.is_active ? (
                                        <span className="text-green-600 flex items-center gap-1 text-xs font-bold">● Activo</span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1 text-xs font-bold">● Inactivo</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(clinic.id)}>
                                                Copiar ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toggleStatus(clinic.id, clinic.is_active)}>
                                                {clinic.is_active ? (
                                                    <><PowerOff className="mr-2 h-4 w-4 text-red-500" /> Desactivar</>
                                                ) : (
                                                    <><Power className="mr-2 h-4 w-4 text-green-500" /> Activar</>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
