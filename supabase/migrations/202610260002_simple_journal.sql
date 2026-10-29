-- Additive upgrade: keep all existing routines, sessions, IDs and historical values.
-- Blank draft cells are NULL; zero remains an explicitly entered load.
alter table public.routine_sets alter column weight drop not null;
alter table public.routine_sets alter column target drop not null;
alter table public.performed_sets alter column weight drop not null;
alter table public.performed_sets alter column reps drop not null;
alter table public.performed_sets alter column target drop not null;
-- Require actual repetitions for recorded sets; bodyweight may have no external load.
alter table public.performed_sets add constraint recorded_reps_present check(not completed or (reps is not null and reps>0));
