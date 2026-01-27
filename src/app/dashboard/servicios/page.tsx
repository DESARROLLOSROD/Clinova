'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from '@/contexts/UserContext';

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_minutes: 60,
        price: 0,
        is_active: true,
    });
    const [saving, setSaving] = useState(false);

    const supabase = createClient();
    const { profile } = useUser();

    useEffect(() => {
        if (profile?.clinic_id) {
            fetchServices();
        }
    }, [profile?.clinic_id]);

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clinic_services')
            .select('*')
            .eq('clinic_id', profile?.clinic_id)
            .order('name');

        if (error) {
            console.error('Error fetching services:', error);
            toast.error('Error al cargar servicios');
        } else {
            setServices(data || []);
        }
        setLoading(false);
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                duration_minutes: service.duration_minutes,
                price: service.price,
                is_active: service.is_active,
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                duration_minutes: 60,
                price: 0,
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!profile?.clinic_id) return;
        if (!formData.name) return toast.error('El nombre es requerido');

        setSaving(true);
        try {
            if (editingService) {
                const { error } = await supabase
                    .from('clinic_services')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        duration_minutes: formData.duration_minutes,
                        price: formData.price,
                        is_active: formData.is_active,
                    })
                    .eq('id', editingService.id);

                if (error) throw error;
                toast.success('Servicio actualizado');
            } else {
                const { error } = await supabase
                    .from('clinic_services')
                    .insert({
                        clinic_id: profile.clinic_id,
                        name: formData.name,
                        description: formData.description,
                        duration_minutes: formData.duration_minutes,
                        price: formData.price,
                        is_active: formData.is_active,
                    });

                if (error) throw error;
                toast.success('Servicio creado');
            }
            setIsDialogOpen(false);
            fetchServices();
        } catch (error: any) {
            console.error('Error saving service:', error);
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

        const { error } = await supabase
            .from('clinic_services')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Error al eliminar');
        } else {
            toast.success('Servicio eliminado');
            fetchServices();
        }
    };

    if (loading) return <div className="p-8">Cargando servicios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
                    <p className="text-gray-600">Gestiona los tratamientos y consultas que ofreces.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus size={18} />
                    Nuevo Servicio
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">No hay servicios configurados</h3>
                        <p className="text-gray-500 mb-4">Crea tu primer servicio para empezar a recibir reservas online.</p>
                        <Button onClick={() => handleOpenDialog()}>Crear Servicio</Button>
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group hover:shadow-md transition-all">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenDialog(service)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 pr-8">{service.name}</h3>
                                {!service.is_active && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactivo</span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{service.description || 'Sin descripción'}</p>

                            <div className="flex justify-between items-center text-sm font-medium border-t pt-4 border-gray-50">
                                <div className="text-gray-500">{service.duration_minutes} min</div>
                                <div className="text-green-600 text-lg">${service.price}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Fisioterapia General"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Breve descripción del tratamiento..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duración (min)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.duration_minutes}
                                    onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio ($)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Activo (visible para reservas)</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving && <Loader2 className="animate-spin h-4 w-4" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
