import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { apiUrl, contactusEndpoint } from "../config/config";
import api from '../utils/apiLogger';
import { theme } from '../styles/theme';

const Contact = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', contactNumber: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    const handleSubmit = async () => {
        if (!form.firstName || !form.email || !form.subject || !form.message) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post(`${apiUrl}${contactusEndpoint}`, {
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email,
                contactNumber: form.contactNumber,
                subject: form.subject,
                message: form.message,
            });
            Alert.alert('Success', 'Your message has been sent!');
            setForm({ firstName: '', lastName: '', email: '', contactNumber: '', subject: '', message: '' });
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Contact Us</Text>
                <Text style={styles.formSubtitle}>We'd love to hear from you. Fill out the form below.</Text>
            </View>
            <TextInput style={styles.input} placeholder="First Name *" value={form.firstName} onChangeText={val => handleChange('firstName', val)} />
            <TextInput style={styles.input} placeholder="Last Name" value={form.lastName} onChangeText={val => handleChange('lastName', val)} />
            <TextInput style={styles.input} placeholder="Email *" value={form.email} onChangeText={val => handleChange('email', val)} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Phone Number" value={form.contactNumber} onChangeText={val => handleChange('contactNumber', val)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Subject *" value={form.subject} onChangeText={val => handleChange('subject', val)} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Message *" multiline numberOfLines={4} value={form.message} onChangeText={val => handleChange('message', val)} />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Send Message</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f8faff', flexGrow: 1 },
    formHeader: { alignItems: 'center', marginBottom: 30 },
    formTitle: { fontSize: 28, fontWeight: 'bold' },
    formSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
    textArea: { height: 120, textAlignVertical: 'top' },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 25, alignItems: 'center' },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default Contact;