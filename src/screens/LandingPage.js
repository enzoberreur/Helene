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
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { LanguageContext } from '../../App';

const { width, height } = Dimensions.get('window');

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
    <Animated.View style={[styles.logoContainer, { transform: [{ rotate }] }]}>
      <Svg width={100} height={100} viewBox="0 0 400 400">
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
          ? 'Veuillez entrer votre email.'
          : 'Please enter your email.',
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
          ? 'Lien envoyé.'
          : 'Link sent.',
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
        ? `Connexion ${provider} bientôt.`
        : `${provider} sign-in coming soon.`,
      [{ text: t.common.ok }]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {/* Language Toggle - Pushed down */}
            <FadeInView delay={200} style={styles.languageToggleWrapper}>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[styles.langButton, language === 'fr' && styles.langButtonActive]}
                  onPress={() => setLanguage('fr')}
                >
                  <Text style={[styles.langText, language === 'fr' && styles.langTextActive]}>FR</Text>
                </TouchableOpacity>
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

              {/* Login Form - Clean & Minimal */}
              <FadeInView delay={700} style={styles.formContainer}>
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused
                ]}>
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
                  <Text style={styles.continueButtonText}>
                    {loading ? t.landing.loggingIn : t.landing.login}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Apple')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-apple" size={22} color={COLORS.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Google')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-google" size={22} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.signupButton}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('onboardingWelcome')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.xxl, // Added top padding to push content down
  },
  languageToggleWrapper: {
    position: 'absolute',
    top: SPACING.xxl + SPACING.md, // Pushed down significantly
    right: SPACING.lg,
    zIndex: 10,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langButtonActive: {
    // No background, just text style change for minimal look
  },
  langText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray[400],
  },
  langTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
    // Removed shadow for flat look
  },
  logoText: {
    fontSize: 42,
    fontFamily: FONTS.heading.italic,
    color: COLORS.text,
    fontWeight: '400',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    fontFamily: FONTS.body.regular,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // Very light gray
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: SPACING.md,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.text,
    paddingLeft: SPACING.md,
  },
  eyeIcon: {
    padding: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: COLORS.gray[300],
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: '600',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  signupText: {
    color: COLORS.gray[500],
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

