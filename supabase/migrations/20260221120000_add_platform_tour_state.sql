-- Store platform tour completion by persona key and version.
-- Example:
-- {
--   "arranger": { "completed": true, "completedAt": "...", "version": "3.0.0" },
--   "investor_entity": { "completed": true, "completedAt": "...", "version": "3.0.0" }
-- }

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS platform_tour_state jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.platform_tour_state IS
  'Per-persona platform tour completion state keyed by persona variant and version.';
