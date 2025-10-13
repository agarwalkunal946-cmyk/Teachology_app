import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { forgotPassword as forgotPasswordEndpoint, apiUrl } from "../../config/config";
import api from '../utils/apiLogger';
import { theme } from '../styles/theme';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleRequestResetLink = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Email is required");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`${apiUrl}${forgotPasswordEndpoint}`, { email });
            if (response.data.status === 200) {
                Alert.alert("Success", response.data.message || "A password reset link has been sent.");
                setEmail(""); 
            } else {
                Alert.alert("Error", response.data.message || "Failed to request password reset.");
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/img/login/4498897.jpg')} style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>No worries, we'll send you reset instructions.</Text>
                <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TouchableOpacity style={styles.button} onPress={handleRequestResetLink} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>← Back to Login</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 24, borderRadius: 24, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
    subtitle: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 28 },
    input: { width: '100%', height: 52, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 25, alignItems: 'center', width: '100%', marginBottom: 20 },
    buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    link: { color: theme.colors.primary, fontWeight: '600' },
});

export default ForgotPassword;