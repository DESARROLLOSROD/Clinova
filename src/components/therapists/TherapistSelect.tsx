'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
}

interface TherapistSelectProps {
  name: string;
  required?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function TherapistSelect({ name, required = false, defaultValue, onValueChange }: TherapistSelectProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');

  useEffect(() => {
    async function fetchTherapists() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('therapists')
        .select('id, first_name, last_name, status')
        .eq('status', 'active')
        .order('first_name');

      if (error) {
        console.error('Error fetching therapists:', error);
      } else {
        setTherapists(data || []);
      }
      setLoading(false);
    }

    fetchTherapists();
  }, []);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <div>
      <Label htmlFor={name}>
        Fisioterapeuta {required && '*'}
      </Label>
      <Select
        name={name}
        required={required}
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder={loading ? 'Cargando...' : 'Seleccionar fisioterapeuta'} />
        </SelectTrigger>
        <SelectContent>
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id}>
              {therapist.first_name} {therapist.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
