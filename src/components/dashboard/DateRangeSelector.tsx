"use client"

import * as React from "react"
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useSearchParams } from "next/navigation"

export function DateRangeSelector({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize from URL params or default to current month
    const initialDate: DateRange | undefined = React.useMemo(() => {
        const from = searchParams.get("from")
        const to = searchParams.get("to")

        if (from && to) {
            return {
                from: new Date(from),
                to: new Date(to),
            }
        }

        // Default: Current Month
        return {
            from: startOfMonth(new Date()),
            to: new Date(), // Up to today
        }
    }, [searchParams])

    const [date, setDate] = React.useState<DateRange | undefined>(initialDate)

    // Update URL when date changes
    React.useEffect(() => {
        if (date?.from && date?.to) {
            const params = new URLSearchParams(searchParams)
            params.set("from", date.from.toISOString())
            params.set("to", date.to.toISOString())

            router.push(`?${params.toString()}`, { scroll: false })
        }
    }, [date, router, searchParams])

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: es })
                            )
                        ) : (
                            <span>Selecciona un rango</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={es}
                    />
                    <div className="p-3 border-t border-border grid grid-cols-2 gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDate({
                                from: subDays(new Date(), 7),
                                to: new Date()
                            })}
                        >
                            Últimos 7 días
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDate({
                                from: startOfMonth(new Date()),
                                to: new Date()
                            })}
                        >
                            Este Mes
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDate({
                                from: subDays(new Date(), 30),
                                to: new Date()
                            })}
                        >
                            Últimos 30 días
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDate({
                                from: startOfYear(new Date()),
                                to: new Date()
                            })}
                        >
                            Este Año
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
