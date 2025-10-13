import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import Toast from 'react-native-toast-message';
import api from "../../utils/apiLogger";
import { AddNotificationSubscriberEndpoint } from "../../config/config";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.VITE_APP_API_BASE_URL;

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Please enter an email address.' });
      return;
    }

    setLoading(true);

    try {
      await api.post(`${apiUrl}${AddNotificationSubscriberEndpoint}`, { email, status: true });
      Toast.show({ type: 'success', text1: 'Thank you for subscribing!' });
      setEmail("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      Toast.show({ type: 'error', text1: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.newsletterSection}>
      <View style={styles.newsletterContent}>
        <Text style={styles.newsletterTitle}>
          <Text style={styles.textPrimary}>Subscribe to our newsletter</Text> to get timely updates.
        </Text>
        <View style={styles.newsletterForm}>
          <TextInput
            style={styles.newsletterInput}
            placeholder="Enter email id"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Subscribe</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={{ uri: "/assets/img/teachology/6870f20cb44338cb05a82d44_Asset-2-2.png" }}
        style={styles.newsletterImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newsletterSection: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    alignItems: 'center',
  },
  newsletterContent: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  newsletterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  textPrimary: {
    color: '#443fe1',
  },
  newsletterForm: {
    width: '100%',
  },
  newsletterInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 50,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#443fe1',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newsletterImage: {
    width: 250,
    height: 180,
  },
});

export default Newsletter;