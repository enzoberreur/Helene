-- ============================================================================
-- SUIVI MENSTRUEL ET HORMONAL POUR MÉNOPAUSE
-- ============================================================================
-- Description: Tables pour suivre les cycles menstruels, hémorragies,
--              taux hormonaux et évaluation des risques opératoires
-- Date: 6 janvier 2026
-- ============================================================================

-- ============================================================================
-- TABLE: menstrual_cycles
-- Description: Suivi des cycles menstruels avec intensité des saignements
-- ============================================================================

DROP TABLE IF EXISTS menstrual_cycles CASCADE;

CREATE TABLE menstrual_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Date et durée
  period_start_date DATE NOT NULL,
  period_end_date DATE,
  flow_duration INTEGER CHECK (flow_duration BETWEEN 1 AND 30), -- Durée des saignements en jours
  
  -- Caractéristiques du flux
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'moderate', 'heavy', 'hemorrhage')) NOT NULL,
  has_clots BOOLEAN DEFAULT false,
  clot_size TEXT CHECK (clot_size IN ('small', 'medium', 'large', NULL)),
  
  -- Cycle
  cycle_length INTEGER CHECK (cycle_length BETWEEN 15 AND 90), -- Jours entre 2 règles
  is_irregular BOOLEAN DEFAULT false,
  
  -- Symptômes associés
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10) DEFAULT 0,
  cramping_severity TEXT CHECK (cramping_severity IN ('none', 'mild', 'moderate', 'severe')),
  
  -- Impact
  affects_daily_life BOOLEAN DEFAULT false,
  missed_work BOOLEAN DEFAULT false,
  
  -- Alerte automatique
  requires_urgent_attention BOOLEAN DEFAULT false, -- Si hémorragie dangereuse
  alert_reason TEXT, -- Raison de l'alerte (ex: "Flux hémorragique > 7 jours")
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_menstrual_cycles_user_id ON menstrual_cycles(user_id);
CREATE INDEX idx_menstrual_cycles_start_date ON menstrual_cycles(period_start_date DESC);
CREATE INDEX idx_menstrual_cycles_urgent ON menstrual_cycles(user_id, requires_urgent_attention) WHERE requires_urgent_attention = true;

-- Row Level Security
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycles"
  ON menstrual_cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles"
  ON menstrual_cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON menstrual_cycles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
  ON menstrual_cycles FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_menstrual_cycles_updated_at
  BEFORE UPDATE ON menstrual_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calcul automatique du cycle_length
CREATE OR REPLACE FUNCTION calculate_cycle_length()
RETURNS TRIGGER AS $$
DECLARE
  previous_cycle_date DATE;
BEGIN
  -- Trouver la date du cycle précédent pour cette utilisatrice
  SELECT period_start_date INTO previous_cycle_date
  FROM menstrual_cycles
  WHERE user_id = NEW.user_id
    AND period_start_date < NEW.period_start_date
  ORDER BY period_start_date DESC
  LIMIT 1;
  
  -- Calculer la durée du cycle si on a un cycle précédent
  IF previous_cycle_date IS NOT NULL THEN
    NEW.cycle_length := NEW.period_start_date - previous_cycle_date;
    
    -- Marquer comme irrégulier si < 21 jours ou > 35 jours
    IF NEW.cycle_length < 21 OR NEW.cycle_length > 35 THEN
      NEW.is_irregular := true;
    END IF;
  END IF;
  
  -- Calculer la durée du flux si period_end_date est défini
  IF NEW.period_end_date IS NOT NULL THEN
    NEW.flow_duration := NEW.period_end_date - NEW.period_start_date + 1;
  END IF;
  
  -- Détecter les situations d'urgence
  IF NEW.flow_intensity = 'hemorrhage' THEN
    NEW.requires_urgent_attention := true;
    NEW.alert_reason := 'Hémorragie détectée - Consulter un médecin rapidement';
  ELSIF NEW.flow_intensity = 'heavy' AND NEW.has_clots = true AND NEW.clot_size = 'large' THEN
    NEW.requires_urgent_attention := true;
    NEW.alert_reason := 'Flux abondant avec gros caillots - Consultation recommandée';
  ELSIF NEW.flow_duration > 7 AND NEW.flow_intensity IN ('heavy', 'hemorrhage') THEN
    NEW.requires_urgent_attention := true;
    NEW.alert_reason := 'Saignement prolongé (>7 jours) et abondant - Urgence médicale';
  ELSIF NEW.cycle_length IS NOT NULL AND NEW.cycle_length < 21 THEN
    NEW.requires_urgent_attention := true;
    NEW.alert_reason := 'Cycle très court (<21 jours) - Évaluation hormonale recommandée';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_cycle_length
  BEFORE INSERT OR UPDATE ON menstrual_cycles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cycle_length();


