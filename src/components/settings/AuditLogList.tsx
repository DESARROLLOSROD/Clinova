'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shield, Clock, User, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { type AuditLogEntry } from '@/types/audit';
import { Badge } from '@/components/ui/badge';

export function AuditLogList() {
    const supabase = createClient();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching audit logs:', error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);


    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatEntityName = (name: string) => {
        const names: Record<string, string> = {
            patients: 'Paciente',
            appointments: 'Cita',
            payments: 'Pago',
            sessions: 'Sesión Clínica',
            patient_signatures: 'Firma Digital',
        };
        return names[name] || name;
    };

    if (loading) {
        return <div className="text-center py-10">Cargando registros de seguridad...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Registro de Auditoría y Seguridad</h2>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <Fragment key={log.id}>
                                    <tr
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(log.created_at).toLocaleString('es-ES')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <User size={14} className="text-gray-400" />
                                                <span>{log.user_id ? 'Usuario' : 'Sistema'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={getActionColor(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Database size={14} className="text-gray-400" />
                                                {formatEntityName(log.entity_type)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {expandedId === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </td>
                                    </tr>
                                    {expandedId === log.id && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 bg-gray-50 border-t border-b">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {log.details.old_data && (
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-500 mb-1">DATOS ANTERIORES</p>
                                                            <pre className="text-xs bg-white p-2 border rounded overflow-x-auto max-h-40">
                                                                {JSON.stringify(log.details.old_data, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {log.details.new_data && (
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-500 mb-1">DATOS NUEVOS</p>
                                                            <pre className="text-xs bg-white p-2 border rounded overflow-x-auto max-h-40">
                                                                {JSON.stringify(log.details.new_data, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-gray-500 italic">
                * El registro de auditoría es inmutable y sirve para el cumplimiento de normativas de salud.
            </p>
        </div>
    );
}
