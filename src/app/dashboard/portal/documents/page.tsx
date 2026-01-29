import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PortalDocumentsPage() {
    const documents = [
        { id: 1, name: 'Guía de Bienvenida.pdf', date: '2024-01-15' },
        { id: 2, name: 'Consentimiento Informado.pdf', date: '2024-01-15' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
                <p className="text-gray-600">Archivos compartidos y reportes</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                    <Card key={doc.id} className="p-4 flex items-center justify-between bg-white text-gray-900 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FileText className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">Compartido el {doc.date}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Download size={18} />
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
