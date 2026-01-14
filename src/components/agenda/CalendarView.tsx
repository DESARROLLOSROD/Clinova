'use client'

import React, { useMemo } from 'react'
import { Appointment } from '@/types/appointment'
import { AppointmentCard } from './AppointmentCard'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, differenceInMinutes, startOfDay, addHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarViewProps {
    appointments: Appointment[]
    currentDate: Date
    onDateChange: (date: Date) => void
    onAppointmentClick?: (appointment: Appointment) => void
}

const START_HOUR = 8 // 8 AM
const END_HOUR = 20 // 8 PM
const HOUR_HEIGHT = 60 // px

export function CalendarView({ appointments, currentDate, onDateChange, onAppointmentClick }: CalendarViewProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

    const getPositionStyle = (appointment: Appointment) => {
        const start = new Date(appointment.start_time)
        const end = new Date(appointment.end_time)

        // Calculate minutes from start of the day's grid
        const startMinutes = (start.getHours() - START_HOUR) * 60 + start.getMinutes()
        const durationMinutes = differenceInMinutes(end, start)

        const top = (startMinutes / 60) * HOUR_HEIGHT
        const height = (durationMinutes / 60) * HOUR_HEIGHT

        return { top: `${top}px`, height: `${height}px` }
    }

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
        onDateChange(newDate)
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            {/* Header Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')} className="dark:text-gray-400 dark:hover:text-gray-100">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')} className="dark:text-gray-400 dark:hover:text-gray-100">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div>
                    {/* Future: View Switcher (Day/Week/Month) */}
                </div>
            </div>

            <div className="flex flex-1 overflow-auto">
                {/* Time Labels */}
                <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800/30 border-r border-gray-100 dark:border-gray-800">
                    <div className="h-10 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"></div> {/* Header Spacer */}
                    {hours.map((hour) => (
                        <div key={hour} className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500 text-right pr-2 sticky left-0" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <span className="-top-2 relative">{format(addHours(startOfDay(new Date()), hour), 'h a')}</span>
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-800 min-w-[800px]">
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex flex-col">
                            {/* Day Header */}
                            <div className="h-10 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 sticky top-0 z-10">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{format(day, 'EEE', { locale: es })}</span>
                                <span className={`text-sm font-bold ${day.toDateString() === new Date().toDateString() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Day Column */}
                            <div className="relative flex-1 bg-white dark:bg-gray-900" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                                {/* Grid Lines */}
                                {hours.map((hour) => (
                                    <div key={hour} className="border-b border-gray-50 dark:border-gray-800/50 absolute w-full" style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}></div>
                                ))}

                                {/* Appointments */}
                                {appointments
                                    .filter(ppt => new Date(ppt.start_time).toDateString() === day.toDateString())
                                    .map(ppt => (
                                        <div key={ppt.id} className="absolute w-full px-1" style={getPositionStyle(ppt)}>
                                            <AppointmentCard appointment={ppt} onClick={onAppointmentClick} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
