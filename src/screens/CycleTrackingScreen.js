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
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function CycleTrackingScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Données du calendrier
  const [cycles, setCycles] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Formulaire (sans period_end_date)
  const [formData, setFormData] = useState({
    period_start_date: new Date().toISOString().split('T')[0],
    flow_intensity: 'moderate',
    has_clots: false,
    clot_size: null,
    pain_level: 0,
    cramping_severity: 'none',
    affects_daily_life: false,
    missed_work: false,
    notes: '',
  });
  
  // Alertes actives
  const [alerts, setAlerts] = useState([]);
  
  // Prévision
  const [nextPeriodDate, setNextPeriodDate] = useState(null);
  const [avgCycleLength, setAvgCycleLength] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadCycles();
    }
  }, [user]);

  useEffect(() => {
    updateMarkedDates();
  }, [cycles]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const loadCycles = async () => {
    try {
      setLoading(true);
      
      // Charger les 90 derniers jours
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('period_start_date', { ascending: false });

      if (error) throw error;

      setCycles(data || []);
      
      // Extraire les alertes
      const urgentCycles = (data || []).filter(c => c.requires_urgent_attention);
      setAlerts(urgentCycles);
      
      // Calculer la prévision
      if (data && data.length > 0) {
        const cyclesWithLength = data.filter(c => c.cycle_length && c.cycle_length > 0);
        if (cyclesWithLength.length > 0) {
          const avg = cyclesWithLength.reduce((sum, c) => sum + c.cycle_length, 0) / cyclesWithLength.length;
          setAvgCycleLength(Math.round(avg));
          
          // Prévoir la prochaine date
          const lastPeriod = new Date(data[0].period_start_date);
          const nextDate = new Date(lastPeriod);
          nextDate.setDate(nextDate.getDate() + Math.round(avg));
          setNextPeriodDate(nextDate.toISOString().split('T')[0]);
        }
      }
      
    } catch (error) {
      console.error('Erreur chargement cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = () => {
    const marked = {};
    
    cycles.forEach(cycle => {
      const startDate = cycle.period_start_date;
      const endDate = cycle.period_end_date;
      
      // Couleur selon intensité
      let color = COLORS.primary;
      if (cycle.flow_intensity === 'light') color = '#FFC0CB'; // Rose clair
      if (cycle.flow_intensity === 'moderate') color = COLORS.primary; // Rose normal
      if (cycle.flow_intensity === 'heavy') color = '#C71585'; // Rose foncé
      if (cycle.flow_intensity === 'hemorrhage') color = '#8B0000'; // Rouge sang

      // Marquer la date de début
      marked[startDate] = {
        selected: true,
        selectedColor: color,
        marked: cycle.requires_urgent_attention,
        dotColor: '#FF0000',
      };
    });
    
    // Ajouter la prévision
    if (nextPeriodDate) {
      marked[nextPeriodDate] = {
        marked: true,
        dotColor: COLORS.primary,
        textColor: COLORS.primary,
      };
    }

    setMarkedDates(marked);
  };

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
    
    // Vérifier si un cycle existe déjà pour cette date
    const existingCycle = cycles.find(c => 
      c.period_start_date === day.dateString || 
      (c.period_end_date && day.dateString >= c.period_start_date && day.dateString <= c.period_end_date)
    );

    if (existingCycle) {
      // Éditer le cycle existant
      setFormData({
        id: existingCycle.id,
        period_start_date: existingCycle.period_start_date,
        period_end_date: existingCycle.period_end_date || '',
        flow_intensity: existingCycle.flow_intensity,
        has_clots: existingCycle.has_clots,
        clot_size: existingCycle.clot_size,
        pain_level: existingCycle.pain_level,
        cramping_severity: existingCycle.cramping_severity,
        affects_daily_life: existingCycle.affects_daily_life,
        missed_work: existingCycle.missed_work,
        notes: existingCycle.notes || '',
      });
    } else {
      // Nouveau cycle
      setFormData({
        period_start_date: day.dateString,
        period_end_date: '',
        flow_intensity: 'moderate',
        has_clots: false,
        clot_size: null,
        pain_level: 0,
        cramping_severity: 'none',
        affects_daily_life: false,
        missed_work: false,
        notes: '',
      });
    }

    setShowForm(true);
  };

  const saveCycle = async () => {
    try {
      setSaving(true);

      const payload = {
        user_id: user.id,
        period_start_date: formData.period_start_date,
        period_end_date: formData.period_end_date || null,
        flow_intensity: formData.flow_intensity,
        has_clots: formData.has_clots,
        clot_size: formData.has_clots ? formData.clot_size : null,
        pain_level: formData.pain_level,
        cramping_severity: formData.cramping_severity,
        affects_daily_life: formData.affects_daily_life,
        missed_work: formData.missed_work,
        notes: formData.notes,
      };

      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('menstrual_cycles')
          .update(payload)
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('menstrual_cycles')
          .insert([payload]);
        
        if (error) throw error;
      }

      Alert.alert('✅ Enregistré', 'Cycle menstruel enregistré avec succès');
      setShowForm(false);
      loadCycles(); // Recharger les données
    } catch (error) {
      console.error('Erreur sauvegarde cycle:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCycle = async () => {
    if (!formData.id) return;

    Alert.alert(
      'Supprimer ce cycle ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('menstrual_cycles')
                .delete()
                .eq('id', formData.id);
              
              if (error) throw error;

              Alert.alert('✅ Supprimé', 'Cycle supprimé');
              setShowForm(false);
              loadCycles();
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const getFlowLabel = (intensity) => {
    const labels = {
      light: 'Léger',
      moderate: 'Modéré',
      heavy: 'Abondant',
      hemorrhage: '🚨 Hémorragie',
    };
    return labels[intensity] || intensity;
  };

  const getCycleSummary = () => {
    if (cycles.length === 0) return null;

    const recentCycles = cycles.slice(0, 3);
    const avgCycleLength = recentCycles
      .filter(c => c.cycle_length)
      .reduce((sum, c) => sum + c.cycle_length, 0) / recentCycles.filter(c => c.cycle_length).length;

    const lastPeriod = cycles[0];
    const daysSinceLastPeriod = lastPeriod 
      ? Math.floor((new Date() - new Date(lastPeriod.period_start_date)) / (1000 * 60 * 60 * 24))
      : null;

    return {
      avgCycleLength: avgCycleLength ? Math.round(avgCycleLength) : null,
      daysSinceLastPeriod,
      lastPeriodDate: lastPeriod?.period_start_date,
    };
  };

  const summary = getCycleSummary();

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
        <Text style={styles.headerTitle}>Suivi Menstruel</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Alertes urgentes */}
        {alerts.length > 0 && (
          <View style={styles.alertContainer}>
            <Ionicons name="warning" size={24} color="#FF0000" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>⚠️ Alerte médicale</Text>
              {alerts.map((alert, idx) => (
                <Text key={idx} style={styles.alertText}>{alert.alert_reason}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Résumé */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Mon cycle</Text>
            {summary.daysSinceLastPeriod !== null && (
              <Text style={styles.summaryText}>
                Dernières règles : il y a {summary.daysSinceLastPeriod} jours
              </Text>
            )}
            {summary.avgCycleLength && (
              <Text style={styles.summaryText}>
                Durée moyenne du cycle : {summary.avgCycleLength} jours
              </Text>
            )}
            {nextPeriodDate && (
              <Text style={[styles.summaryText, { color: COLORS.primary, fontWeight: '600' }]}>
                📅 Prochaines règles prévues : {new Date(nextPeriodDate).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </Text>
            )}
          </View>
        )}

        {/* Légende */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Légende</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC0CB' }]} />
            <Text style={styles.legendText}>Léger</Text>
            <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Modéré</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#C71585' }]} />
            <Text style={styles.legendText}>Abondant</Text>
            <View style={[styles.legendColor, { backgroundColor: '#8B0000' }]} />
            <Text style={styles.legendText}>Hémorragie</Text>
          </View>
        </View>

        {/* Calendrier */}
        <View style={styles.calendarCard}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDatePress}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: COLORS.text,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              textDisabledColor: '#d9e1e8',
              monthTextColor: COLORS.text,
              arrowColor: COLORS.primary,
            }}
          />
        </View>

        {/* Formulaire modal */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {formData.id ? 'Modifier le cycle' : 'Nouveau cycle'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Date début */}
            <Text style={styles.formLabel}>Date de début</Text>
            <Text style={styles.formValue}>{formData.period_start_date}</Text>

            {/* Intensité du flux */}
            <Text style={styles.formLabel}>Intensité du flux</Text>
            <View style={styles.flowButtons}>
              {['light', 'moderate', 'heavy', 'hemorrhage'].map((intensity) => (
                <TouchableOpacity
                  key={intensity}
                  style={[
                    styles.flowButton,
                    formData.flow_intensity === intensity && styles.flowButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, flow_intensity: intensity })}
                >
                  <Text
                    style={[
                      styles.flowButtonText,
                      formData.flow_intensity === intensity && styles.flowButtonTextActive,
                    ]}
                  >
                    {getFlowLabel(intensity)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Caillots */}
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Présence de caillots</Text>
              <Switch
                value={formData.has_clots}
                onValueChange={(value) => setFormData({ ...formData, has_clots: value })}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>

            {formData.has_clots && (
              <>
                <Text style={styles.formLabel}>Taille des caillots</Text>
                <View style={styles.flowButtons}>
                  {['small', 'medium', 'large'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.flowButton,
                        formData.clot_size === size && styles.flowButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, clot_size: size })}
                    >
                      <Text
                        style={[
                          styles.flowButtonText,
                          formData.clot_size === size && styles.flowButtonTextActive,
                        ]}
                      >
                        {size === 'small' ? 'Petits' : size === 'medium' ? 'Moyens' : 'Gros'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Douleur */}
            <Text style={styles.formLabel}>Niveau de douleur (0-10)</Text>
            <View style={styles.painScale}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.painButton,
                    formData.pain_level === level && styles.painButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, pain_level: level })}
                >
                  <Text
                    style={[
                      styles.painButtonText,
                      formData.pain_level === level && styles.painButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Impact */}
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Affecte ma vie quotidienne</Text>
              <Switch
                value={formData.affects_daily_life}
                onValueChange={(value) => setFormData({ ...formData, affects_daily_life: value })}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Absence travail</Text>
              <Switch
                value={formData.missed_work}
                onValueChange={(value) => setFormData({ ...formData, missed_work: value })}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </View>

            {/* Notes */}
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Autres symptômes, observations..."
              multiline
              numberOfLines={3}
            />

            {/* Boutons */}
            <View style={styles.formButtons}>
              {formData.id && (
                <TouchableOpacity
                  style={[styles.formButton, styles.deleteButton]}
                  onPress={deleteCycle}
                  disabled={saving}
                >
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={saveCycle}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Liste des cycles récents */}
        {cycles.length > 0 && !showForm && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Historique récent</Text>
            {cycles.slice(0, 5).map((cycle) => (
              <TouchableOpacity
                key={cycle.id}
                style={styles.historyItem}
                onPress={() => {
                  setFormData({
                    id: cycle.id,
                    period_start_date: cycle.period_start_date,
                    period_end_date: cycle.period_end_date || '',
                    flow_intensity: cycle.flow_intensity,
                    has_clots: cycle.has_clots,
                    clot_size: cycle.clot_size,
                    pain_level: cycle.pain_level,
                    cramping_severity: cycle.cramping_severity,
                    affects_daily_life: cycle.affects_daily_life,
                    missed_work: cycle.missed_work,
                    notes: cycle.notes || '',
                  });
                  setShowForm(true);
                }}
              >
                <View>
                  <Text style={styles.historyDate}>{cycle.period_start_date}</Text>
                  <Text style={styles.historyDetail}>
                    {getFlowLabel(cycle.flow_intensity)}
                    {cycle.cycle_length && ` • Cycle: ${cycle.cycle_length}j`}
                    {cycle.requires_urgent_attention && ' • ⚠️ Alerte'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
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
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFE5E5',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B0000',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#8B0000',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  legendCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 16,
  },
  calendarCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
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
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  formValue: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
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
  flowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  flowButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  flowButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  flowButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  flowButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  painScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  painButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  painButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  painButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  painButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
});
