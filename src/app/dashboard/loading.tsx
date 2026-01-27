import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" /> {/* Title */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
