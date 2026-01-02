-- Create sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  subjective text, -- S: Lo que el paciente dice
  objective text,  -- O: Lo que el terapeuta observa/mide
  assessment text, -- A: Diagnóstico/Análisis
  plan text,       -- P: Plan de tratamiento
  pain_level integer check (pain_level >= 0 and pain_level <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sessions enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on public.sessions
  for all using (auth.role() = 'authenticated');
