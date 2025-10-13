import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from '../utils/apiLogger'; // Asegúrate de que la ruta sea correcta
import { sendOtpEndpoint, apiUrl } from '../config/config'; // Asegúrate de que la ruta sea correcta

function EnterIdentifier() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Formato de correo electrónico no válido.");
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
      const response = await api.post(`${apiUrl}${sendOtpEndpoint}`, payload);
      
      if (response.data.status === 200) {
        Alert.alert("Éxito", response.data.message || "OTP enviado con éxito. Redirigiendo...");
        
        const currentEmail = email;
        setEmail("");
        setEmailError("");

        // Navegar a la pantalla de verificación de OTP
        navigation.navigate("VerifyMobileOtp", { identifier: currentEmail });

      } else {
        Alert.alert("Error", response.data.message || "No se pudo enviar el OTP.");
      }
    } catch (error) {
      const message = error.response?.data?.message || "No se pudo enviar el OTP. Por favor, inténtalo de nuevo.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Iniciar sesión con OTP</Text>
          <Text style={styles.subtitle}>Introduce tu correo electrónico para obtener un OTP</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Image
                source={require("../assets/img/login/envelope.png")} // Asegúrate de que la ruta sea correcta
                style={{ width: 18, height: 18, tintColor: '#888' }}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.errorContainer}>
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Recuerdas tu contraseña?{" "}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Inicia sesión aquí
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    minHeight: 24,
    justifyContent: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    paddingTop: 4,
  },
  submitButton: {
    backgroundColor: '#443FE1',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a9a7e0',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#443FE1',
    fontWeight: 'bold',
  },
});

export default EnterIdentifier;