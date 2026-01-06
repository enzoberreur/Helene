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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function HormoneTrackingScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [tests, setTests] = useState([]);
  const [latestTest, setLatestTest] = useState(null);
  
  const [formData, setFormData] = useState({
    test_date: new Date().toISOString().split('T')[0],
    test_type: 'blood',
    estrogen_pg_ml: '',
    progesterone_ng_ml: '',
    fsh_mui_ml: '',
    lh_mui_ml: '',
    testosterone_ng_dl: '',
    thyroid_tsh: '',
    vitamin_d_ng_ml: '',
    doctor_name: '',
    lab_name: '',
    notes: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTests();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('hormone_levels')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (error) throw error;

      setTests(data || []);
      if (data && data.length > 0) {
        setLatestTest(data[0]);
      }
      
    } catch (error) {
      console.error('Erreur chargement tests hormonaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.test_date) {
        Alert.alert('Erreur', 'La date du test est obligatoire');
        return;
      }

      const payload = {
        user_id: user.id,
        test_date: formData.test_date,
        test_type: formData.test_type,
        estrogen_pg_ml: formData.estrogen_pg_ml ? parseFloat(formData.estrogen_pg_ml) : null,
        progesterone_ng_ml: formData.progesterone_ng_ml ? parseFloat(formData.progesterone_ng_ml) : null,
        fsh_mui_ml: formData.fsh_mui_ml ? parseFloat(formData.fsh_mui_ml) : null,
        lh_mui_ml: formData.lh_mui_ml ? parseFloat(formData.lh_mui_ml) : null,
        testosterone_ng_dl: formData.testosterone_ng_dl ? parseFloat(formData.testosterone_ng_dl) : null,
        thyroid_tsh: formData.thyroid_tsh ? parseFloat(formData.thyroid_tsh) : null,
        vitamin_d_ng_ml: formData.vitamin_d_ng_ml ? parseFloat(formData.vitamin_d_ng_ml) : null,
        doctor_name: formData.doctor_name || null,
        lab_name: formData.lab_name || null,
        notes: formData.notes || null,
      };

      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('hormone_levels')
          .update(payload)
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('hormone_levels')
          .insert([payload]);
        
        if (error) throw error;
      }

      Alert.alert('✅ Enregistré', 'Test hormonal enregistré avec succès');
      setShowForm(false);
      resetForm();
      loadTests();
    } catch (error) {
      console.error('Erreur sauvegarde test:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async () => {
    if (!formData.id) return;

    Alert.alert(
      'Supprimer ce test ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('hormone_levels')
                .delete()
                .eq('id', formData.id);
              
              if (error) throw error;

              Alert.alert('✅ Supprimé', 'Test supprimé');
              setShowForm(false);
              resetForm();
              loadTests();
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      test_date: new Date().toISOString().split('T')[0],
      test_type: 'blood',
      estrogen_pg_ml: '',
      progesterone_ng_ml: '',
      fsh_mui_ml: '',
      lh_mui_ml: '',
      testosterone_ng_dl: '',
      thyroid_tsh: '',
      vitamin_d_ng_ml: '',
      doctor_name: '',
      lab_name: '',
      notes: '',
    });
  };

  const getInterpretation = (hormone, value) => {
    if (!value) return null;

    const interpretations = {
      estrogen_pg_ml: {
        normal: [15, 350],
        label: 'Estradiol',
        unit: 'pg/mL',
        postMenopause: value < 20 ? 'Post-ménopause' : 'Pré/Périménopause',
      },
      fsh_mui_ml: {
        normal: [1, 25],
        label: 'FSH',
        unit: 'mUI/mL',
        postMenopause: value > 30 ? 'Ménopause confirmée' : value > 25 ? 'Transition ménopausique' : 'Normal',
      },
      progesterone_ng_ml: {
        normal: [0.1, 25],
        label: 'Progestérone',
        unit: 'ng/mL',
      },
      thyroid_tsh: {
        normal: [0.4, 4.5],
        label: 'TSH',
        unit: 'mUI/L',
        alert: value < 0.4 ? 'Hyperthyroïdie possible' : value > 4.5 ? 'Hypothyroïdie possible' : null,
      },
      vitamin_d_ng_ml: {
        normal: [30, 100],
        label: 'Vitamine D',
        unit: 'ng/mL',
        alert: value < 30 ? 'Carence - Supplémentation recommandée' : null,
      },
    };

    const info = interpretations[hormone];
    if (!info) return null;

    const isNormal = value >= info.normal[0] && value <= info.normal[1];
    
    return {
      ...info,
      isNormal,
      value,
      status: isNormal ? '✅ Normal' : '⚠️ Anormal',
    };
  };

  const getChartData = (hormone) => {
    const relevantTests = tests
      .filter(t => t[hormone] !== null)
      .reverse() // Ordre chronologique
      .slice(-6); // 6 derniers tests

    if (relevantTests.length === 0) return null;

    return {
      labels: relevantTests.map(t => {
        const date = new Date(t.test_date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        data: relevantTests.map(t => parseFloat(t[hormone])),
      }],
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const estrogenChart = getChartData('estrogen_pg_ml');
  const fshChart = getChartData('fsh_mui_ml');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Taux Hormonaux</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Dernier test */}
        {latestTest && !showForm && (
          <View style={styles.latestTestCard}>
            <View style={styles.latestTestHeader}>
              <Text style={styles.latestTestTitle}>📊 Dernier test</Text>
              <Text style={styles.latestTestDate}>{latestTest.test_date}</Text>
            </View>

            {/* Recommandation automatique */}
            {latestTest.treatment_recommendation && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>
                  {latestTest.needs_treatment ? '⚠️ Recommandation' : 'ℹ️ Information'}
                </Text>
                <Text style={styles.recommendationText}>
                  {latestTest.treatment_recommendation}
                </Text>
              </View>
            )}

            {/* Stade détecté */}
            {latestTest.menopause_stage_detected && (
              <View style={styles.stageBox}>
                <Text style={styles.stageLabel}>Stade détecté :</Text>
                <Text style={styles.stageValue}>
                  {latestTest.menopause_stage_detected === 'pre' && 'Pré-ménopause'}
                  {latestTest.menopause_stage_detected === 'peri' && 'Périménopause'}
                  {latestTest.menopause_stage_detected === 'meno' && 'Ménopause'}
                  {latestTest.menopause_stage_detected === 'post' && 'Post-ménopause'}
                </Text>
              </View>
            )}

            {/* Valeurs */}
            <View style={styles.valuesGrid}>
              {latestTest.estrogen_pg_ml && (
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Estradiol</Text>
                  <Text style={styles.valueNumber}>{latestTest.estrogen_pg_ml}</Text>
                  <Text style={styles.valueUnit}>pg/mL</Text>
                  {getInterpretation('estrogen_pg_ml', latestTest.estrogen_pg_ml)?.postMenopause && (
                    <Text style={styles.valueStatus}>
                      {getInterpretation('estrogen_pg_ml', latestTest.estrogen_pg_ml).postMenopause}
                    </Text>
                  )}
                </View>
              )}

              {latestTest.fsh_mui_ml && (
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>FSH</Text>
                  <Text style={styles.valueNumber}>{latestTest.fsh_mui_ml}</Text>
                  <Text style={styles.valueUnit}>mUI/mL</Text>
                  {getInterpretation('fsh_mui_ml', latestTest.fsh_mui_ml)?.postMenopause && (
                    <Text style={styles.valueStatus}>
                      {getInterpretation('fsh_mui_ml', latestTest.fsh_mui_ml).postMenopause}
                    </Text>
                  )}
                </View>
              )}

              {latestTest.progesterone_ng_ml && (
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Progestérone</Text>
                  <Text style={styles.valueNumber}>{latestTest.progesterone_ng_ml}</Text>
                  <Text style={styles.valueUnit}>ng/mL</Text>
                </View>
              )}

              {latestTest.thyroid_tsh && (
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>TSH</Text>
                  <Text style={styles.valueNumber}>{latestTest.thyroid_tsh}</Text>
                  <Text style={styles.valueUnit}>mUI/L</Text>
                  {getInterpretation('thyroid_tsh', latestTest.thyroid_tsh)?.alert && (
                    <Text style={styles.valueAlert}>
                      {getInterpretation('thyroid_tsh', latestTest.thyroid_tsh).alert}
                    </Text>
                  )}
                </View>
              )}

              {latestTest.vitamin_d_ng_ml && (
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Vitamine D</Text>
                  <Text style={styles.valueNumber}>{latestTest.vitamin_d_ng_ml}</Text>
                  <Text style={styles.valueUnit}>ng/mL</Text>
                  {getInterpretation('vitamin_d_ng_ml', latestTest.vitamin_d_ng_ml)?.alert && (
                    <Text style={styles.valueAlert}>
                      {getInterpretation('vitamin_d_ng_ml', latestTest.vitamin_d_ng_ml).alert}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Graphiques d'évolution */}
        {estrogenChart && !showForm && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📈 Évolution Estradiol</Text>
            <LineChart
              data={estrogenChart}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(232, 62, 115, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(31, 31, 31, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {fshChart && !showForm && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📈 Évolution FSH</Text>
            <LineChart
              data={fshChart}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(232, 62, 115, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(31, 31, 31, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Formulaire */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {formData.id ? 'Modifier le test' : 'Nouveau test'}
              </Text>
              <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Date */}
              <Text style={styles.formLabel}>Date du test *</Text>
              <TextInput
                style={styles.input}
                value={formData.test_date}
                onChangeText={(text) => setFormData({ ...formData, test_date: text })}
                placeholder="YYYY-MM-DD"
              />

              {/* Type de test */}
              <Text style={styles.formLabel}>Type de test</Text>
              <View style={styles.testTypeButtons}>
                {[
                  { value: 'blood', label: 'Sanguin' },
                  { value: 'saliva', label: 'Salivaire' },
                  { value: 'urine', label: 'Urinaire' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.testTypeButton,
                      formData.test_type === type.value && styles.testTypeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, test_type: type.value })}
                  >
                    <Text
                      style={[
                        styles.testTypeButtonText,
                        formData.test_type === type.value && styles.testTypeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hormones principales */}
              <Text style={styles.sectionTitle}>Hormones sexuelles</Text>
              
              <Text style={styles.formLabel}>Estradiol (pg/mL)</Text>
              <TextInput
                style={styles.input}
                value={formData.estrogen_pg_ml}
                onChangeText={(text) => setFormData({ ...formData, estrogen_pg_ml: text })}
                placeholder="Ex: 25.5"
                keyboardType="decimal-pad"
              />
              <Text style={styles.referenceText}>Référence: 15-350 pré-ménopause, &lt;20 post-ménopause</Text>

              <Text style={styles.formLabel}>FSH (mUI/mL)</Text>
              <TextInput
                style={styles.input}
                value={formData.fsh_mui_ml}
                onChangeText={(text) => setFormData({ ...formData, fsh_mui_ml: text })}
                placeholder="Ex: 42.3"
                keyboardType="decimal-pad"
              />
              <Text style={styles.referenceText}>Référence: &gt;25-30 = ménopause</Text>

              <Text style={styles.formLabel}>Progestérone (ng/mL)</Text>
              <TextInput
                style={styles.input}
                value={formData.progesterone_ng_ml}
                onChangeText={(text) => setFormData({ ...formData, progesterone_ng_ml: text })}
                placeholder="Ex: 0.8"
                keyboardType="decimal-pad"
              />

              <Text style={styles.formLabel}>LH (mUI/mL)</Text>
              <TextInput
                style={styles.input}
                value={formData.lh_mui_ml}
                onChangeText={(text) => setFormData({ ...formData, lh_mui_ml: text })}
                placeholder="Ex: 15.2"
                keyboardType="decimal-pad"
              />

              <Text style={styles.formLabel}>Testostérone (ng/dL)</Text>
              <TextInput
                style={styles.input}
                value={formData.testosterone_ng_dl}
                onChangeText={(text) => setFormData({ ...formData, testosterone_ng_dl: text })}
                placeholder="Ex: 35"
                keyboardType="decimal-pad"
              />
              <Text style={styles.referenceText}>Référence femme: 15-70 ng/dL</Text>

              {/* Autres marqueurs */}
              <Text style={styles.sectionTitle}>Autres marqueurs</Text>

              <Text style={styles.formLabel}>TSH (mUI/L)</Text>
              <TextInput
                style={styles.input}
                value={formData.thyroid_tsh}
                onChangeText={(text) => setFormData({ ...formData, thyroid_tsh: text })}
                placeholder="Ex: 2.5"
                keyboardType="decimal-pad"
              />
              <Text style={styles.referenceText}>Référence: 0.4-4.5 mUI/L</Text>

              <Text style={styles.formLabel}>Vitamine D (ng/mL)</Text>
              <TextInput
                style={styles.input}
                value={formData.vitamin_d_ng_ml}
                onChangeText={(text) => setFormData({ ...formData, vitamin_d_ng_ml: text })}
                placeholder="Ex: 35"
                keyboardType="decimal-pad"
              />
              <Text style={styles.referenceText}>Référence: &gt;30 ng/mL</Text>

              {/* Informations complémentaires */}
              <Text style={styles.sectionTitle}>Informations complémentaires</Text>

              <Text style={styles.formLabel}>Médecin prescripteur</Text>
              <TextInput
                style={styles.input}
                value={formData.doctor_name}
                onChangeText={(text) => setFormData({ ...formData, doctor_name: text })}
                placeholder="Dr. Dupont"
              />

              <Text style={styles.formLabel}>Laboratoire</Text>
              <TextInput
                style={styles.input}
                value={formData.lab_name}
                onChangeText={(text) => setFormData({ ...formData, lab_name: text })}
                placeholder="Laboratoire central"
              />

              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Observations, contexte du test..."
                multiline
                numberOfLines={3}
              />

              {/* Boutons */}
              <View style={styles.formButtons}>
                {formData.id && (
                  <TouchableOpacity
                    style={[styles.formButton, styles.deleteButton]}
                    onPress={deleteTest}
                    disabled={saving}
                  >
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.formButton, styles.saveButton]}
                  onPress={saveTest}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Historique */}
        {tests.length > 1 && !showForm && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Historique des tests</Text>
            {tests.slice(1).map((test) => (
              <TouchableOpacity
                key={test.id}
                style={styles.historyItem}
                onPress={() => {
                  setFormData({
                    id: test.id,
                    test_date: test.test_date,
                    test_type: test.test_type,
                    estrogen_pg_ml: test.estrogen_pg_ml?.toString() || '',
                    progesterone_ng_ml: test.progesterone_ng_ml?.toString() || '',
                    fsh_mui_ml: test.fsh_mui_ml?.toString() || '',
                    lh_mui_ml: test.lh_mui_ml?.toString() || '',
                    testosterone_ng_dl: test.testosterone_ng_dl?.toString() || '',
                    thyroid_tsh: test.thyroid_tsh?.toString() || '',
                    vitamin_d_ng_ml: test.vitamin_d_ng_ml?.toString() || '',
                    doctor_name: test.doctor_name || '',
                    lab_name: test.lab_name || '',
                    notes: test.notes || '',
                  });
                  setShowForm(true);
                }}
              >
                <View>
                  <Text style={styles.historyDate}>{test.test_date}</Text>
                  <Text style={styles.historyDetail}>
                    {test.estrogen_pg_ml && `Estradiol: ${test.estrogen_pg_ml} pg/mL`}
                    {test.fsh_mui_ml && ` • FSH: ${test.fsh_mui_ml} mUI/mL`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty state */}
        {tests.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Aucun test enregistré</Text>
            <Text style={styles.emptyText}>
              Ajoutez vos résultats de tests hormonaux pour suivre leur évolution et recevoir des recommandations personnalisées.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyButtonText}>Ajouter un test</Text>
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
  latestTestCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  latestTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  latestTestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  latestTestDate: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  recommendationBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  stageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  stageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
  },
  valueLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  valueNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  valueUnit: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  valueStatus: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  valueAlert: {
    fontSize: 11,
    color: '#FF5722',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 12,
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
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
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
  referenceText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  testTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  testTypeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  testTypeButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  testTypeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginRight: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
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
