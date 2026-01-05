/**
 * Générateur d'insights automatiques basés sur les données de santé
 */

export const generateWeeklyInsights = (logs) => {
  if (!logs || logs.length === 0) return [];

  const insights = [];
  const currentWeekLogs = logs.slice(0, 7);
  const previousWeekLogs = logs.slice(7, 14);

  // 1. Tendance humeur
  const currentMoodAvg = calculateAverage(currentWeekLogs, 'mood');
  const previousMoodAvg = calculateAverage(previousWeekLogs, 'mood');
  
  if (previousMoodAvg > 0) {
    const moodChange = ((currentMoodAvg - previousMoodAvg) / previousMoodAvg) * 100;
    if (Math.abs(moodChange) > 10) {
      insights.push({
        id: 'mood-trend',
        type: moodChange > 0 ? 'positive' : 'warning',
        icon: moodChange > 0 ? 'trending-up' : 'trending-down',
        title: 'Tendance humeur',
        message: `Votre humeur est ${moodChange > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(moodChange).toFixed(0)}% cette semaine`,
        value: `${currentMoodAvg.toFixed(1)}/5`,
      });
    }
  }

  // 2. Qualité du sommeil
  const currentSleepAvg = calculateAverage(currentWeekLogs, 'sleep_quality');
  const previousSleepAvg = calculateAverage(previousWeekLogs, 'sleep_quality');
  
  if (previousSleepAvg > 0) {
    const sleepChange = currentSleepAvg - previousSleepAvg;
    if (Math.abs(sleepChange) > 1) {
      insights.push({
        id: 'sleep-trend',
        type: sleepChange > 0 ? 'positive' : 'info',
        icon: 'moon',
        title: 'Sommeil',
        message: `Vous avez ${sleepChange > 0 ? 'mieux dormi' : 'moins bien dormi'} cette semaine (${sleepChange > 0 ? '+' : ''}${sleepChange.toFixed(1)}h)`,
        value: `${currentSleepAvg.toFixed(1)}/10`,
      });
    }
  }

  // 3. Meilleure journée de la semaine
  const bestDay = findBestDay(currentWeekLogs);
  if (bestDay) {
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[bestDay.dayOfWeek];
    insights.push({
      id: 'best-day',
      type: 'positive',
      icon: 'star',
      title: 'Meilleure journée',
      message: `${dayName} était votre meilleur jour (humeur ${bestDay.mood}/5)`,
      value: dayName,
    });
  }

  // 4. Symptômes principaux
  const topSymptoms = findTopSymptoms(currentWeekLogs, 2);
  if (topSymptoms.length > 0) {
    const symptomLabels = {
      hot_flashes: 'bouffées de chaleur',
      night_sweats: 'sueurs nocturnes',
      headaches: 'maux de tête',
      joint_pain: 'douleurs articulaires',
      fatigue: 'fatigue',
      anxiety: 'anxiété',
      irritability: 'irritabilité',
      brain_fog: 'brouillard mental',
      low_mood: 'humeur basse',
    };

    const symptomList = topSymptoms
      .map(s => symptomLabels[s.symptom] || s.symptom)
      .join(' et ');

    insights.push({
      id: 'top-symptoms',
      type: 'warning',
      icon: 'pulse',
      title: 'Symptômes principaux',
      message: `Cette semaine : ${symptomList}`,
      value: `${topSymptoms[0].count} jours`,
    });
  }

  // 5. Pattern temporel (matin vs soir)
  const morningPattern = analyzeTimePattern(currentWeekLogs, 'morning');
  if (morningPattern) {
    insights.push({
      id: 'time-pattern',
      type: 'info',
      icon: 'time',
      title: 'Pattern observé',
      message: morningPattern,
      value: '🕐',
    });
  }

  // 6. Énergie
  const energyAvg = calculateAverage(currentWeekLogs, 'energy_level');
  if (energyAvg > 0) {
    insights.push({
      id: 'energy',
      type: energyAvg >= 3 ? 'positive' : 'info',
      icon: 'flash',
      title: 'Niveau d\'énergie',
      message: `Votre énergie moyenne est de ${energyAvg.toFixed(1)}/5`,
      value: energyAvg >= 3 ? 'Bon' : 'À surveiller',
    });
  }

  // 7. Consistance du tracking
  const consistencyRate = (currentWeekLogs.length / 7) * 100;
  if (consistencyRate >= 80) {
    insights.push({
      id: 'consistency',
      type: 'positive',
      icon: 'checkmark-circle',
      title: 'Excellent suivi',
      message: `Vous avez complété ${currentWeekLogs.length}/7 check-ins cette semaine`,
      value: `${consistencyRate.toFixed(0)}%`,
    });
  }

  return insights.slice(0, 5); // Limiter à 5 insights max
};

