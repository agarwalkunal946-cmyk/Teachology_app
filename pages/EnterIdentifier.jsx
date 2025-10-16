import React, { useState } from "react";
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
import Toast from 'react-native-toast-message';

import api from '../utils/apiLogger';
import { sendOtpEndpoint } from '../config/config';
import { VITE_APP_API_BASE_URL } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const EnterIdentifierScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const sendOtp = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const payload = { email: email };
      const response = await api.post(`${VITE_APP_API_BASE_URL}${sendOtpEndpoint}`, payload);
      
      if (response.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message || "OTP sent successfully! Redirecting..."
        });
        const currentEmail = email;
        
        setEmail("");
        setEmailError("");

        setTimeout(() => {
          navigation.navigate("VerifyMobileOtp", { identifier: currentEmail });
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || "Failed to send OTP."
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP. Please try again.";
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: message
      });
    } finally {
      setLoading(false);
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
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Login with OTP</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your email to get an OTP
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
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) {
                        setEmailError("");
                      }
                    }}
                    editable={!loading}
                  />
                </View>

                {emailError ? <Text style={styles.inputError}>{emailError}</Text> : <View style={styles.errorPlaceholder} />}
                
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={sendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Remember your password?{' '}
                  <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                    Login here
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  header: {
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
    marginBottom: 5,
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
  inputError: {
    color: '#d93025',
    fontSize: 12,
    paddingLeft: 10,
    marginBottom: 15,
    height: 24,
  },
  errorPlaceholder: {
    height: 24,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#443fe1',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4A5568',
  },
  footerLink: {
    color: '#443fe1',
    fontWeight: '700',
  },
});

export default EnterIdentifierScreen;