-- ============================================================================
-- TABLE: hormone_levels
-- Description: Suivi des taux hormonaux pour évaluation THS
-- ============================================================================

DROP TABLE IF EXISTS hormone_levels CASCADE;

CREATE TABLE hormone_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Date du test
  test_date DATE NOT NULL,
  test_type TEXT CHECK (test_type IN ('blood', 'saliva', 'urine')) DEFAULT 'blood',
  
  -- Hormones (valeurs en unités médicales standards)
  estrogen_pg_ml DECIMAL(10,2), -- Estradiol en pg/mL (normal: 15-350 pré-meno, <20 post-meno)
  progesterone_ng_ml DECIMAL(10,2), -- Progestérone en ng/mL (normal: 0.1-25)
  fsh_mui_ml DECIMAL(10,2), -- FSH en mUI/mL (ménopause si >25-30)
  lh_mui_ml DECIMAL(10,2), -- LH en mUI/mL
  testosterone_ng_dl DECIMAL(10,2), -- Testostérone en ng/dL (femme: 15-70)
  
  -- Autres marqueurs
  thyroid_tsh DECIMAL(10,2), -- TSH (hypothyroïdie fréquente en ménopause)
  vitamin_d_ng_ml DECIMAL(10,2), -- Vitamine D (important pour os)
  
  -- Évaluation automatique
  menopause_stage_detected TEXT CHECK (menopause_stage_detected IN ('pre', 'peri', 'meno', 'post')),
  needs_treatment BOOLEAN DEFAULT false,
  treatment_recommendation TEXT,
  
  -- Contexte
  doctor_name TEXT,
  lab_name TEXT,
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_hormone_levels_user_id ON hormone_levels(user_id);
CREATE INDEX idx_hormone_levels_test_date ON hormone_levels(test_date DESC);

-- Row Level Security
ALTER TABLE hormone_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hormone levels"
  ON hormone_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hormone levels"
  ON hormone_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hormone levels"
  ON hormone_levels FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hormone levels"
  ON hormone_levels FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_hormone_levels_updated_at
  BEFORE UPDATE ON hormone_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour évaluation automatique
CREATE OR REPLACE FUNCTION evaluate_hormone_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Détecter le stade de ménopause selon FSH et Estradiol
  IF NEW.fsh_mui_ml IS NOT NULL AND NEW.estrogen_pg_ml IS NOT NULL THEN
    IF NEW.fsh_mui_ml > 40 AND NEW.estrogen_pg_ml < 20 THEN
      NEW.menopause_stage_detected := 'post';
      NEW.treatment_recommendation := 'Ménopause confirmée. THS à considérer si symptômes gênants.';
    ELSIF NEW.fsh_mui_ml BETWEEN 25 AND 40 THEN
      NEW.menopause_stage_detected := 'meno';
      NEW.treatment_recommendation := 'Transition ménopausique. Évaluer les symptômes pour THS.';
    ELSIF NEW.fsh_mui_ml BETWEEN 10 AND 25 AND NEW.estrogen_pg_ml < 50 THEN
      NEW.menopause_stage_detected := 'peri';
      NEW.treatment_recommendation := 'Périménopause. Surveillance des symptômes recommandée.';
    ELSE
      NEW.menopause_stage_detected := 'pre';
    END IF;
  END IF;
  
  -- Déterminer si traitement nécessaire (basé sur symptômes + taux)
  IF NEW.fsh_mui_ml > 30 AND NEW.estrogen_pg_ml < 30 THEN
    NEW.needs_treatment := true;
    
    IF NEW.treatment_recommendation IS NULL OR NEW.treatment_recommendation = '' THEN
      NEW.treatment_recommendation := 'Taux hormonaux compatibles avec THS. Consulter un gynécologue.';
    END IF;
  END IF;
  
  -- Alerte thyroïde (fréquent en ménopause)
  IF NEW.thyroid_tsh IS NOT NULL AND (NEW.thyroid_tsh < 0.4 OR NEW.thyroid_tsh > 4.5) THEN
    NEW.treatment_recommendation := COALESCE(NEW.treatment_recommendation, '') || 
      ' ⚠️ TSH anormale - Consulter un endocrinologue.';
  END IF;
  
  -- Alerte vitamine D
  IF NEW.vitamin_d_ng_ml IS NOT NULL AND NEW.vitamin_d_ng_ml < 30 THEN
    NEW.treatment_recommendation := COALESCE(NEW.treatment_recommendation, '') || 
      ' Carence en vitamine D - Supplémentation recommandée.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_evaluate_hormone_levels
  BEFORE INSERT OR UPDATE ON hormone_levels
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_hormone_levels();


