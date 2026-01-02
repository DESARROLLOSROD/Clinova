-- Create appointment status enum
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

-- Create appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  therapist_id uuid references auth.users(id) on delete set null,
  title text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status appointment_status default 'scheduled',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on public.appointments
  for all using (auth.role() = 'authenticated');
