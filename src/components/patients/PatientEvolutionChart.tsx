'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts'
import { Activity } from 'lucide-react'

interface EvolutionData {
    date: string
    pain_level: number
}

interface PatientEvolutionChartProps {
    data: EvolutionData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Nivel de Dolor: {payload[0].value}/10
                </p>
            </div>
        )
    }
    return null
}

export function PatientEvolutionChart({ data }: PatientEvolutionChartProps) {
    // Ordenar datos por fecha
    const sortedData = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
            ...item,
            displayDate: new Date(item.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short'
            })
        }))

    if (sortedData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                    <Activity className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sin datos de evolución</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xs">
                    Registra sesiones con nivel de dolor para visualizar el progreso del paciente.
                </p>
            </div>
        )
    }

    // Calcular tendencia
    const firstPain = sortedData[0].pain_level
    const lastPain = sortedData[sortedData.length - 1].pain_level
    const improvement = firstPain - lastPain

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                        Evolución del Tratamiento
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Historial de nivel de dolor</p>
                </div>
                <div className="text-right">
                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${improvement > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : improvement < 0
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                        {improvement > 0 ? `Mejora de ${improvement} pts` : improvement < 0 ? `Empeoró ${Math.abs(improvement)} pts` : 'Sin cambios'}
                    </span>
                </div>
            </div>

            <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <LineChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-800" />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 10]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        {/* Zonas de referencia opcionales para contexto visual */}
                        <ReferenceArea y1={0} y2={3} fill="#10b981" fillOpacity={0.05} />
                        <ReferenceArea y1={7} y2={10} fill="#ef4444" fillOpacity={0.05} />

                        <Line
                            type="monotone"
                            dataKey="pain_level"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
