import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LanguageContext } from '../../App';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { hapticFeedback } from '../utils/hapticFeedback';
import Markdown from 'react-native-markdown-display';

// Articles sur la ménopause
const ARTICLES = [
  {
    id: 1,
    category: 'Santé',
    title: 'Les symptômes de la ménopause : ce que vous devez savoir',
    excerpt: 'Bouffées de chaleur, troubles du sommeil, changements d\'humeur... Comprendre les symptômes pour mieux les gérer.',
    readTime: '5 min',
    icon: 'thermometer',
    color: '#FF6B6B',
    content: `La ménopause est une étape naturelle de la vie d'une femme, marquée par l'arrêt définitif des menstruations. Elle survient généralement entre 45 et 55 ans.

**Les symptômes les plus courants :**

• Bouffées de chaleur et sueurs nocturnes
• Troubles du sommeil et insomnie
• Changements d'humeur et irritabilité
• Sécheresse vaginale
• Prise de poids
• Diminution de la libido
• Troubles de la mémoire

**Comment les gérer ?**

1. Adoptez une alimentation équilibrée riche en calcium et vitamine D
2. Pratiquez une activité physique régulière
3. Gérez votre stress avec des techniques de relaxation
4. Consultez votre gynécologue pour discuter des options de traitement`,
  },
  {
    id: 2,
    category: 'Traitement',
    title: 'Traitement hormonal substitutif (THS) : avantages et risques',
    excerpt: 'Le THS peut soulager les symptômes de la ménopause. Découvrez si c\'est fait pour vous.',
    readTime: '7 min',
    icon: 'flask',
    color: '#4ECDC4',
    content: `Le traitement hormonal substitutif (THS) consiste à compenser la baisse d'hormones (œstrogènes et progestérone) qui survient à la ménopause.

**Avantages du THS :**

• Réduction significative des bouffées de chaleur
• Amélioration de la qualité du sommeil
• Prévention de l'ostéoporose
• Amélioration de l'humeur et du bien-être
• Réduction de la sécheresse vaginale

**Risques potentiels :**

• Légère augmentation du risque de cancer du sein (après plusieurs années)
• Risque de thrombose veineuse
• Possible augmentation de la tension artérielle

**Qui peut bénéficier du THS ?**

Le THS est particulièrement recommandé pour les femmes :
- De moins de 60 ans
- En ménopause depuis moins de 10 ans
- Avec des symptômes gênants au quotidien
- Sans antécédents de cancer hormono-dépendant

**Important :** Le THS doit être prescrit par un médecin après évaluation personnalisée des bénéfices et risques.`,
  },
  {
    id: 3,
    category: 'Nutrition',
    title: 'Alimentation et ménopause : les bons réflexes',
    excerpt: 'Une alimentation adaptée peut réduire les symptômes et prévenir les complications.',
    readTime: '6 min',
    icon: 'nutrition',
    color: '#95E1D3',
    content: `L'alimentation joue un rôle crucial pendant la ménopause pour maintenir un poids santé et prévenir l'ostéoporose.

**Aliments à privilégier :**

**Calcium (1200 mg/jour)**
- Produits laitiers : yaourts, fromages, lait
- Légumes verts : brocoli, chou kale, épinards
- Poissons avec arêtes : sardines, anchois
- Eaux minérales riches en calcium

**Vitamine D (800 UI/jour)**
- Poissons gras : saumon, maquereau, sardines
- Œufs (jaune)
- Champignons
- Exposition au soleil 15-20 min/jour

**Phytoestrogènes**
- Soja et dérivés (tofu, tempeh)
- Graines de lin moulues
- Légumineuses

**Oméga-3**
- Poissons gras
- Huile de colza, noix
- Graines de chia

**Aliments à limiter :**

• Alcool (aggrave les bouffées de chaleur)
• Caféine (perturbe le sommeil)
• Aliments épicés (déclenchent les bouffées)
• Sucres raffinés (prise de poids)
• Sel (rétention d'eau)`,
  },
  {
    id: 4,
    category: 'Bien-être',
    title: 'Activité physique : votre meilleure alliée',
    excerpt: 'L\'exercice régulier aide à gérer les symptômes et à prévenir les complications de la ménopause.',
    readTime: '5 min',
    icon: 'fitness',
    color: '#FFD93D',
    content: `L'activité physique régulière est l'un des meilleurs moyens de traverser la ménopause en forme.

**Bienfaits de l'exercice :**

• Réduit les bouffées de chaleur
• Améliore la qualité du sommeil
• Maintient un poids santé
• Renforce les os (prévention ostéoporose)
• Améliore l'humeur (libération d'endorphines)
• Réduit le risque de maladies cardiovasculaires

**Programme recommandé :**

**Cardio (150 min/semaine)**
- Marche rapide
- Natation
- Vélo
- Danse

**Renforcement musculaire (2-3x/semaine)**
- Yoga
- Pilates
- Musculation légère
- Exercices avec élastiques

**Souplesse et équilibre**
- Étirements quotidiens
- Tai chi
- Yoga

**Conseils pratiques :**

1. Commencez progressivement
2. Choisissez une activité qui vous plaît
3. Variez les exercices
4. Trouvez un partenaire d'entraînement
5. Fixez-vous des objectifs réalistes`,
  },
  {
    id: 5,
    category: 'Sexualité',
    title: 'Vie intime et ménopause : parlons-en',
    excerpt: 'La ménopause peut affecter la sexualité, mais des solutions existent.',
    readTime: '6 min',
    icon: 'heart',
    color: '#F38BA8',
    content: `Les changements hormonaux de la ménopause peuvent impacter la vie sexuelle, mais ce n'est pas une fatalité.

**Changements fréquents :**

• Sécheresse vaginale
• Diminution de la libido
• Douleurs pendant les rapports
• Changements de l'image corporelle
• Fatigue

**Solutions pour maintenir une vie intime épanouie :**

**1. Traitements locaux**
- Lubrifiants à base d'eau
- Hydratants vaginaux
- Œstrogènes locaux (sur prescription)

**2. Communication**
- Parlez ouvertement avec votre partenaire
- Consultez un sexologue si nécessaire
- Prenez le temps de l'intimité

**3. Nouvelles pratiques**
- Explorez de nouvelles formes de sensualité
- Prolongez les préliminaires
- Essayez des positions plus confortables

**4. Prendre soin de soi**
- Exercice de Kegel (renforcement du périnée)
- Gestion du stress
- Maintien d'une bonne image de soi

**Important :** N'hésitez pas à en parler avec votre gynécologue. La sexualité fait partie intégrante de votre bien-être.`,
  },
  {
    id: 6,
    category: 'Prévention',
    title: 'Ostéoporose : comment protéger vos os',
    excerpt: 'Après la ménopause, les os deviennent plus fragiles. Agissez dès maintenant.',
    readTime: '5 min',
    icon: 'body',
    color: '#A8DADC',
    content: `La chute des œstrogènes après la ménopause accélère la perte osseuse, augmentant le risque d'ostéoporose.

**Facteurs de risque :**

• Ménopause précoce
• Antécédents familiaux
• Maigreur
• Tabagisme
• Consommation excessive d'alcool
• Sédentarité
• Carence en calcium et vitamine D

**Prévention active :**

**1. Nutrition**
- Calcium : 1200 mg/jour
- Vitamine D : 800-1000 UI/jour
- Protéines : 1g/kg de poids corporel

**2. Activité physique**
- Exercices en charge (marche, jogging)
- Renforcement musculaire
- Exercices d'équilibre

**3. Style de vie**
- Arrêt du tabac
- Limitation de l'alcool
- Éviter les chutes à domicile

**4. Dépistage**
- Ostéodensitométrie à la ménopause
- Contrôle tous les 2-3 ans si risque élevé

**Traitements disponibles :**

Si l'ostéoporose est diagnostiquée :
- THS (si pas de contre-indication)
- Bisphosphonates
- Dénosumab
- Raloxifène

**Consultez votre médecin** pour une évaluation personnalisée de votre risque.`,
  },
];

