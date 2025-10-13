import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../utils/apiLogger";
import { resetPassword as resetPasswordEndpoint, apiUrl } from "../config/config";
import { theme } from '../styles/theme';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { token, email } = route.params || {};

    const handleResetPassword = async () => {
        if (newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`${apiUrl}${resetPasswordEndpoint}`, { email, token, new_password: newPassword });
            if (response.status === 200) {
                Alert.alert("Success", "Password reset successfully! Please log in.");
                navigation.navigate("Login");
            } else {
                Alert.alert("Error", response.data.message || "Failed to reset password.");
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
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your new password below</Text>
                <TextInput style={styles.input} placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                <TextInput style={styles.input} placeholder="Confirm New Password" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Remembered your password? Login here</Text>
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

export default ResetPassword;