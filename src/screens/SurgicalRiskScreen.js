import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function SurgicalRiskScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [assessments, setAssessments] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    has_diabetes: false,
    has_hypertension: false,
    has_cardiovascular_disease: false,
    has_coagulation_disorder: false,
    has_anemia: false,
    is_smoker: false,
    hemorrhages_per_month: '',
    average_flow_duration: '',
    has_recurrent_hemorrhages: false,
    quality_of_life_score: 5,
    affects_work: false,
    affects_relationships: false,
    requires_blood_transfusion: false,
    tried_hormonal_treatment: false,
    hormonal_treatment_effective: null,
    tried_other_treatments: [],
    notes: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAssessments();
      loadProfileData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age, bmi')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setFormData(prev => ({
          ...prev,
          age: data.age?.toString() || '',
          bmi: data.bmi?.toString() || '',
        }));
      }
    } catch (error) {
      console.log('Pas de profil trouvé:', error);
    }
  };

  const loadAssessments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('surgical_risk_assessment')
        .select('*')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
      if (data && data.length > 0) {
        setLatestAssessment(data[0]);
      }
      
    } catch (error) {
      console.error('Erreur chargement évaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.age || !formData.bmi) {
        Alert.alert('Erreur', 'Âge et IMC sont obligatoires');
        return;
      }

      const payload = {
        user_id: user.id,
        assessment_date: new Date().toISOString().split('T')[0],
        age: parseInt(formData.age),
        bmi: parseFloat(formData.bmi),
        has_diabetes: formData.has_diabetes,
        has_hypertension: formData.has_hypertension,
        has_cardiovascular_disease: formData.has_cardiovascular_disease,
        has_coagulation_disorder: formData.has_coagulation_disorder,
        has_anemia: formData.has_anemia,
        is_smoker: formData.is_smoker,
        hemorrhages_per_month: formData.hemorrhages_per_month ? parseInt(formData.hemorrhages_per_month) : null,
        average_flow_duration: formData.average_flow_duration ? parseInt(formData.average_flow_duration) : null,
        has_recurrent_hemorrhages: formData.has_recurrent_hemorrhages,
        quality_of_life_score: formData.quality_of_life_score,
        affects_work: formData.affects_work,
        affects_relationships: formData.affects_relationships,
        requires_blood_transfusion: formData.requires_blood_transfusion,
        tried_hormonal_treatment: formData.tried_hormonal_treatment,
        hormonal_treatment_effective: formData.hormonal_treatment_effective,
        tried_other_treatments: formData.tried_other_treatments,
        notes: formData.notes || null,
      };

      const { error } = await supabase
        .from('surgical_risk_assessment')
        .insert([payload]);
      
      if (error) throw error;

      Alert.alert('✅ Évaluation terminée', 'Votre score de risque a été calculé');
      setShowForm(false);
      loadAssessments();
    } catch (error) {
      console.error('Erreur sauvegarde évaluation:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setSaving(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: '#4CAF50',
      moderate: '#FF9800',
      high: '#FF5722',
      very_high: '#D32F2F',
    };
    return colors[level] || '#9E9E9E';
  };

  const getRiskLabel = (level) => {
    const labels = {
      low: 'Faible',
      moderate: 'Modéré',
      high: 'Élevé',
      very_high: 'Très élevé',
    };
    return labels[level] || level;
  };

  const toggleTreatment = (treatment) => {
    setFormData(prev => ({
      ...prev,
      tried_other_treatments: prev.tried_other_treatments.includes(treatment)
        ? prev.tried_other_treatments.filter(t => t !== treatment)
        : [...prev.tried_other_treatments, treatment],
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risque Opératoire</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Dernière évaluation */}
        {latestAssessment && !showForm && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Dernière évaluation</Text>
            <Text style={styles.resultDate}>{latestAssessment.assessment_date}</Text>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{latestAssessment.risk_score}</Text>
                <Text style={styles.scoreLabel}>/ 100</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text 
                  style={[
                    styles.riskLevel, 
                    { color: getRiskColor(latestAssessment.risk_level) }
                  ]}
                >
                  Risque {getRiskLabel(latestAssessment.risk_level)}
                </Text>
                {latestAssessment.consider_surgery && (
                  <View style={styles.surgeryBadge}>
                    <Ionicons name="warning" size={16} color="#FF5722" />
                    <Text style={styles.surgeryText}>Chirurgie à considérer</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Recommandation */}
            <View style={[
              styles.recommendationBox,
              { borderLeftColor: getRiskColor(latestAssessment.risk_level) }
            ]}>
              <Text style={styles.recommendationTitle}>📋 Recommandation</Text>
              <Text style={styles.recommendationText}>
                {latestAssessment.recommendation}
              </Text>
            </View>

            {/* Détails */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Facteurs de risque identifiés</Text>
              
              {latestAssessment.has_diabetes && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Diabète</Text>
                </View>
              )}
              
              {latestAssessment.has_hypertension && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Hypertension</Text>
                </View>
              )}
              
              {latestAssessment.has_cardiovascular_disease && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Maladie cardiovasculaire</Text>
                </View>
              )}
              
              {latestAssessment.has_coagulation_disorder && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Trouble de coagulation</Text>
                </View>
              )}
              
              {latestAssessment.has_anemia && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Anémie</Text>
                </View>
              )}
              
              {latestAssessment.is_smoker && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.factorText}>Tabagisme</Text>
                </View>
              )}
              
              {latestAssessment.hemorrhages_per_month > 3 && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#FF5722" />
                  <Text style={styles.factorText}>
                    Hémorragies fréquentes ({latestAssessment.hemorrhages_per_month}/mois)
                  </Text>
                </View>
              )}
              
              {latestAssessment.requires_blood_transfusion && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#D32F2F" />
                  <Text style={styles.factorText}>Nécessite des transfusions</Text>
                </View>
              )}
              
              {latestAssessment.quality_of_life_score < 3 && (
                <View style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
                  <Text style={styles.factorText}>
                    Impact majeur sur qualité de vie ({latestAssessment.quality_of_life_score}/10)
                  </Text>
                </View>
              )}
            </View>

            {/* Actions recommandées */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Actions recommandées</Text>
              
              {latestAssessment.risk_level === 'low' && (
                <Text style={styles.actionText}>
                  • Surveillance régulière de vos symptômes{'\n'}
                  • Suivi médical annuel{'\n'}
                  • Traitement conservateur adapté
                </Text>
              )}
              
              {latestAssessment.risk_level === 'moderate' && (
                <Text style={styles.actionText}>
                  • Optimiser les traitements médicaux{'\n'}
                  • Envisager DIU hormonal ou ablation endométriale{'\n'}
                  • Suivi gynécologique tous les 6 mois{'\n'}
                  • Bilan martial si anémie
                </Text>
              )}
              
              {(latestAssessment.risk_level === 'high' || latestAssessment.risk_level === 'very_high') && (
                <Text style={styles.actionText}>
                  • Consultation chirurgicale urgente{'\n'}
                  • Discuter des options : hystérectomie, embolisation{'\n'}
                  • Bilan pré-opératoire complet{'\n'}
                  • Support psychologique recommandé{'\n'}
                  • Évaluation de l'anémie et correction si besoin
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.newAssessmentButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.newAssessmentText}>Nouvelle évaluation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Formulaire */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Évaluation du risque</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formIntro}>
                Ce questionnaire permet d'évaluer la nécessité d'une intervention chirurgicale (hystérectomie) en cas d'hémorragies sévères ou récurrentes.
              </Text>

              {/* Informations de base */}
              <Text style={styles.sectionTitle}>Informations de base</Text>
              
              <Text style={styles.formLabel}>Âge *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Ex: 48"
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>IMC (kg/m²) *</Text>
              <TextInput
                style={styles.input}
                value={formData.bmi}
                onChangeText={(text) => setFormData({ ...formData, bmi: text })}
                placeholder="Ex: 24.5"
                keyboardType="decimal-pad"
              />

              {/* Comorbidités */}
              <Text style={styles.sectionTitle}>Antécédents médicaux</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Diabète</Text>
                <Switch
                  value={formData.has_diabetes}
                  onValueChange={(value) => setFormData({ ...formData, has_diabetes: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Hypertension</Text>
                <Switch
                  value={formData.has_hypertension}
                  onValueChange={(value) => setFormData({ ...formData, has_hypertension: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Maladie cardiovasculaire</Text>
                <Switch
                  value={formData.has_cardiovascular_disease}
                  onValueChange={(value) => setFormData({ ...formData, has_cardiovascular_disease: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Trouble de la coagulation</Text>
                <Switch
                  value={formData.has_coagulation_disorder}
                  onValueChange={(value) => setFormData({ ...formData, has_coagulation_disorder: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Anémie</Text>
                <Switch
                  value={formData.has_anemia}
                  onValueChange={(value) => setFormData({ ...formData, has_anemia: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Tabagisme actif</Text>
                <Switch
                  value={formData.is_smoker}
                  onValueChange={(value) => setFormData({ ...formData, is_smoker: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              {/* Hémorragies */}
              <Text style={styles.sectionTitle}>Hémorragies</Text>
              
              <Text style={styles.formLabel}>Nombre d'hémorragies par mois</Text>
              <TextInput
                style={styles.input}
                value={formData.hemorrhages_per_month}
                onChangeText={(text) => setFormData({ ...formData, hemorrhages_per_month: text })}
                placeholder="Ex: 2"
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Durée moyenne des saignements (jours)</Text>
              <TextInput
                style={styles.input}
                value={formData.average_flow_duration}
                onChangeText={(text) => setFormData({ ...formData, average_flow_duration: text })}
                placeholder="Ex: 8"
                keyboardType="numeric"
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Hémorragies récurrentes</Text>
                <Switch
                  value={formData.has_recurrent_hemorrhages}
                  onValueChange={(value) => setFormData({ ...formData, has_recurrent_hemorrhages: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              {/* Impact */}
              <Text style={styles.sectionTitle}>Impact sur la qualité de vie</Text>
              
              <Text style={styles.formLabel}>Qualité de vie globale (0 = très mauvais, 10 = excellent)</Text>
              <View style={styles.qualityScale}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.qualityButton,
                      formData.quality_of_life_score === score && styles.qualityButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, quality_of_life_score: score })}
                  >
                    <Text
                      style={[
                        styles.qualityButtonText,
                        formData.quality_of_life_score === score && styles.qualityButtonTextActive,
                      ]}
                    >
                      {score}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Affecte mon travail</Text>
                <Switch
                  value={formData.affects_work}
                  onValueChange={(value) => setFormData({ ...formData, affects_work: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Affecte mes relations</Text>
                <Switch
                  value={formData.affects_relationships}
                  onValueChange={(value) => setFormData({ ...formData, affects_relationships: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Nécessite des transfusions sanguines</Text>
                <Switch
                  value={formData.requires_blood_transfusion}
                  onValueChange={(value) => setFormData({ ...formData, requires_blood_transfusion: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              {/* Traitements essayés */}
              <Text style={styles.sectionTitle}>Traitements déjà essayés</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Traitement hormonal (THS)</Text>
                <Switch
                  value={formData.tried_hormonal_treatment}
                  onValueChange={(value) => setFormData({ ...formData, tried_hormonal_treatment: value })}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                />
              </View>

              {formData.tried_hormonal_treatment && (
                <View style={styles.subQuestion}>
                  <Text style={styles.formLabel}>Le traitement hormonal était-il efficace ?</Text>
                  <View style={styles.effectiveButtons}>
                    <TouchableOpacity
                      style={[
                        styles.effectiveButton,
                        formData.hormonal_treatment_effective === true && styles.effectiveButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, hormonal_treatment_effective: true })}
                    >
                      <Text style={styles.effectiveButtonText}>Oui</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.effectiveButton,
                        formData.hormonal_treatment_effective === false && styles.effectiveButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, hormonal_treatment_effective: false })}
                    >
                      <Text style={styles.effectiveButtonText}>Non</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.formLabel}>Autres traitements essayés</Text>
              {['DIU hormonal', 'Ablation endométriale', 'Embolisation', 'Antifibrinolytiques'].map((treatment) => (
                <TouchableOpacity
                  key={treatment}
                  style={styles.treatmentOption}
                  onPress={() => toggleTreatment(treatment)}
                >
                  <Ionicons
                    name={formData.tried_other_treatments.includes(treatment) ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.treatmentText}>{treatment}</Text>
                </TouchableOpacity>
              ))}

              {/* Notes */}
              <Text style={styles.formLabel}>Notes complémentaires</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Autres informations pertinentes..."
                multiline
                numberOfLines={3}
              />

              {/* Bouton sauvegarder */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveAssessment}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Calculer mon risque</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Empty state */}
        {assessments.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Aucune évaluation</Text>
            <Text style={styles.emptyText}>
              Ce calculateur permet d'évaluer si une intervention chirurgicale (hystérectomie) doit être envisagée en cas d'hémorragies sévères.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyButtonText}>Faire une évaluation</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  scoreInfo: {
    marginLeft: 20,
    flex: 1,
  },
  riskLevel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  surgeryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 8,
    borderRadius: 8,
  },
  surgeryText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
    marginLeft: 6,
  },
  recommendationBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  actionsSection: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 22,
  },
  newAssessmentButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newAssessmentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  formIntro: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  qualityScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  qualityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  qualityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  qualityButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  qualityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  subQuestion: {
    marginLeft: 20,
    marginTop: 8,
  },
  effectiveButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  effectiveButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  effectiveButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  effectiveButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  treatmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  treatmentText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