export default function BlogScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleArticlePress = (article) => {
    hapticFeedback.light();
    setSelectedArticle(article);
  };

  const handleBackPress = () => {
    hapticFeedback.light();
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    // Vue détaillée d'un article
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.articleHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: selectedArticle.color + '20' }]}>
              <Text style={[styles.categoryText, { color: selectedArticle.color }]}>
                {selectedArticle.category}
              </Text>
            </View>
            <Text style={styles.articleTitle}>{selectedArticle.title}</Text>
            <View style={styles.articleMeta}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.readTime}>{selectedArticle.readTime} de lecture</Text>
            </View>
          </View>

          <View style={styles.articleContent}>
            <Markdown style={markdownStyles}>{selectedArticle.content}</Markdown>
          </View>

          <View style={styles.shareSection}>
            <Text style={styles.shareSectionTitle}>Cet article vous a aidé ?</Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                hapticFeedback.light();
                // Partage à implémenter
              }}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.primary} />
              <Text style={styles.shareButtonText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Vue liste des articles
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.light();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog & Informations</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Tout savoir sur la ménopause</Text>
          <Text style={styles.introText}>
            Découvrez nos articles pour mieux comprendre et vivre cette période de transition.
          </Text>
        </View>

        <View style={styles.articlesGrid}>
          {ARTICLES.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => handleArticlePress(article)}
              activeOpacity={0.8}
            >
              <View style={[styles.articleIcon, { backgroundColor: article.color + '20' }]}>
                <Ionicons name={article.icon} size={28} color={article.color} />
              </View>
              <View style={styles.articleCardContent}>
                <View style={[styles.categoryBadge, { backgroundColor: article.color + '20' }]}>
                  <Text style={[styles.categoryText, { color: article.color }]}>
                    {article.category}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{article.title}</Text>
                <Text style={styles.cardExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.readTimeContainer}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.cardReadTime}>{article.readTime}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Ces articles sont fournis à titre informatif. Consultez toujours votre médecin pour un avis personnalisé.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
  },
  intro: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  articlesGrid: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  articleIcon: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleCardContent: {
    padding: SPACING.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FONTS.body.semibold,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  cardExcerpt: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardReadTime: {
    fontSize: 13,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    fontSize: 13,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Article détaillé
  articleHeader: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  articleTitle: {
    fontSize: 26,
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
    lineHeight: 34,
    marginBottom: SPACING.md,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  readTime: {
    fontSize: 14,
    fontFamily: FONTS.body.regular,
    color: COLORS.textSecondary,
  },
  articleContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    color: COLORS.text,
    lineHeight: 26,
  },
  shareSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  shareSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  shareButtonText: {
    fontSize: 15,
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: COLORS.text,
    fontFamily: FONTS.body.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  strong: {
    fontFamily: FONTS.body.bold,
    color: COLORS.text,
  },
  bullet_list: {
    marginVertical: SPACING.sm,
  },
  ordered_list: {
    marginVertical: SPACING.sm,
  },
  list_item: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    marginVertical: SPACING.md,
    opacity: 0.95,
  },
  code_inline: {
    fontFamily: FONTS.mono?.regular || FONTS.body.regular,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fence: {
    fontFamily: FONTS.mono?.regular || FONTS.body.regular,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
  },
});
