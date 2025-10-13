import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from "react-native";
import api from "../../utils/apiLogger";
import { AddNotificationSubscriberEndpoint, apiUrl } from "../../config/config";
import { theme } from '../../styles/theme';

const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) { Alert.alert("Error", "Please enter an email address."); return; }
        setLoading(true);
        try {
            await api.post(`${apiUrl}${AddNotificationSubscriberEndpoint}`, { email, status: true });
            Alert.alert("Success", "Thank you for subscribing!");
            setEmail("");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.newsletterSection}>
            <View style={styles.newsletterContent}>
                <Text style={styles.newsletterTitle}>
                    <Text style={{ color: theme.colors.primary }}>Subscribe to our newsletter</Text> to get timely updates.
                </Text>
                <View style={styles.formContainer}>
                    <TextInput
                        placeholder="Enter email id"
                        style={styles.newsletterInput}
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Subscribe</Text>}
                    </TouchableOpacity>
                </View>
            </View>
            <Image source={require('../../assets/img/ui/daily_news.png')} style={styles.newsletterImage} resizeMode="contain" />
        </View>
    );
};

const styles = StyleSheet.create({
    newsletterSection: { backgroundColor: '#e2e7fa', borderRadius: 40, padding: 20, margin: 15, alignItems: 'center' },
    newsletterContent: { alignItems: 'center', width: '100%' },
    newsletterTitle: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: theme.colors.textDark, lineHeight: 32 },
    formContainer: { width: '100%', alignItems: 'center', gap: 16 },
    newsletterInput: { width: '100%', borderRadius: 30, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.6)', fontSize: 16 },
    submitButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 30, alignItems: 'center', width: '100%' },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
    newsletterImage: { width: '80%', height: 200, marginTop: 20 },
});

export default Newsletter;