-- ============================================================================
-- TABLE: surgical_risk_assessment
-- Description: Évaluation du risque opératoire (hystérectomie)
-- ============================================================================

DROP TABLE IF EXISTS surgical_risk_assessment CASCADE;

CREATE TABLE surgical_risk_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Date de l'évaluation
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Facteurs de risque démographiques
  age INTEGER NOT NULL,
  bmi DECIMAL(4,1),
  
  -- Comorbidités
  has_diabetes BOOLEAN DEFAULT false,
  has_hypertension BOOLEAN DEFAULT false,
  has_cardiovascular_disease BOOLEAN DEFAULT false,
  has_coagulation_disorder BOOLEAN DEFAULT false,
  has_anemia BOOLEAN DEFAULT false,
  is_smoker BOOLEAN DEFAULT false,
  
  -- Historique hémorragique
  hemorrhages_per_month INTEGER CHECK (hemorrhages_per_month BETWEEN 0 AND 30),
  average_flow_duration INTEGER, -- En jours
  has_recurrent_hemorrhages BOOLEAN DEFAULT false,
  
  -- Impact qualité de vie
  quality_of_life_score INTEGER CHECK (quality_of_life_score BETWEEN 0 AND 10), -- 0 = très mauvais, 10 = excellent
  affects_work BOOLEAN DEFAULT false,
  affects_relationships BOOLEAN DEFAULT false,
  requires_blood_transfusion BOOLEAN DEFAULT false,
  
  -- Traitements essayés
  tried_hormonal_treatment BOOLEAN DEFAULT false,
  hormonal_treatment_effective BOOLEAN,
  tried_other_treatments TEXT[], -- ['IUD', 'ablation endométriale', etc.]
  
  -- Calcul automatique du score de risque
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100), -- 0 = faible, 100 = très élevé
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),
  
  -- Recommandation
  recommendation TEXT,
  consider_surgery BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_surgical_risk_user_id ON surgical_risk_assessment(user_id);
CREATE INDEX idx_surgical_risk_date ON surgical_risk_assessment(assessment_date DESC);

-- Row Level Security
ALTER TABLE surgical_risk_assessment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk assessments"
  ON surgical_risk_assessment FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk assessments"
  ON surgical_risk_assessment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk assessments"
  ON surgical_risk_assessment FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own risk assessments"
  ON surgical_risk_assessment FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_surgical_risk_updated_at
  BEFORE UPDATE ON surgical_risk_assessment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calcul automatique du risque
