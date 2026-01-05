import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const RotatingLogo = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={80} height={80} viewBox="0 0 400 400">
        <Circle cx="200" cy="200" r="30" fill={COLORS.primary} fillOpacity={1} />
        <Circle cx="200" cy="80" r="60" fill={COLORS.primary} fillOpacity={0.8} />
        <Circle cx="284.85" cy="115.15" r="50" fill={COLORS.primary} fillOpacity={0.6} />
        <Circle cx="320" cy="200" r="60" fill={COLORS.primary} fillOpacity={0.8} />
        <Circle cx="284.85" cy="284.85" r="50" fill={COLORS.primary} fillOpacity={0.6} />
        <Circle cx="200" cy="320" r="60" fill={COLORS.primary} fillOpacity={0.8} />
        <Circle cx="115.15" cy="284.85" r="50" fill={COLORS.primary} fillOpacity={0.6} />
        <Circle cx="80" cy="200" r="60" fill={COLORS.primary} fillOpacity={0.8} />
        <Circle cx="115.15" cy="115.15" r="50" fill={COLORS.primary} fillOpacity={0.6} />
      </Svg>
    </Animated.View>
  );
};

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <RotatingLogo />
          </View>
          <Text style={styles.logoText}>Helene</Text>
          <Text style={styles.tagline}>Votre compagne IA pour la ménopause</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Comment ça marche */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          </View>
          <Text style={styles.sectionText}>
            Helene utilise l'intelligence artificielle de Google Gemini pour vous accompagner pendant la ménopause. 
            Notre application analyse vos symptômes quotidiens et vous propose des conseils personnalisés basés sur 
            des données scientifiques.
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Suivi quotidien de vos symptômes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Analyse émotionnelle automatique</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Insights personnalisés par IA</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Conseils contextuels intelligents</Text>
            </View>
          </View>
        </View>

        {/* L'IA Helene */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="bulb" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Notre Intelligence Artificielle</Text>
          </View>
          <Text style={styles.sectionText}>
            Helene s'appuie sur <Text style={styles.bold}>Google Gemini</Text>, l'un des modèles d'IA les plus avancés au monde. 
            Notre chatbot est spécialisé dans la santé des femmes et formé pour :
          </Text>
          <View style={styles.aiCard}>
            <Ionicons name="brain" size={32} color={COLORS.primary} />
            <Text style={styles.aiCardTitle}>Comprendre vos symptômes</Text>
            <Text style={styles.aiCardText}>
              L'IA analyse vos données pour identifier des patterns et vous alerter sur des tendances importantes
            </Text>
          </View>
          <View style={styles.aiCard}>
            <Ionicons name="heart" size={32} color={COLORS.primary} />
            <Text style={styles.aiCardTitle}>Répondre avec empathie</Text>
            <Text style={styles.aiCardText}>
              Chaque réponse est adaptée à votre situation émotionnelle et physique du moment
            </Text>
          </View>
          <View style={styles.aiCard}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
            <Text style={styles.aiCardTitle}>Garantir la sécurité</Text>
            <Text style={styles.aiCardText}>
              L'IA ne remplace pas un avis médical et vous encourage à consulter en cas de besoin
            </Text>
          </View>
        </View>

        {/* Confidentialité GDPR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Vos données, votre contrôle</Text>
          </View>
          
          <View style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Ionicons name="shield-checkmark" size={28} color={COLORS.success} />
              <Text style={styles.privacyTitle}>Conformité GDPR</Text>
            </View>
            <Text style={styles.privacyText}>
              Helene respecte strictement le Règlement Général sur la Protection des Données (RGPD) européen.
            </Text>
          </View>

          <View style={styles.privacyList}>
            <View style={styles.privacyItem}>
              <View style={styles.privacyIconCircle}>
                <Ionicons name="eye-off" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.privacyItemContent}>
                <Text style={styles.privacyItemTitle}>Données chiffrées</Text>
                <Text style={styles.privacyItemText}>
                  Toutes vos données sont chiffrées de bout en bout et stockées de manière sécurisée
                </Text>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={styles.privacyIconCircle}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.privacyItemContent}>
                <Text style={styles.privacyItemTitle}>Jamais partagées</Text>
                <Text style={styles.privacyItemText}>
                  Vos données ne sont jamais vendues ou partagées avec des tiers sans votre consentement
                </Text>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={styles.privacyIconCircle}>
                <Ionicons name="trash" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.privacyItemContent}>
                <Text style={styles.privacyItemTitle}>Droit à l'oubli</Text>
                <Text style={styles.privacyItemText}>
                  Vous pouvez supprimer toutes vos données à tout moment depuis votre profil
                </Text>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={styles.privacyIconCircle}>
                <Ionicons name="download" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.privacyItemContent}>
                <Text style={styles.privacyItemTitle}>Portabilité</Text>
                <Text style={styles.privacyItemText}>
                  Exportez vos données au format PDF pour les partager avec votre médecin
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.gdprBadge}>
            <Ionicons name="flag" size={16} color={COLORS.primary} />
            <Text style={styles.gdprBadgeText}>Hébergé en Europe • Serveurs en France</Text>
          </View>
        </View>

        {/* Notre Mission */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="star" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Notre Mission</Text>
          </View>
          <Text style={styles.sectionText}>
            Helene est née d'un constat simple : 1 femme sur 2 souffre en silence pendant la ménopause. 
            Notre mission est de briser ce tabou en offrant un accompagnement intelligent, bienveillant et accessible à toutes.
          </Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionQuote}>
              "Nous croyons que chaque femme mérite d'être écoutée, comprise et accompagnée pendant cette transition de vie."
            </Text>
            <Text style={styles.missionAuthor}>— L'équipe Helene</Text>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="mail" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Contact & Support</Text>
          </View>
          
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>support@helene-app.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>www.helene-app.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Conditions d'utilisation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Politique de confidentialité</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Fait avec ❤️ pour les femmes</Text>
          <Text style={styles.footerCopyright}>© 2026 Helene. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoText: {
    fontSize: 42,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    fontWeight: '400',
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  version: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  bold: {
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureText: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.text,
    flex: 1,
  },
  aiCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  aiCardText: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.bold,
    color: COLORS.success,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  privacyList: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  privacyItem: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  privacyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyItemContent: {
    flex: 1,
  },
  privacyItemTitle: {
    fontSize: 15,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  privacyItemText: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  gdprBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'center',
  },
  gdprBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  missionCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  missionQuote: {
    fontSize: 16,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  missionAuthor: {
    fontSize: 14,
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactButtonText: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  footerText: {
    fontSize: 15,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  footerCopyright: {
    fontSize: 13,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
});
