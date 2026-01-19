import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label?: string;
        positive?: boolean; // true if positive trend is good (green), false if bad (red)
    };
    color?: 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'pink' | 'teal';
    className?: string;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-800',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-800',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-100 dark:border-green-800',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-800',
    },
    indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-100 dark:border-indigo-800',
    },
    pink: {
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-100 dark:border-pink-800',
    },
    teal: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-100 dark:border-teal-800',
    },
};

export function KPICard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    color = 'blue',
    className = '',
}: KPICardProps) {
    const styles = colorMap[color];

    return (
        <div
            className={`bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md ${className}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
                        {subValue && (
                            <span className="text-xs text-gray-500 dark:text-gray-500 font-normal">
                                {subValue}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${styles.bg}`}>
                    <Icon className={`${styles.text} w-6 h-6`} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span
                        className={`inline-flex items-center font-medium ${trend.value === 0
                                ? 'text-gray-500'
                                : (trend.positive === undefined ? trend.value > 0 : trend.positive)
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                    >
                        {trend.value > 0 ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : trend.value < 0 ? (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                        ) : (
                            <Minus className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(trend.value).toFixed(1)}%
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                        {trend.label || 'vs mes anterior'}
                    </span>
                </div>
            )}
        </div>
    );
}
