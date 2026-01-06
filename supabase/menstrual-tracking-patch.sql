-- ============================================================================
-- PATCH: Rendre flow_duration optionnel
-- ============================================================================
-- Raison: Le champ period_end_date a été retiré du formulaire, donc
--         flow_duration ne peut plus être calculé et doit être nullable
-- Date: 6 janvier 2026
-- ============================================================================

-- Supprimer la contrainte CHECK sur flow_duration
ALTER TABLE menstrual_cycles
DROP CONSTRAINT IF EXISTS menstrual_cycles_flow_duration_check;

-- Rendre la colonne flow_duration nullable (elle l'est déjà par défaut)
-- Pas besoin de modification supplémentaire

COMMENT ON COLUMN menstrual_cycles.flow_duration IS 'Durée des saignements en jours (optionnel, calculé automatiquement si period_end_date fourni)';
