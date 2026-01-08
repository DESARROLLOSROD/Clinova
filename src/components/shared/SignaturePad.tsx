'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClear?: () => void;
    width?: number;
    height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
    onSave,
    onClear,
    width = 400,
    height = 200,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
            const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
            const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

            if (ctx) {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        if (onClear) onClear();
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Verificar si el canvas está vacío (opcional)
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="relative border-2 border-dashed border-gray-300 rounded-md cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseOut={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    className="max-w-full h-auto"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                    Firme aquí
                </div>
            </div>

            <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" size="sm" onClick={clear} className="flex gap-2">
                    <Eraser className="w-4 h-4" />
                    Limpiar
                </Button>
                <Button size="sm" onClick={save} className="flex gap-2">
                    <Check className="w-4 h-4" />
                    Guardar Firma
                </Button>
            </div>
        </div>
    );
};
