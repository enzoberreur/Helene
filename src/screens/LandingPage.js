import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';

const { width, height } = Dimensions.get('window');

const RotatingLogo = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000, // Slower, more elegant rotation
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
    <Animated.View style={[styles.logoContainer, { transform: [{ rotate }] }]}>
      <Svg width={120} height={120} viewBox="0 0 400 400">
        <Circle cx="200" cy="200" r="30" fill="#FF006E" fillOpacity={0.9} />
        <Circle cx="200" cy="80" r="60" fill="#FF6BA7" fillOpacity={0.8} />
        <Circle cx="284.85" cy="115.15" r="50" fill="#FFB3D4" fillOpacity={0.7} />
        <Circle cx="320" cy="200" r="60" fill="#FF6BA7" fillOpacity={0.8} />
        <Circle cx="284.85" cy="284.85" r="50" fill="#FFB3D4" fillOpacity={0.7} />
        <Circle cx="200" cy="320" r="60" fill="#FF6BA7" fillOpacity={0.8} />
        <Circle cx="115.15" cy="284.85" r="50" fill="#FFB3D4" fillOpacity={0.7} />
        <Circle cx="80" cy="200" r="60" fill="#FF6BA7" fillOpacity={0.8} />
        <Circle cx="115.15" cy="115.15" r="50" fill="#FFB3D4" fillOpacity={0.7} />
      </Svg>
    </Animated.View>
  );
};

const FadeInView = ({ delay, children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export default function LandingPage({ navigation }) {
  const { t, language, setLanguage } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });
      if (error) throw error;
      console.log('Connexion réussie!', data.user);
    } catch (error) {
      setError(error.message);
      console.error('Erreur connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        t.common.error,
        language === 'fr'
          ? 'Veuillez entrer votre email pour réinitialiser votre mot de passe.'
          : 'Please enter your email to reset your password.',
        [{ text: t.common.ok }]
      );
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'helene://reset-password' }
      );
      if (error) throw error;
      Alert.alert(
        language === 'fr' ? 'Email envoyé' : 'Email sent',
        language === 'fr'
          ? 'Un lien de réinitialisation a été envoyé à votre adresse email.'
          : 'A reset link has been sent to your email address.',
        [{ text: t.common.ok }]
      );
    } catch (error) {
      Alert.alert(t.common.error, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(
      language === 'fr' ? 'Bientôt disponible' : 'Coming soon',
      language === 'fr'
        ? `La connexion avec ${provider} arrive dans une prochaine mise à jour.`
        : `${provider} sign-in is coming in a future update.`,
      [{ text: t.common.ok }]
    );
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF0F5', '#FFDEEB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {/* Language Toggle */}
            <FadeInView delay={200} style={styles.languageToggleWrapper}>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[styles.langButton, language === 'fr' && styles.langButtonActive]}
                  onPress={() => setLanguage('fr')}
                >
                  <Text style={[styles.langText, language === 'fr' && styles.langTextActive]}>FR</Text>
                </TouchableOpacity>
                <View style={styles.langSeparator} />
                <TouchableOpacity
                  style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
                </TouchableOpacity>
              </View>
            </FadeInView>

            <View style={styles.mainContainer}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <FadeInView delay={0}>
                  <RotatingLogo />
                </FadeInView>
                <FadeInView delay={300}>
                  <Text style={styles.logoText}>{t.landing.title}</Text>
                </FadeInView>
                <FadeInView delay={500}>
                  <Text style={styles.tagline}>{t.landing.tagline}</Text>
                </FadeInView>
              </View>

              {/* Login Form Card */}
              <FadeInView delay={700} style={styles.cardContainer}>
                <View style={styles.card}>
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#DC2626" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'email' && styles.inputContainerFocused
                  ]}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={focusedInput === 'email' ? COLORS.primary : COLORS.gray[400]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t.landing.email}
                      placeholderTextColor={COLORS.gray[400]}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!loading}
                    />
                  </View>

                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputContainerFocused
                  ]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={focusedInput === 'password' ? COLORS.primary : COLORS.gray[400]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t.landing.password}
                      placeholderTextColor={COLORS.gray[400]}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={COLORS.gray[400]}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>{t.landing.forgotPassword}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.continueButton, loading && styles.buttonDisabled]}
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    disabled={loading || !email || !password}
                  >
                    {loading ? (
                      <Text style={styles.continueButtonText}>{t.landing.loggingIn}</Text>
                    ) : (
                      <LinearGradient
                        colors={[COLORS.primary, '#FF4D9E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.continueButtonText}>{t.landing.login}</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <LinearGradient
                      colors={['transparent', COLORS.gray[200], 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.dividerLine}
                    />
                    <Text style={styles.dividerText}>OR</Text>
                    <LinearGradient
                      colors={['transparent', COLORS.gray[200], 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.dividerLine}
                    />
                  </View>

                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Apple')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="logo-apple" size={24} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Google')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="logo-google" size={24} color={COLORS.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeInView>

              <FadeInView delay={900}>
                <TouchableOpacity
                  style={styles.signupButton}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('signup')}
                >
                  <Text style={styles.signupText}>
                    {language === 'fr' ? "Pas encore de compte ? " : "Don't have an account? "}
                    <Text style={styles.signupLink}>{t.landing.createAccount}</Text>
                  </Text>
                </TouchableOpacity>
              </FadeInView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  languageToggleWrapper: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  langButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  langSeparator: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 4,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontFamily: 'Times New Roman',
    fontStyle: 'italic',
    color: COLORS.secondary,
    fontWeight: '400',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 32,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 20,
    marginBottom: SPACING.md,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.secondary,
    paddingRight: SPACING.lg,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.secondary,
  },
  eyeIcon: {
    padding: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  forgotPasswordText: {
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  signupButton: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  signupText: {
    color: COLORS.gray[500],
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

