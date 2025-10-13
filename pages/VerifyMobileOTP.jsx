import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

function VerifyMobileOTP() {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const navigation = useNavigation();
  const route = useRoute();
  const identifier = route.params?.identifier || 'your email/phone';
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join('');
    if (finalOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    await new Promise(res => setTimeout(res, 1500));
    setLoading(false);

    Alert.alert('Success', 'OTP verified successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.loginCard}>
          <View style={styles.loginHeader}>
            <Text style={styles.headerTitle}>Check your Email</Text>
            <Text style={styles.headerSubtitle}>
              We've sent a 6-digit code to {identifier}.
            </Text>
          </View>

          <View style={styles.otpInputContainer}>
            {otp.map((data, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                maxLength={1}
                value={data}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                editable={!loading}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>
              Didn't get a code? <Text style={styles.linkText}>Resend</Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginHeader: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 8 },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#343a40',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginFooter: { alignItems: 'center', marginTop: 25, gap: 10 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { color: '#007bff', fontWeight: '500' },
});

export default VerifyMobileOTP;