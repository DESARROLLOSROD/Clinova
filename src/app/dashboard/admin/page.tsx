'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        activeClinics: 0,
        totalPatients: 0,
        mrr: 0,
        activeSubscriptions: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchGlobalStats() {
            setLoading(true);
            try {
                // 1. Clinics Count
                const { count: clinicsCount } = await supabase
                    .from('clinics')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                // 2. Total Patients
                const { count: patientsCount } = await supabase
                    .from('patients')
                    .select('*', { count: 'exact', head: true });

                // 3. Calculate MRR (Simplified based on tiers)
                // First get plan prices
                const { data: plans } = await supabase.from('subscription_plans').select('plan_name, monthly_price');
                const priceMap: Record<string, number> = {};
                plans?.forEach(p => { priceMap[p.plan_name] = Number(p.monthly_price) });

                // Get all clinics tiers
                const { data: clinics } = await supabase.from('clinics').select('subscription_tier').eq('is_active', true);

                let totalMrr = 0;
                let activeSubs = 0;

                clinics?.forEach(c => {
                    if (c.subscription_tier && priceMap[c.subscription_tier]) {
                        totalMrr += priceMap[c.subscription_tier];
                        activeSubs++;
                    }
                });

                setStats({
                    activeClinics: clinicsCount || 0,
                    totalPatients: patientsCount || 0,
                    mrr: totalMrr,
                    activeSubscriptions: activeSubs
                });

            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchGlobalStats();
    }, []);

    // Mock data for chart
    const data = [
        { name: 'Ene', clinics: 4 },
        { name: 'Feb', clinics: 6 },
        { name: 'Mar', clinics: 8 },
        { name: 'Abr', clinics: 12 },
        { name: 'May', clinics: 15 },
        { name: 'Jun', clinics: 20 },
    ];

    if (loading) {
        return <div className="p-8">Cargando métricas globales...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel Global</h1>
                <p className="text-gray-500">Visión general de la plataforma Clinova</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clínicas Activas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeClinics}</div>
                        <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients}</div>
                        <p className="text-xs text-muted-foreground">En todas las clínicas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR Estimado</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats.mrr.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Ingreso Mensual Recurrente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">Planes pagados activos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Growth Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Crecimiento de Clínicas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="clinics" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between">
                            <span>Gestionar Clínicas</span>
                            <TrendingUp size={18} />
                        </div>
                        <div className="p-4 bg-gray-50 text-gray-800 rounded-lg flex items-center justify-between">
                            <span>Configuración Global</span>
                            <Building2 size={18} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
