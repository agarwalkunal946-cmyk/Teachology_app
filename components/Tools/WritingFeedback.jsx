import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../../../styles/theme';
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import TryWithExampleButton from "../TryWithExampleButton";

const WritingFeedback = ({ formFields, onSubmit, loading }) => {
    const { control, handleSubmit, setValue, formState: { errors, isValid } } = useForm({ mode: 'onChange' });

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}>
                <View style={styles.titleContainer}><Text style={styles.titlePart1}>Writing </Text><Text style={styles.titlePart2}>Feedback</Text></View>
                <TryWithExampleButton toolName="WritingFeedback" formFields={formFields} handleInputChange={(name, val) => setValue(name, val)} handleSelectChange={(val, name) => setValue(name, val)} setValue={setValue} />
            </View>

            {formFields.map(field => (
                <View key={field.name} style={styles.fieldWrapper}>
                    <View style={styles.labelContainer}><Text style={styles.labelText}>{field.label}{field.required && ' *'}</Text><InfoTooltip text={tooltips.WritingFeedback?.[field.name]?.tooltip} /></View>
                    <Controller
                        control={control} name={field.name} rules={{ required: field.required }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={[styles.inputBase, errors[field.name] && styles.inputError]}>
                                {field.type === 'select' ? 
                                    <RNPickerSelect onValueChange={onChange} items={field.options.map(o => ({ label: o, value: o }))} value={value} placeholder={{ label: field.placeholder, value: null }} /> :
                                    <TextInput style={[styles.input, field.type === 'textarea' && styles.textarea]} multiline={field.type === 'textarea'} numberOfLines={5} placeholder={field.placeholder} onChangeText={onChange} onBlur={onBlur} value={value} />
                                }
                            </View>
                        )}
                    />
                    {errors[field.name] && <Text style={styles.errorMessage}>{errors[field.name].message}</Text>}
                </View>
            ))}

            <TouchableOpacity style={[styles.submitButton, !isValid || loading]} onPress={handleSubmit(onSubmit)} disabled={!isValid || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Feedback</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, flexGrow: 1, backgroundColor: '#f8faff' },
    header: { marginBottom: 24 },
    titleContainer: { flexDirection: 'row' },
    titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
    fieldWrapper: { marginBottom: 20 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    labelText: { fontSize: 16, fontWeight: '700' },
    inputBase: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16 },
    input: { minHeight: 52 },
    textarea: { minHeight: 140, textAlignVertical: 'top', paddingTop: 16 },
    inputError: { borderColor: 'red' },
    errorMessage: { color: 'red' },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
});

export default WritingFeedback;