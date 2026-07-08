insert into storage.buckets (id, name, public)
values ('report-files', 'report-files', true)
on conflict (id) do nothing;

drop policy if exists "report_files_v1_insert" on storage.objects;
create policy "report_files_v1_insert" on storage.objects for insert
  with check (bucket_id = 'report-files');

drop policy if exists "report_files_v1_select" on storage.objects;
create policy "report_files_v1_select" on storage.objects for select
  using (bucket_id = 'report-files');
