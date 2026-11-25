-- Run this in Supabase: SQL Editor > New query > paste > Run

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_name text not null
    check (char_length(btrim(student_name)) between 1 and 80),
  category text not null
    check (category in ('Suggestion', 'Complaint', 'Appreciation', 'General Feedback')),
  message text not null
    check (char_length(btrim(message)) between 5 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

-- Security: turn on Row Level Security and add NO policies.
-- The public (anon) key and logged-in (authenticated) users can then do nothing
-- with this table. Only the Express backend, which uses the service_role key
-- (it bypasses RLS), can read and write records.
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
