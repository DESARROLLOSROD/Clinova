'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, User, Eye, Plus } from 'lucide-react';

export type MarkType = 'pain' | 'tension' | 'inflammation' | 'trigger_point' | 'injury';

export interface BodyMark {
    id: string;
    x_pos: number;
    y_pos: number;
    side: 'front' | 'back';
    mark_type: MarkType;
    notes?: string;
}

interface BodyMapProps {
    onMarksChange?: (marks: BodyMark[]) => void;
    initialMarks?: BodyMark[];
    readOnly?: boolean;
}

const MARK_TYPES: { type: MarkType; label: string; color: string }[] = [
    { type: 'pain', label: 'Dolor', color: '#ef4444' }, // rojo
    { type: 'tension', label: 'Tensión', color: '#f59e0b' }, // naranja
    { type: 'trigger_point', label: 'Punto Gatillo', color: '#8b5cf6' }, // violeta
    { type: 'inflammation', label: 'Inflamación', color: '#3b82f6' }, // azul
    { type: 'injury', label: 'Lesión/Trauma', color: '#000000' }, // negro
];

export function BodyMap({ onMarksChange, initialMarks = [], readOnly = false }: BodyMapProps) {
    const [marks, setMarks] = useState<BodyMark[]>(initialMarks);
    const [side, setSide] = useState<'front' | 'back'>('front');
    const [selectedType, setSelectedType] = useState<MarkType>('pain');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onMarksChange) onMarksChange(marks);
    }, [marks, onMarksChange]);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (readOnly || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newMark: BodyMark = {
            id: crypto.randomUUID(),
            x_pos: parseFloat(x.toFixed(2)),
            y_pos: parseFloat(y.toFixed(2)),
            side,
            mark_type: selectedType,
        };

        setMarks([...marks, newMark]);
    };

    const removeMark = (id: string) => {
        if (readOnly) return;
        setMarks(marks.filter(m => m.id !== id));
    };

    const clearMarks = () => {
        if (readOnly || !confirm('¿Borrar todas las marcas del mapa?')) return;
        setMarks([]);
    };

    // Siluetas simplificadas (Path data para hombre genérico)
    const frontPath = "M50,5 C45,5 42,8 42,12 C42,16 45,19 50,19 C55,19 58,16 58,12 C58,8 55,5 50,5 Z M42,20 C35,20 25,25 20,45 L22,46 C25,35 32,30 40,28 L38,60 L35,95 L45,95 L48,70 L50,70 L52,70 L55,95 L65,95 L62,60 L60,28 C68,30 75,35 78,46 L80,45 C75,25 65,20 58,20 L42,20 Z";
    // En una versión más pro usaríamos SVGs reales completos. Para este MVP usamos una representación esquemática.

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 bg-slate-50 rounded-xl border">
            {/* Controles y Lista */}
            <div className="flex-1 space-y-4 order-2 lg:order-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={18} />
                        Mapa de Hallazgos
                    </h3>
                    {!readOnly && (
                        <Button variant="ghost" size="sm" onClick={clearMarks} className="text-red-500 hover:text-red-700">
                            <RotateCcw size={16} className="mr-1" /> Limpiar
                        </Button>
                    )}
                </div>

                {!readOnly && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {MARK_TYPES.map((t) => (
                            <button
                                key={t.type}
                                onClick={() => setSelectedType(t.type)}
                                className={`flex items-center gap-2 p-2 rounded-md text-xs font-medium border transition-all ${selectedType === t.type
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600'
                                    }`}
                            >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-lg border max-h-[300px] overflow-y-auto">
                    {marks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic">
                            Sin marcas registradas. Haz clic en el cuerpo para añadir.
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {marks.map((m) => {
                                const typeInfo = MARK_TYPES.find(t => t.type === m.mark_type);
                                return (
                                    <li key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeInfo?.color }} />
                                            <div className="text-sm">
                                                <span className="font-semibold">{typeInfo?.label}</span>
                                                <span className="mx-2 text-slate-400">|</span>
                                                <span className="text-slate-500 uppercase text-[10px]">{m.side === 'front' ? 'Frente' : 'Espalda'}</span>
                                            </div>
                                        </div>
                                        {!readOnly && (
                                            <button onClick={() => removeMark(m.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Visualizador del Cuerpo */}
            <div className="flex-none flex flex-col items-center gap-4 order-1 lg:order-2">
                <div className="flex gap-2">
                    <Button
                        variant={side === 'front' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setSide('front')}
                        className="rounded-full px-4"
                    >
                        Frente
                    </Button>
                    <Button
                        variant={side === 'back' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setSide('back')}
                        className="rounded-full px-4"
                    >
                        Espalda
                    </Button>
                </div>

                <div
                    ref={containerRef}
                    onClick={handleMapClick}
                    className={`relative w-[280px] h-[450px] bg-white rounded-2xl border-2 shadow-inner overflow-hidden ${!readOnly ? 'cursor-crosshair' : 'cursor-default'}`}
                >
                    {/* SVG del Cuerpo */}
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-100 stroke-slate-300 stroke-[0.5]">
                        <path d={frontPath} />
                        {/* Si es BACK podrías añadir pequeños detalles como las escápulas o la línea de la columna */}
                        {side === 'back' && (
                            <path d="M50,28 L50,70" className="stroke-slate-200 dashed" strokeDasharray="1,1" />
                        )}
                    </svg>

                    {/* Marcas dinámicas */}
                    {marks.filter(m => m.side === side).map((m) => {
                        const typeInfo = MARK_TYPES.find(t => t.type === m.mark_type);
                        return (
                            <div
                                key={m.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md animate-in zoom-in duration-300 pointer-events-none"
                                style={{
                                    left: `${m.x_pos}%`,
                                    top: `${m.y_pos}%`,
                                    backgroundColor: typeInfo?.color
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
