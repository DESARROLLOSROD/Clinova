-- Create patients table
create table public.patients (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.patients enable row level security;

-- Create policies (simplified for MVP - authenticated users can do everything)
create policy "Enable all access for authenticated users" on public.patients
  for all using (auth.role() = 'authenticated');
