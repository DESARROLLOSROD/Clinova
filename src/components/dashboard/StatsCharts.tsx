'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { useState, useEffect } from 'react'

interface ChartData {
    name: string
    value: number
    fill?: string
}

interface StatsChartsProps {
    sessionsData: ChartData[]
    revenueData: ChartData[]
    patientDistribution: ChartData[]
}

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {prefix}{payload[0].value.toLocaleString()}
                    <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal">
                        {suffix || (payload[0].dataKey === 'value' ? '' : '')}
                    </span>
                </p>
            </div>
        )
    }
    return null
}

export function StatsCharts({ sessionsData, revenueData, patientDistribution }: StatsChartsProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 h-[300px] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse" />
                <div className="bg-white dark:bg-gray-900 h-[300px] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Sesiones */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sesiones</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rendimiento en el periodo</p>
                    </div>
                </div>
                <div className="w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <BarChart data={sessionsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-800" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip suffix=" sesiones" />} cursor={{ fill: '#f8fafc', opacity: 0.8 }} />
                            <Bar
                                dataKey="value"
                                fill="#3b82f6"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                                className="fill-blue-500 dark:fill-blue-600"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de Ingresos */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ingresos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tendencia financiera</p>
                    </div>
                </div>
                <div className="w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-800" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip prefix="$" />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIngresos)"
                                className="stroke-emerald-500 dark:stroke-emerald-400"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de Distribución de Pacientes */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md min-w-0 lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Distribución de Pacientes</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estado actual</p>
                    </div>
                </div>
                <div className="w-full relative" style={{ height: 300 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                            <Pie
                                data={patientDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {patientDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
