import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const INSPIRATIONAL_QUOTES = [
  "Chaque jour est une nouvelle opportunité 🌸",
  "Vous êtes plus forte que vous ne le pensez 💪",
  "Prenez soin de vous, vous le méritez 💝",
  "Écoutez votre corps, il vous parle 🧘‍♀️",
  "Vous n'êtes pas seule dans ce voyage ✨",
  "La ménopause n'est pas la fin, c'est un nouveau départ 🦋",
  "Célébrez chaque petite victoire 🌟",
];

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;

  const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];

  useEffect(() => {
    // Animation du logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    // Animation de la citation (delayed)
    setTimeout(() => {
      Animated.timing(quoteAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, 400);
  }, []);

  return (
    <View style={styles.container}>
      {/* Cercles décoratifs en arrière-plan */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />
      <View style={[styles.decorativeCircle, styles.circle3]} />

      {/* Logo animé */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>H</Text>
        </View>
        <Text style={styles.appName}>Helene</Text>
        <Text style={styles.tagline}>Votre compagne IA pour la ménopause</Text>
      </Animated.View>

      {/* Citation inspirante */}
      <Animated.View
        style={[
          styles.quoteContainer,
          {
            opacity: quoteAnim,
            transform: [
              {
                translateY: quoteAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.quote}>{randomQuote}</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Chargement...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.05,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.primary,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.primary,
    top: '40%',
    left: -75,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 56,
    fontFamily: FONTS.heading.italic,
    color: COLORS.white,
    letterSpacing: -1,
  },
  appName: {
    fontSize: 48,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quoteContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  quote: {
    fontSize: 18,
    fontFamily: FONTS.heading.italic,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.body.medium,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
