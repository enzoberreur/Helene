import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const VALUE_POINTS = [
  {
    id: 1,
    icon: 'calendar',
    title: 'Suivi quotidien simple',
    description: 'Notez vos symptômes en moins de 2 minutes par jour',
  },
  {
    id: 2,
    icon: 'trending-up',
    title: 'Visualisations claires',
    description: 'Comprenez vos tendances avec des graphiques intuitifs',
  },
  {
    id: 3,
    icon: 'chatbubbles',
    title: 'IA conversationnelle',
    description: 'Posez vos questions et obtenez des réponses personnalisées',
  },
  {
    id: 4,
    icon: 'document-text',
    title: 'Rapports médicaux',
    description: 'Générez des PDF à partager avec votre médecin',
  },
  {
    id: 5,
    icon: 'bulb',
    title: 'Insights automatiques',
    description: 'Recevez des analyses hebdomadaires de votre bien-être',
  },
  {
    id: 6,
    icon: 'shield-checkmark',
    title: 'Confidentialité totale',
    description: 'Vos données sont sécurisées et ne sont jamais partagées',
  },
];

export default function OnboardingValueScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ce qu'Helene vous apporte</Text>
          <Text style={styles.subtitle}>
            Un accompagnement complet pour votre bien-être
          </Text>
        </View>

        {/* Value Points */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.valueGrid}>
            {VALUE_POINTS.map((point) => (
              <View key={point.id} style={styles.valueCard}>
                <View style={styles.iconContainer}>
                  <Ionicons name={point.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.valueTitle}>{point.title}</Text>
                <Text style={styles.valueDescription}>{point.description}</Text>
              </View>
            ))}
          </View>

          {/* Trust Section */}
          <View style={styles.trustSection}>
            <View style={styles.trustHeader}>
              <Ionicons name="heart" size={20} color={COLORS.primary} />
              <Text style={styles.trustTitle}>Conçu avec soin</Text>
            </View>
            <Text style={styles.trustText}>
              Helene a été créée en collaboration avec des professionnels de santé 
              et des femmes traversant la ménopause pour vous offrir le meilleur accompagnement possible.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('signup')}
          >
            <Text style={styles.buttonText}>Créer mon compte</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.heading.regular,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  valueGrid: {
    gap: SPACING.md,
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  valueTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  valueDescription: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  trustSection: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  trustTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
  },
  trustText: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    marginTop: SPACING.lg,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  backText: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
});
