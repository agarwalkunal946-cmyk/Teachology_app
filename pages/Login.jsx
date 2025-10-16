import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Toast from 'react-native-toast-message';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';

import { setUser } from '../redux/authSlice';
import api from '../utils/apiLogger';
import { login, google_login } from '../config/config';
import { VITE_APP_API_BASE_URL, VITE_GOOGLE_WEB_CLIENT_ID } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (auth.user) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [auth.user, navigation]);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    return isValid;
  };

  const handleLoginClick = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api.post(`${VITE_APP_API_BASE_URL}${login}`, {
        email: email,
        password: password,
      });
      if (response.data.status === 200) {
        const message = response.data.message || 'User Login successful!';
        Toast.show({ type: 'success', text1: 'Success', text2: message });
        const userData = {
          user: email.toLowerCase(),
          token: response.data.access_token,
          email: response.data.email,
          name: response.data.name,
          phoneno: response.data.phoneno,
          username: response.data.username,
          profile_image: response.data.profile_image,
          user_id: response.data.user_id,
        };
        dispatch(setUser(userData));
        const redirectKey = 'redirectAfterLogin';
        const redirectTo = await AsyncStorage.getItem(redirectKey);
        if (redirectTo) {
          await AsyncStorage.removeItem(redirectKey);
          navigation.reset({ index: 0, routes: [{ name: redirectTo }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      } else {
        const message = response.data.message || 'Login failed.';
        Toast.show({ type: 'error', text1: 'Error', text2: message });
      }
    } catch (error) {
      let message = 'Something went wrong.';
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 400) {
          message = 'Invalid email or password.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      }
      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { email, name, photo } = userInfo.user;
      const backendResponse = await api.post(`${VITE_APP_API_BASE_URL}${google_login}`, {
        email: email.toLowerCase(),
        username: name,
        profile_image: photo,
        role: "teacher",
      });
      const userData = {
        user: email.toLowerCase(),
        token: backendResponse.data.access_token,
        email: backendResponse.data.email,
        name: backendResponse.data.name,
        phoneno: backendResponse.data.phoneno,
        username: backendResponse.data.username,
        profile_image: backendResponse.data.profile_image,
        user_id: backendResponse.data.id,
      };
      dispatch(setUser(userData));
      Toast.show({ type: 'success', text1: 'Success', text2: 'Google Login Successful!' });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      let message = 'Google login failed. Please try again.';
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        message = 'Google sign in was cancelled.';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        message = 'Sign in is already in progress.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      Toast.show({ type: 'error', text1: 'Google Login Error', text2: message });
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <View style={styles.loginHeader}>
                <Text style={styles.headerTitle}>Welcome!</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your credentials to access your account
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Image
                    source={require('../assets/img/login/envelope.png')}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email id"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                  />
                  {emailError ? <Text style={styles.inputError}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                   <Image
                    source={require('../assets/img/login/password.png')}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { paddingRight: 52 }]}
                    placeholder="Enter password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} size={20} color="#555" />
                  </TouchableOpacity>
                  {passwordError ? <Text style={styles.inputError}>{passwordError}</Text> : null}
                </View>

                <View style={styles.loginOptions}>
                  <TouchableOpacity onPress={() => navigation.navigate('VerifyEmailOTP')}>
                    <Text style={styles.optionLink}>Login via Email OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.optionLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    tintColors={{ true: '#443fe1', false: '#555' }}
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleLoginClick}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.socialLoginDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.loginFooter}>
                <Text style={styles.footerText}>
                  Don’t have an account?{' '}
                  <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
                    Register here
                  </Text>
                </Text>
                <Text style={styles.termsText}>
                  By logging in you agree to our{' '}
                  <Text style={styles.footerLink} onPress={() => navigation.navigate('Terms')}>
                    Terms of Use
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.footerLink} onPress={() => navigation.navigate('Privacy')}>
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4A5568',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 15,
    width: 20,
    height: 20,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 52,
    paddingLeft: 52,
    paddingRight: 16,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    fontSize: 16,
    color: '#242424',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 16,
    zIndex: 2,
  },
  inputError: {
    color: '#d93025',
    fontSize: 12,
    paddingLeft: 10,
    marginTop: 4,
  },
  loginOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLink: {
    color: '#443fe1',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#443fe1',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialLoginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dcdcdc',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#888',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    paddingVertical: 14,
    borderRadius: 100,
    width: '100%',
    marginBottom: 28,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loginFooter: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLink: {
    color: '#443fe1',
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 20,
  },
});

export default LoginScreen;