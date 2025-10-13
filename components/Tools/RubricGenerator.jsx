import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../../../styles/theme';
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import TryWithExampleButton from "../TryWithExampleButton";

const RubricGenerator = ({ formFields, onSubmit, loading }) => {
    const { control, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });

    const handleSelectChange = (value, name) => setValue(name, value, { shouldValidate: true });
    const handleInputChange = (name, value) => setValue(name, value, { shouldValidate: true });

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titlePart1}>Rubric </Text>
                    <Text style={styles.titlePart2}>Generator</Text>
                </View>
                <TryWithExampleButton toolName="RubricGenerator" formFields={formFields} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} setValue={setValue} />
            </View>

            {formFields.map((field) => (
                <View key={field.name} style={styles.fieldWrapper}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>{field.label}{field.required && ' *'}</Text>
                        <InfoTooltip text={tooltips.RubricGenerator?.[field.name]?.tooltip} />
                    </View>
                    <Controller
                        control={control}
                        name={field.name}
                        rules={{ required: field.required ? `${field.label} is required.` : false }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[styles.inputBase, errors[field.name] && styles.inputError]}>
                                {field.type === 'select' ? (
                                    <RNPickerSelect onValueChange={onChange} items={field.options.map(o => ({ label: o, value: o }))} style={pickerSelectStyles} value={value} placeholder={{ label: field.placeholder, value: null }} />
                                ) : (
                                    <TextInput
                                        style={[styles.input, field.type === 'textarea' && styles.textarea]}
                                        multiline={field.type === 'textarea'}
                                        numberOfLines={field.type === 'textarea' ? 4 : 1}
                                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                        placeholder={field.placeholder}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                    />
                                )}
                            </View>
                        )}
                    />
                    {errors[field.name] && <Text style={styles.errorMessage}>{errors[field.name].message}</Text>}
                </View>
            ))}
            <TouchableOpacity style={[styles.submitButton, (!isValid || loading) && styles.disabledButton]} onPress={handleSubmit(onSubmit)} disabled={!isValid || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Rubric</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, backgroundColor: '#f8faff', flexGrow: 1 },
    header: { marginBottom: 24 },
    titleContainer: { flexDirection: 'row', marginBottom: 8 },
    titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
    fieldWrapper: { marginBottom: 20 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
    labelText: { fontSize: 16, fontWeight: '700', color: '#242424' },
    inputBase: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16 },
    inputError: { borderColor: 'red' },
    input: { height: 52, fontSize: 16 },
    textarea: { height: 120, textAlignVertical: 'top', paddingTop: 16 },
    errorMessage: { color: 'red', marginTop: 4 },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#ccc' },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: { height: 52, fontSize: 16, color: '#242424' },
    inputAndroid: { height: 52, fontSize: 16, color: '#242424' },
});

export default RubricGenerator;