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
import { FileText, Search, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TreatmentTemplate {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    duration_minutes: number | null;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
}

interface TemplateSelectorProps {
    onSelect: (template: TreatmentTemplate) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<TreatmentTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const supabase = createClient();

    useEffect(() => {
        if (open && templates.length === 0) {
            fetchTemplates();
        }
    }, [open]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredTemplates(templates);
        } else {
            const lowerSearch = search.toLowerCase();
            setFilteredTemplates(
                templates.filter(
                    (t) =>
                        t.name.toLowerCase().includes(lowerSearch) ||
                        t.category?.toLowerCase().includes(lowerSearch) ||
                        t.description?.toLowerCase().includes(lowerSearch)
                )
            );
        }
    }, [search, templates]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('treatment_templates')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching templates:', error);
        } else {
            setTemplates(data || []);
            setFilteredTemplates(data || []);
        }
        setLoading(false);
    };

    const handleSelect = (template: TreatmentTemplate) => {
        onSelect(template);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FileText size={16} />
                    Cargar Plantilla
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Seleccionar Plantilla de Tratamiento</DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre, categoría..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Cargando plantillas...</div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron plantillas.
                        </div>
                    ) : (
                        filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleSelect(template)}
                                className="group flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                                            {template.name}
                                        </h3>
                                        {template.category && (
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                {template.category}
                                            </Badge>
                                        )}
                                    </div>
                                    {template.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {template.description}
                                        </p>
                                    )}
                                    {template.duration_minutes && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Clock size={12} />
                                            <span>{template.duration_minutes} min</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-400" />
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
