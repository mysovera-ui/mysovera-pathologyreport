insert into storage.buckets (id, name, public)
values ('generated-reports', 'generated-reports', true)
on conflict (id) do nothing;

drop policy if exists "generated_reports_v1_insert" on storage.objects;
create policy "generated_reports_v1_insert" on storage.objects for insert
  with check (bucket_id = 'generated-reports');

drop policy if exists "generated_reports_v1_select" on storage.objects;
create policy "generated_reports_v1_select" on storage.objects for select
  using (bucket_id = 'generated-reports');

drop policy if exists "generated_reports_v1_update" on storage.objects;
create policy "generated_reports_v1_update" on storage.objects for update
  using (bucket_id = 'generated-reports');
