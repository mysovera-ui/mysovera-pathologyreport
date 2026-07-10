-- Public buckets already serve objects by direct URL regardless of RLS
-- (that's what bucket.public=true does). The broad SELECT policy on
-- storage.objects is only needed for listing/browsing the bucket via the
-- API, which the app never does -- it always stores and uses full URLs.
-- Dropping it prevents a client from enumerating every file in the bucket.
drop policy if exists "report_files_v1_select" on storage.objects;
drop policy if exists "generated_reports_v1_select" on storage.objects;
