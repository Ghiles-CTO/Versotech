-- Migration: Add optional branding fields to vehicles
-- Description: Allow entities to store branding metadata used when creating deals

alter table public.vehicles
  add column if not exists logo_url text,
  add column if not exists website_url text;
