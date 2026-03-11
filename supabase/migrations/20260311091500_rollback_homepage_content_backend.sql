-- Migration: 20260311091500_rollback_homepage_content_backend.sql
-- Purpose: Remove unused investor Home page backend schema

DROP TABLE IF EXISTS public.home_interest_submissions;
DROP TABLE IF EXISTS public.home_items;
