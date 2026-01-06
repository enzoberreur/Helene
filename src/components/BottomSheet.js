import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { hapticFeedback } from '../utils/hapticFeedback';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function BottomSheet({ visible, onClose, navigation }) {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Ouvrir
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fermer
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (screen) => {
    hapticFeedback.light();
    onClose();
    setTimeout(() => navigation.navigate(screen), 300);
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: 'home',
      color: COLORS.primary,
      screen: 'home',
    },
    {
      id: 'checkin',
      label: 'Daily Check-In',
      icon: 'create',
      color: '#FF6B6B',
      screen: 'checkin',
    },
    {
      id: 'cycleTracking',
      label: 'Suivi Menstruel',
      icon: 'calendar',
      color: '#E83E73',
      screen: 'cycleTracking',
    },
    {
      id: 'trends',
      label: 'Tendances & Analyses',
      icon: 'stats-chart',
      color: '#4ECDC4',
      screen: 'trends',
    },
    {
      id: 'chat',
      label: 'Discuter avec Hélène',
      icon: 'sparkles',
      color: '#FFD93D',
      screen: 'chat',
    },
    {
      id: 'journal',
      label: 'Journal Émotionnel',
      icon: 'heart',
      color: '#F38BA8',
      screen: 'journal',
    },
    {
      id: 'hormoneTracking',
      label: 'Taux Hormonaux',
      icon: 'flask',
      color: '#95E1D3',
      screen: 'hormoneTracking',
    },
    {
      id: 'surgicalRisk',
      label: 'Risque Opératoire',
      icon: 'medical',
      color: '#A8DADC',
      screen: 'surgicalRisk',
    },
    {
      id: 'blog',
      label: 'Blog & Informations',
      icon: 'book',
      color: '#B4A7D6',
      screen: 'blog',
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: 'person',
      color: '#FF8B94',
      screen: 'profile',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView
                style={styles.menuScrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.menuGrid}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon} size={24} color={item.color} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuScrollView: {
    flex: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  menuItem: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
});
