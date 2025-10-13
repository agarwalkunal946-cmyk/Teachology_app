import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { registerEndpoint, apiUrl } from "../config/config";
import RNPickerSelect from 'react-native-picker-select';
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from '../styles/theme';
import api from "../utils/apiLogger";

const Signup = () => {
    const navigation = useNavigation();
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        
        try {
            const response = await api.post(`${apiUrl}${registerEndpoint}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (response.data.status === 201) {
                Alert.alert("Success", "Signup successful! Please log in.");
                navigation.navigate('Login');
            } else {
                Alert.alert("Signup Failed", response.data.message || "An error occurred.");
            }
        } catch (error) {
            Alert.alert("Signup Error", error.response?.data?.detail || "Something went wrong.");
        } finally { setLoading(false); }
    };

    const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    return (
        <ImageBackground source={require('../assets/img/login/4498897.jpg')} style={styles.container}>
            <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                <View style={styles.card}>
                    <Text style={styles.title}>Create Your Account</Text>
                    <TextInput style={styles.input} placeholder="Full Name *" onChangeText={val => handleChange('name', val)} />
                    <TextInput style={styles.input} placeholder="Email *" onChangeText={val => handleChange('email', val)} keyboardType="email-address" autoCapitalize="none" />
                    <TextInput style={styles.input} placeholder="Password *" onChangeText={val => handleChange('password', val)} secureTextEntry />
                    <TextInput style={styles.input} placeholder="Confirm Password *" onChangeText={val => handleChange('confirmPassword', val)} secureTextEntry />
                    <RNPickerSelect onValueChange={val => handleChange('role', val)} items={[{ label: 'Student', value: 'student' }, { label: 'Teacher', value: 'teacher' }]} style={pickerSelectStyles} placeholder={{ label: 'Select a role...', value: null }} />
                    <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Here</Text>}
                    </TouchableOpacity>
                    <Text style={styles.footerText}>Already have an account? <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Login</Text></Text>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    card: { backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 24, borderRadius: 24 },
    title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
    input: { height: 52, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
    button: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    footerText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    link: { color: theme.colors.primary, fontWeight: '700' },
});
const pickerSelectStyles = {
    inputIOS: styles.input,
    inputAndroid: styles.input,
};

export default Signup;