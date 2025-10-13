import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { login, google_login, apiUrl } from "../config/config";
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from '../styles/theme';
import api from "../utils/apiLogger";

const Login = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`${apiUrl}${login}`, { email, password });
            if (response.data.status === 200) {
                dispatch(setUser({
                    user: email.toLowerCase(),
                    token: response.data.access_token,
                    // ... other user details
                }));
            } else {
                Alert.alert("Login Failed", response.data.message || "Please check your credentials.");
            }
        } catch (error) {
            Alert.alert("Login Error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/img/login/4498897.jpg')} style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome!</Text>
                <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
                <TextInput style={styles.input} placeholder="Enter email id" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <View style={styles.passwordContainer}>
                    <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff color="#555" /> : <Eye color="#555" />}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                </TouchableOpacity>
                <Text style={styles.footerText}>Don’t have an account? <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Register here</Text></Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 24, borderRadius: 24 },
    title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    subtitle: { fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 28 },
    input: { width: '100%', height: 52, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16 },
    passwordContainer: { width: '100%', position: 'relative' },
    eyeIcon: { position: 'absolute', right: 15, top: 14 },
    button: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 25, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    footerText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    link: { color: theme.colors.primary, fontWeight: '700' },
});

export default Login;