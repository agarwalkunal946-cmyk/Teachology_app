import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

function ResetEmail() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.loginContainer}>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              {isTabletOrLarger && (
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../assets/img/login/4498897.jpg')}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={styles.formContainer}>
                <View style={styles.formBody}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('../assets/logo.png')}
                      style={styles.logoIcon}
                    />
                    <Text style={styles.logoText}>TeachologyAI</Text>
                  </View>
                  <Text style={styles.title}>Enter Your Email</Text>
                  <Text style={styles.subtitle}>
                    To reset your password, please enter your registered email address. We will send you an OTP to verify your identity.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  loginContainer: { padding: 20, alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
    maxWidth: 900,
  },
  cardInner: { flexDirection: 'row' },
  imageContainer: { flex: 5 },
  image: { width: '100%', height: '100%' },
  formContainer: { flex: 7, justifyContent: 'center' },
  formBody: { padding: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoIcon: { width: 40, height: 40, marginRight: 12 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  title: { fontSize: 20, fontWeight: '500', marginBottom: 15, color: '#333' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 25, lineHeight: 22 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#343a40',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007bff', textAlign: 'center' },
});

export default ResetEmail;