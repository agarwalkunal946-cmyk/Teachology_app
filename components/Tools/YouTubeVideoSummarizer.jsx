import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { theme } from '../../../styles/theme';

const YouTubeVideoSummarizer = ({ formFields, onSubmit, loading }) => {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {formFields.map(field => (
                <View key={field.name} style={styles.fieldWrapper}>
                    <Text style={styles.label}>{field.label}{field.required && ' *'}</Text>
                    <Controller
                        control={control}
                        name={field.name}
                        rules={{ 
                            required: field.required ? `${field.label} is required.` : false,
                            pattern: field.name === 'youtubeUrl' ? {
                                value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                                message: "Please enter a valid YouTube URL."
                            } : undefined
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors[field.name] && styles.inputError]}
                                placeholder={field.placeholder}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                value={value}
                                autoCapitalize="none"
                            />
                        )}
                    />
                    {errors[field.name] && <Text style={styles.error}>{errors[field.name].message}</Text>}
                </View>
            ))}
            <TouchableOpacity style={[styles.button, (!isValid || loading) && styles.disabledButton]} onPress={handleSubmit(onSubmit)} disabled={!isValid || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Summary</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, flexGrow: 1 },
    fieldWrapper: { marginBottom: 15 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 12, fontSize: 16, backgroundColor: 'white' },
    inputError: { borderColor: 'red' },
    error: { color: 'red', marginTop: 4 },
    button: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#aaa' },
});

export default YouTubeVideoSummarizer;