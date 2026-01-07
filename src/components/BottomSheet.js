import React, { useContext, useEffect, useRef } from 'react';
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
import { LanguageContext } from '../../App';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

export default function BottomSheet({ visible, onClose, navigation }) {
  const context = useContext(LanguageContext) || {};
  const t = context.t || {};
  const tm = t?.menu || {};

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
      label: tm.home ?? 'Home',
      icon: 'home',
      screen: 'home',
    },
    {
      id: 'checkin',
      label: tm.checkin ?? 'Daily check-in',
      icon: 'create',
      screen: 'checkin',
    },
    {
      id: 'cycleTracking',
      label: tm.cycleTracking ?? 'Cycle tracking',
      icon: 'calendar',
      screen: 'cycleTracking',
    },
    {
      id: 'trends',
      label: tm.trends ?? 'Trends & insights',
      icon: 'stats-chart',
      screen: 'trends',
    },
    {
      id: 'chat',
      label: tm.chat ?? 'Talk to Hélène',
      icon: 'sparkles',
      screen: 'chat',
    },
    {
      id: 'journal',
      label: tm.journal ?? 'Emotional journal',
      icon: 'heart',
      screen: 'journal',
    },
    {
      id: 'hormoneTracking',
      label: tm.hormoneTracking ?? 'Hormone tracking',
      icon: 'flask',
      screen: 'hormoneTracking',
    },
    {
      id: 'surgicalRisk',
      label: tm.surgicalRisk ?? 'Surgical risk',
      icon: 'medical',
      screen: 'surgicalRisk',
    },
    {
      id: 'blog',
      label: tm.blog ?? 'Blog & info',
      icon: 'book',
      screen: 'blog',
    },
    {
      id: 'profile',
      label: tm.profile ?? 'Profile',
      icon: 'person',
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
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{tm.title ?? 'Menu'}</Text>
              </View>

              {/* Menu Items */}
              <ScrollView
                style={styles.menuScrollView}
                contentContainerStyle={styles.menuScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.menuCards}>
                  {menuItems.map((item, index) => {
                    const isLast = index === menuItems.length - 1;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.menuCard, !isLast && styles.menuCardSpacing]}
                        onPress={() => handleNavigate(item.screen)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuCardLeft}>
                          <View style={styles.menuCardIcon}>
                            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                          </View>
                          <Text style={styles.menuCardLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading.regular,
    color: COLORS.text,
    marginLeft: SPACING.sm,
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
  menuScrollContent: {
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.sm,
  },
  menuCards: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  menuCardSpacing: {
    marginBottom: SPACING.md,
  },
  menuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuCardLabel: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
  },
});