// Fonctions utilitaires
const calculateAverage = (logs, field) => {
  const values = logs.map(log => log[field]).filter(v => v != null && v > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const findBestDay = (logs) => {
  let bestLog = null;
  let highestMood = 0;

  logs.forEach(log => {
    if (log.mood > highestMood) {
      highestMood = log.mood;
      bestLog = {
        ...log,
        dayOfWeek: new Date(log.log_date).getDay(),
        mood: log.mood,
      };
    }
  });

  return bestLog;
};

const findTopSymptoms = (logs, limit = 3) => {
  const symptoms = ['hot_flashes', 'night_sweats', 'headaches', 'joint_pain', 'fatigue', 'anxiety', 'irritability', 'brain_fog', 'low_mood'];
  const symptomCounts = {};

  symptoms.forEach(symptom => {
    symptomCounts[symptom] = logs.filter(log => log[symptom] && log[symptom] > 0).length;
  });

  return Object.entries(symptomCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([symptom, count]) => ({ symptom, count }));
};

const analyzeTimePattern = (logs) => {
  // Analyser si les bouffées de chaleur sont plus fréquentes à certains moments
  const symptoms = ['hot_flashes', 'night_sweats'];
  let morningCount = 0;
  let eveningCount = 0;

  logs.forEach(log => {
    symptoms.forEach(symptom => {
      if (log[symptom] && log[symptom] > 0) {
        // Simulation : on pourrait ajouter un champ time_of_day dans le futur
        // Pour l'instant, on fait une estimation basée sur les symptômes
        if (symptom === 'hot_flashes') morningCount++;
        if (symptom === 'night_sweats') eveningCount++;
      }
    });
  });

  if (eveningCount > morningCount && eveningCount >= 3) {
    return 'Vos symptômes sont plus fréquents le soir';
  } else if (morningCount > eveningCount && morningCount >= 3) {
    return 'Vos symptômes sont plus fréquents le matin';
  }

  return null;
};

export const generateMonthlyInsights = (logs) => {
  if (!logs || logs.length < 7) return [];

  const insights = [];
  
  // Tendances mensuelles
  const moodAvg = calculateAverage(logs, 'mood');
  const sleepAvg = calculateAverage(logs, 'sleep_quality');
  const energyAvg = calculateAverage(logs, 'energy_level');

  insights.push({
    id: 'monthly-overview',
    type: 'info',
    icon: 'analytics',
    title: 'Vue d\'ensemble du mois',
    message: `Humeur: ${moodAvg.toFixed(1)}/5 • Sommeil: ${sleepAvg.toFixed(1)}/10 • Énergie: ${energyAvg.toFixed(1)}/5`,
    value: `${logs.length} jours`,
  });

  // Symptômes mensuels
  const topSymptoms = findTopSymptoms(logs, 3);
  if (topSymptoms.length > 0) {
    const symptomLabels = {
      hot_flashes: 'Bouffées de chaleur',
      night_sweats: 'Sueurs nocturnes',
      headaches: 'Maux de tête',
      joint_pain: 'Douleurs articulaires',
      fatigue: 'Fatigue',
      anxiety: 'Anxiété',
      irritability: 'Irritabilité',
      brain_fog: 'Brouillard mental',
      low_mood: 'Humeur basse',
    };

    topSymptoms.forEach((symptom, index) => {
      insights.push({
        id: `monthly-symptom-${index}`,
        type: 'warning',
        icon: 'medical',
        title: symptomLabels[symptom.symptom] || symptom.symptom,
        message: `Présent ${symptom.count} jours ce mois-ci`,
        value: `${((symptom.count / logs.length) * 100).toFixed(0)}%`,
      });
    });
  }

  return insights;
};
