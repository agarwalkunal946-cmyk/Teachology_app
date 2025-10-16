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
import { forgotPassword as forgotPasswordEndpoint } from '../config/config';
import { VITE_APP_API_BASE_URL } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleRequestResetLink = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `${VITE_APP_API_BASE_URL}${forgotPasswordEndpoint}`,
        { email }
      );
    
      if (response.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message || "A password reset link has been sent."
        });
        setEmail(""); 
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || "Failed to request password reset."
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
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
                <Text style={styles.headerTitle}>Forgot Password?</Text>
                <Text style={styles.headerSubtitle}>
                  No worries, we'll send you reset instructions.
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
                  onPress={handleRequestResetLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.backLinkText}>← Back to Login</Text>
                </TouchableOpacity>
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
  backLinkText: {
    color: '#443fe1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;