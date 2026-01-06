import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { generateWeeklyInsights } from '../utils/insightsGenerator';
import { hapticFeedback } from '../utils/hapticFeedback';
import BottomSheet from '../components/BottomSheet';

export default function HomeScreen({ navigation }) {
  const { t, language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgMood: 0,
    avgSleep: 0,
    totalLogs: 0,
    topSymptom: null,
  });
  const [insights, setInsights] = useState([]);
  
  // État pour le calendrier menstruel
  const [cycles, setCycles] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [nextPeriodDate, setNextPeriodDate] = useState(null);
  const [avgCycleLength, setAvgCycleLength] = useState(null);
  
  // État pour le bottom sheet
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  // Animations pour empty state
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    loadCycles();
    
    // Animation pour empty state
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger 14 jours pour comparer les semaines
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw error;

      if (logs && logs.length > 0) {
        const currentWeekLogs = logs.slice(0, 7);
        const avgMood = currentWeekLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / currentWeekLogs.length;
        const avgSleep = currentWeekLogs.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / currentWeekLogs.length;

        const symptomCounts = {};
        const symptoms = ['hot_flashes', 'night_sweats', 'headaches', 'joint_pain', 'fatigue', 'anxiety', 'irritability', 'brain_fog', 'low_mood'];
        
        currentWeekLogs.forEach(log => {
          symptoms.forEach(symptom => {
            if (log[symptom] && log[symptom] > 0) {
              symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            }
          });
        });

        const topSymptom = Object.keys(symptomCounts).length > 0
          ? Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0][0]
          : null;

        setStats({
          avgMood: avgMood.toFixed(1),
          avgSleep: avgSleep.toFixed(1),
          totalLogs: currentWeekLogs.length,
          topSymptom,
        });

        // Générer les insights
        const weeklyInsights = generateWeeklyInsights(logs, language);
        setInsights(weeklyInsights);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSymptomLabel = (symptom) => {
    const labels = t?.home?.symptomLabels || {};
    return labels[symptom] || symptom;
  };

  const getMoodIcon = (mood) => {
    const moodValue = parseFloat(mood);
    if (moodValue >= 4.5) return { name: 'happy', color: COLORS.success };
    if (moodValue >= 3.5) return { name: 'happy-outline', color: COLORS.primary };
    if (moodValue >= 2.5) return { name: 'remove-circle-outline', color: COLORS.warning };
    if (moodValue >= 1.5) return { name: 'sad-outline', color: COLORS.warning };
    return { name: 'sad', color: COLORS.error };
  };

  const getSleepIcon = (sleep) => {
    const sleepValue = parseFloat(sleep);
    if (sleepValue >= 8) return { name: 'moon', color: COLORS.primary };
    if (sleepValue >= 6) return { name: 'moon-outline', color: COLORS.primary };
    if (sleepValue >= 4) return { name: 'partly-sunny-outline', color: COLORS.warning };
    return { name: 'alert-circle-outline', color: COLORS.error };
  };

  // Fonction pour charger les cycles menstruels
  const loadCycles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('period_start_date', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        setCycles(data);
        
        // Calculer la moyenne des cycles
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
        
        // Marquer les dates sur le calendrier
        const marked = {};
        data.forEach(cycle => {
          const startDate = cycle.period_start_date;
          let color = COLORS.primary;
          
          if (cycle.flow_intensity === 'light') color = '#FFC0CB';
          if (cycle.flow_intensity === 'moderate') color = COLORS.primary;
          if (cycle.flow_intensity === 'heavy') color = '#C71585';
          if (cycle.flow_intensity === 'hemorrhage') color = '#8B0000';

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
            customStyles: {
              container: {
                borderWidth: 2,
                borderColor: COLORS.primary,
                borderStyle: 'dashed',
              },
            },
          };
        }
        
        setMarkedDates(marked);
      }
    } catch (error) {
      console.error('Erreur chargement cycles:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              hapticFeedback.light();
              setIsBottomSheetVisible(true);
            }}
          >
            <Ionicons name="menu" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{t.home.hello}</Text>
            <Text style={styles.subtitle}>{t.home.headerSubtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('profile')}
          >
            <Ionicons name="person-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Action principale */}
        <View style={styles.mainSection}>
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => {
              hapticFeedback.medium();
              navigation.navigate('checkin');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.primaryCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="create-outline" size={22} color={COLORS.primary} />
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.primaryCardTitle}>{t.home.dailyCheckIn}</Text>
            <Text style={styles.primaryCardSubtitle}>
              {t.home.dailyCheckInSubtitle}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendrier Menstruel */}
        {cycles.length > 0 && (
          <View style={styles.calendarSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Calendrier Menstruel</Text>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  navigation.navigate('cycleTracking');
                }}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>Gérer</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Prévision */}
            {nextPeriodDate && avgCycleLength && (
              <View style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.predictionTitle}>Prochaines règles prévues</Text>
                </View>
                <Text style={styles.predictionDate}>
                  {new Date(nextPeriodDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
                <Text style={styles.predictionSubtitle}>
                  Cycle moyen : {avgCycleLength} jours
                </Text>
              </View>
            )}

            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={markedDates}
                markingType={'simple'}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: COLORS.text,
                  selectedDayBackgroundColor: COLORS.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: COLORS.primary,
                  dayTextColor: COLORS.text,
                  textDisabledColor: COLORS.gray[300],
                  monthTextColor: COLORS.text,
                  arrowColor: COLORS.primary,
                }}
                style={styles.calendar}
              />
              
              {/* Légende */}
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFC0CB' }]} />
                  <Text style={styles.legendText}>Léger</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>Modéré</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#C71585' }]} />
                  <Text style={styles.legendText}>Abondant</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
                  <Text style={styles.legendText}>Hémorragie</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <View style={styles.statsSectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.thisWeek}</Text>
            {stats.totalLogs > 0 && (
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.light();
                  navigation.navigate('trends');
                }}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>{t.home.viewMore}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {stats.totalLogs === 0 ? (
            <Animated.View 
              style={[
                styles.emptyState,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: bounceAnim }]
                }
              ]}
            >
              <View style={styles.emptyStateIconContainer}>
                <View style={styles.emptyStateIconCircle}>
                  <Ionicons name="rocket" size={48} color={COLORS.primary} />
                </View>
              </View>
              <Text style={styles.emptyStateTitle}>{t.home.emptyTitle}</Text>
              <Text style={styles.emptyStateText}>
                {t.home.emptyDescription}
              </Text>
              <TouchableOpacity
                style={styles.emptyStateCTA}
                onPress={() => {
                  hapticFeedback.medium();
                  navigation.navigate('checkin');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyStateCTAText}>{t.home.startCheckIn}</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons 
                    name={getMoodIcon(stats.avgMood).name} 
                    size={32} 
                    color={getMoodIcon(stats.avgMood).color} 
                  />
                  <Text style={styles.statValue}>{stats.avgMood}</Text>
                  <Text style={styles.statLabel}>{t.home.stats.mood}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons 
                    name={getSleepIcon(stats.avgSleep).name} 
                    size={32} 
                    color={getSleepIcon(stats.avgSleep).color} 
                  />
                  <Text style={styles.statValue}>{stats.avgSleep}</Text>
                  <Text style={styles.statLabel}>{t.home.stats.sleep}</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={32} color={COLORS.primary} />
                  <Text style={styles.statValue}>{stats.totalLogs}</Text>
                  <Text style={styles.statLabel}>{t.home.stats.days}</Text>
                </View>
              </View>

              {/* Insights automatiques */}
              {insights.length > 0 && (
                <View style={styles.insightsContainer}>
                  <Text style={styles.sectionLabel}>{t.home.weeklyInsightsTitle}</Text>
                  <View style={styles.groupContainer}>
                    {insights.map((insight, index) => (
                      <View
                        key={insight.id}
                        style={[
                          styles.groupRow,
                          index !== insights.length - 1 && styles.groupRowDivider,
                        ]}
                      >
                        <View style={styles.rowIconBadge}>
                          <Ionicons
                            name={insight.icon}
                            size={18}
                            color={
                              insight.type === 'positive' ? COLORS.success :
                              insight.type === 'warning' ? COLORS.warning :
                              COLORS.primary
                            }
                          />
                        </View>
                        <View style={styles.rowMain}>
                          <Text style={styles.rowTitle}>{insight.title}</Text>
                          <Text style={styles.rowSubtitle} numberOfLines={2}>
                            {insight.message}
                          </Text>
                        </View>
                        {!!insight.value && (
                          <Text style={styles.rowValue} numberOfLines={1}>
                            {insight.value}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {stats.topSymptom && (
                <View style={styles.singleRowContainer}>
                  <View style={styles.groupContainer}>
                    <View style={styles.groupRow}>
                      <View style={styles.rowIconBadge}>
                        <Ionicons name="pulse" size={18} color={COLORS.primary} />
                      </View>
                      <View style={styles.rowMain}>
                        <Text style={styles.rowTitle}>{t.home.mostFrequentSymptom}</Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {getSymptomLabel(stats.topSymptom)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sheet Menu */}
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  greeting: {
    fontSize: 34,
    fontFamily: FONTS.heading.regular,
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 22,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  primaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  primaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCardTitle: {
    fontSize: 18,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  primaryCardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  insightsContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.body.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  groupRowTouchable: {
    minHeight: 56,
  },
  groupRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  singleRowContainer: {
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flex: 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.body.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  emptyStateIconContainer: {
    marginBottom: SPACING.lg,
  },
  emptyStateIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyStateCTA: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  emptyStateCTAText: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.white,
  },
  chatSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  calendarSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  calendar: {
    borderRadius: RADIUS.lg,
  },
  predictionCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  predictionTitle: {
    fontSize: 14,
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  predictionDate: {
    fontSize: 18,
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  predictionSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
});

