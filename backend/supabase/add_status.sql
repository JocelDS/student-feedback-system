-- Run this ONCE in Supabase: SQL Editor > New query > paste > Run
-- Adds status tracking to the existing feedback table. Existing records are kept
-- and automatically get the status "Pending".

alter table public.feedback
  add column if not exists status text not null default 'Pending';

alter table public.feedback
  drop constraint if exists feedback_status_check;

alter table public.feedback
  add constraint feedback_status_check
  check (status in ('Pending', 'Reviewed', 'Resolved'));