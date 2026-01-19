'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Pack {
    id: string;
    name: string;
    total_sessions: number;
    used_sessions: number;
    price: number;
    status: 'active' | 'completed' | 'expired';
}

interface PacksManagerProps {
    patientId: string;
}

export function PacksManager({ patientId }: PacksManagerProps) {
    const [packs, setPacks] = useState<Pack[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchPacks();
    }, [patientId]);

    const fetchPacks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('patient_packs')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching packs:', error);
        } else {
            setPacks(data || []);
        }
        setLoading(false);
    };

    const handleCreatePack = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newPack = {
            patient_id: patientId,
            name: formData.get('name'),
            total_sessions: parseInt(formData.get('sessions') as string),
            price: parseFloat(formData.get('price') as string) || 0,
            used_sessions: 0,
            status: 'active'
        };

        const { error } = await supabase.from('patient_packs').insert([newPack]);

        if (error) {
            toast.error('Error al crear el bono');
            console.error(error);
        } else {
            toast.success('Bono asignado correctamente');
            setIsDialogOpen(false);
            fetchPacks();
        }
    };

    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="text-purple-600" size={20} />
                    Bonos y Packs
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2 text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100">
                            <Plus size={16} />
                            Asignar Bono
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Asignar Nuevo Bono</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreatePack} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Bono</Label>
                                <Input id="name" name="name" placeholder="Ej: Bono 10 Sesiones" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessions">Nº Sesiones</Label>
                                    <Input id="sessions" name="sessions" type="number" min="1" defaultValue="10" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio Total (€)</Label>
                                    <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Guardar Bono</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Cargando bonos...</p>
                ) : packs.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Ticket className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Este paciente no tiene bonos activos.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {packs.map((pack) => {
                            const progress = (pack.used_sessions / pack.total_sessions) * 100;
                            return (
                                <div key={pack.id} className="border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{pack.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {pack.used_sessions} de {pack.total_sessions} sesiones usadas
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${pack.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {pack.status === 'active' ? 'Activo' : 'Completado'}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
