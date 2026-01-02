-- Create payment method enum
create type public.payment_method as enum ('cash', 'card', 'transfer', 'insurance');

-- Create payment status enum
create type public.payment_status as enum ('pending', 'completed', 'cancelled', 'refunded');

-- Create payments table
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  amount decimal(10,2) not null check (amount >= 0),
  method payment_method not null,
  status payment_status default 'completed',
  description text,
  invoice_number text,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payments enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on public.payments
  for all using (auth.role() = 'authenticated');

-- Create index for faster queries
create index payments_patient_id_idx on public.payments(patient_id);
create index payments_session_id_idx on public.payments(session_id);
create index payments_payment_date_idx on public.payments(payment_date desc);
