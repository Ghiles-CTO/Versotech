-- Align KYC submission statuses and document-member delete behavior across environments.

alter table public.kyc_submissions
  drop constraint if exists kyc_submissions_status_check;

alter table public.kyc_submissions
  add constraint kyc_submissions_status_check
  check (
    status = any (
      array[
        'draft'::text,
        'pending'::text,
        'under_review'::text,
        'approved'::text,
        'rejected'::text,
        'expired'::text,
        'info_requested'::text
      ]
    )
  );

alter table public.documents
  drop constraint if exists documents_partner_member_id_fkey,
  drop constraint if exists documents_introducer_member_id_fkey,
  drop constraint if exists documents_lawyer_member_id_fkey,
  drop constraint if exists documents_commercial_partner_member_id_fkey;

alter table public.documents
  add constraint documents_partner_member_id_fkey
    foreign key (partner_member_id)
    references public.partner_members(id)
    on delete set null,
  add constraint documents_introducer_member_id_fkey
    foreign key (introducer_member_id)
    references public.introducer_members(id)
    on delete set null,
  add constraint documents_lawyer_member_id_fkey
    foreign key (lawyer_member_id)
    references public.lawyer_members(id)
    on delete set null,
  add constraint documents_commercial_partner_member_id_fkey
    foreign key (commercial_partner_member_id)
    references public.commercial_partner_members(id)
    on delete set null;
