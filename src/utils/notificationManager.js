import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure le comportement par défaut des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Demande la permission d'envoyer des notifications
 * @returns {Promise<boolean>} true si la permission est accordée
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission de notification refusée');
      return false;
    }

    // Configuration supplémentaire pour Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-checkin', {
        name: 'Rappels quotidiens',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E83E73',
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return false;
  }
}

/**
 * Planifie une notification quotidienne à 21h
 * @returns {Promise<string|null>} L'ID de la notification planifiée ou null en cas d'erreur
 */
export async function scheduleDailyReminder() {
  try {
    // Annuler toutes les notifications existantes
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Planifier la notification quotidienne à 21h
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Helene 💗',
        body: "Il est 21h, comment vous sentez-vous aujourd'hui ?",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: 'checkin' },
      },
      trigger: {
        hour: 21,
        minute: 0,
        repeats: true,
      },
    });

    console.log('Notification quotidienne planifiée avec l\'ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de la planification de la notification:', error);
    return null;
  }
}

/**
 * Annule toutes les notifications planifiées
 * @returns {Promise<void>}
 */
export async function cancelDailyReminder() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Notifications annulées');
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
}

/**
 * Obtient toutes les notifications planifiées
 * @returns {Promise<Array>}
 */
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Notifications planifiées:', notifications);
    return notifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
}

/**
 * Configure un écouteur pour les notifications reçues
 * @param {Function} callback - Fonction appelée quand une notification est reçue
 * @returns {Subscription}
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Configure un écouteur pour les réponses aux notifications
 * @param {Function} callback - Fonction appelée quand l'utilisateur interagit avec une notification
 * @returns {Subscription}
 */
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Envoie une notification de test immédiate
 * @returns {Promise<string>}
 */
export async function sendTestNotification() {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Helene 💗',
        body: 'Notification de test - Ceci est un exemple !',
        sound: true,
        data: { screen: 'checkin' },
      },
      trigger: {
        seconds: 1,
      },
    });

    console.log('Notification de test envoyée avec l\'ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de test:', error);
    throw error;
  }
}

/**
 * Vérifie si les notifications sont activées
 * @returns {Promise<boolean>}
 */
export async function areNotificationsEnabled() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
}