CREATE OR REPLACE FUNCTION calculate_surgical_risk()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Facteurs démographiques
  IF NEW.age > 50 THEN score := score + 10; END IF;
  IF NEW.age > 60 THEN score := score + 5; END IF;
  IF NEW.bmi > 30 THEN score := score + 10; END IF;
  IF NEW.bmi > 40 THEN score := score + 10; END IF;
  
  -- Comorbidités (chaque +5 points)
  IF NEW.has_diabetes THEN score := score + 5; END IF;
  IF NEW.has_hypertension THEN score := score + 5; END IF;
  IF NEW.has_cardiovascular_disease THEN score := score + 10; END IF;
  IF NEW.has_coagulation_disorder THEN score := score + 15; END IF;
  IF NEW.has_anemia THEN score := score + 5; END IF;
  IF NEW.is_smoker THEN score := score + 5; END IF;
  
  -- Sévérité hémorragique (plus critique)
  IF NEW.hemorrhages_per_month > 3 THEN score := score + 15; END IF;
  IF NEW.has_recurrent_hemorrhages THEN score := score + 10; END IF;
  IF NEW.requires_blood_transfusion THEN score := score + 20; END IF;
  
  -- Impact qualité de vie
  IF NEW.quality_of_life_score < 3 THEN score := score + 15; END IF;
  IF NEW.affects_work THEN score := score + 5; END IF;
  IF NEW.affects_relationships THEN score := score + 5; END IF;
  
  -- Échecs thérapeutiques
  IF NEW.tried_hormonal_treatment AND NEW.hormonal_treatment_effective = false THEN
    score := score + 20;
  END IF;
  
  -- Limiter le score à 100
  IF score > 100 THEN score := 100; END IF;
  
  NEW.risk_score := score;
  
  -- Déterminer le niveau de risque
  IF score < 30 THEN
    NEW.risk_level := 'low';
    NEW.recommendation := 'Surveillance régulière. Traitements conservateurs recommandés.';
    NEW.consider_surgery := false;
  ELSIF score < 50 THEN
    NEW.risk_level := 'moderate';
    NEW.recommendation := 'Optimiser les traitements médicaux. Envisager traitements interventionnels (ablation endométriale, DIU hormonal).';
    NEW.consider_surgery := false;
  ELSIF score < 70 THEN
    NEW.risk_level := 'high';
    NEW.recommendation := 'Échec des traitements conservateurs. Discuter des options chirurgicales avec votre gynécologue.';
    NEW.consider_surgery := true;
  ELSE
    NEW.risk_level := 'very_high';
    NEW.recommendation := '⚠️ Situation critique - Impact majeur sur la santé. Consultation chirurgicale urgente recommandée (hystérectomie à considérer).';
    NEW.consider_surgery := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_surgical_risk
  BEFORE INSERT OR UPDATE ON surgical_risk_assessment
  FOR EACH ROW
  EXECUTE FUNCTION calculate_surgical_risk();


-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue: Résumé des cycles avec alertes
CREATE OR REPLACE VIEW v_cycle_summary AS
SELECT 
  mc.user_id,
  COUNT(*) as total_cycles,
  AVG(mc.cycle_length) as avg_cycle_length,
  AVG(mc.flow_duration) as avg_flow_duration,
  COUNT(*) FILTER (WHERE mc.flow_intensity IN ('heavy', 'hemorrhage')) as heavy_flow_count,
  COUNT(*) FILTER (WHERE mc.requires_urgent_attention = true) as urgent_alerts_count,
  MAX(mc.period_start_date) as last_period_date,
  CURRENT_DATE - MAX(mc.period_start_date) as days_since_last_period
FROM menstrual_cycles mc
GROUP BY mc.user_id;

-- Vue: Dernière évaluation hormonale
CREATE OR REPLACE VIEW v_latest_hormone_levels AS
SELECT DISTINCT ON (user_id)
  *
FROM hormone_levels
ORDER BY user_id, test_date DESC;

-- ============================================================================
-- DONNÉES DE TEST (optionnel - à commenter en production)
-- ============================================================================

-- Exemple de cycle normal
-- INSERT INTO menstrual_cycles (user_id, period_start_date, period_end_date, flow_intensity, pain_level)
-- VALUES 
--   ('user-uuid-here', '2026-01-01', '2026-01-05', 'moderate', 3);

-- Exemple d'hémorragie (déclenche alerte)
-- INSERT INTO menstrual_cycles (user_id, period_start_date, period_end_date, flow_intensity, has_clots, clot_size)
-- VALUES 
--   ('user-uuid-here', '2026-01-15', '2026-01-23', 'hemorrhage', true, 'large');

-- Exemple de test hormonal
-- INSERT INTO hormone_levels (user_id, test_date, estrogen_pg_ml, fsh_mui_ml, progesterone_ng_ml)
-- VALUES 
--   ('user-uuid-here', '2026-01-06', 18.5, 42.3, 0.8);

COMMENT ON TABLE menstrual_cycles IS 'Suivi détaillé des cycles menstruels avec détection automatique des hémorragies dangereuses';
COMMENT ON TABLE hormone_levels IS 'Historique des taux hormonaux avec recommandations THS automatiques';
COMMENT ON TABLE surgical_risk_assessment IS 'Évaluation du risque opératoire pour hystérectomie basée sur critères médicaux et impact qualité de vie';
