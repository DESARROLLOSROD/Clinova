'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dumbbell, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Exercise {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    thumbnail_url: string | null;
}

interface ExerciseSelectorProps {
    onSelect: (exercise: Exercise) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
    const [open, setOpen] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const supabase = createClient();

    useEffect(() => {
        if (open && exercises.length === 0) {
            fetchExercises();
        }
    }, [open]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredExercises(exercises);
        } else {
            const lowerSearch = search.toLowerCase();
            setFilteredExercises(
                exercises.filter(
                    (e) =>
                        e.name.toLowerCase().includes(lowerSearch) ||
                        e.category?.toLowerCase().includes(lowerSearch)
                )
            );
        }
    }, [search, exercises]);

    const fetchExercises = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('exercise_library')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching exercises:', error);
        } else {
            setExercises(data || []);
            setFilteredExercises(data || []);
        }
        setLoading(false);
    };

    const handleSelect = (exercise: Exercise) => {
        onSelect(exercise);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed">
                    <Dumbbell size={16} />
                    Agregar Ejercicio
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bibliotecas de Ejercicios</DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Buscar ejercicio..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Cargando ejercicios...</div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron ejercicios.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredExercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    onClick={() => handleSelect(exercise)}
                                    className="flex items-center gap-4 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    {exercise.thumbnail_url ? (
                                        <img
                                            src={exercise.thumbnail_url}
                                            alt={exercise.name}
                                            className="w-12 h-12 rounded object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Dumbbell size={20} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {exercise.category}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {exercise.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
