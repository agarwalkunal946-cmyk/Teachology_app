import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { pick, isCancel } from '@react-native-documents/picker';
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../../../styles/theme';
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import TryWithExampleButton from "../TryWithExampleButton";

const SummarizeText = ({ formFields, onSubmit, loading, handleFileUpload, uploadedFiles }) => {
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({ mode: 'onChange' });
    const originalTextValue = watch("originalText");
    const isTextDisabled = uploadedFiles && uploadedFiles.length > 0;
    const isFileDisabled = !!originalTextValue;

    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        const hasContent = uploadedFiles.length > 0 || !!originalTextValue;
        const otherFieldsValid = formFields.every(f => f.required && f.name !== 'originalText' ? !!watch(f.name) : true);
        setIsSubmitEnabled(hasContent && otherFieldsValid);
    }, [watch(), uploadedFiles]);

    const handleFilePick = async () => {
        try {
            const res = await pick({
                allowMultiSelection: true,
                type: ['application/pdf', 'image/*'],
            });
            handleFileUpload({ target: { files: res } });
        } catch (err) {
            if (!isCancel(err)) {
                Alert.alert("Error", "Could not pick document.");
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.pageWrapper}>
            <View style={styles.header}>
                <View style={styles.titleContainer}><Text style={styles.titlePart1}>Summarize </Text><Text style={styles.titlePart2}>Text</Text></View>
                <TryWithExampleButton toolName="SummarizeText" formFields={formFields} handleInputChange={(name, val) => setValue(name, val, {shouldValidate: true})} handleSelectChange={(val, name) => setValue(name, val, {shouldValidate: true})} setValue={setValue} />
            </View>

            {formFields.filter(f => f.name !== 'originalText').map(field => (
                <View key={field.name} style={styles.fieldWrapper}>
                    <View style={styles.labelContainer}><Text style={styles.labelText}>{field.label}{field.required && '*'}</Text><InfoTooltip text={tooltips.SummarizeText?.[field.name]?.tooltip} /></View>
                    <Controller
                        control={control} name={field.name} rules={{ required: field.required }}
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputBase, errors[field.name] && styles.inputError]}>
                                {field.type === 'select' ?
                                    <RNPickerSelect onValueChange={onChange} items={field.options.map(o => ({ label: o, value: o }))} value={value} placeholder={{ label: field.placeholder, value: null }} /> :
                                    <TextInput style={styles.input} keyboardType={field.type === 'number' ? 'numeric' : 'default'} placeholder={field.placeholder} onChangeText={onChange} value={value} />
                                }
                            </View>
                        )}
                    />
                </View>
            ))}

            <View style={styles.fieldWrapper}>
                <View style={styles.labelContainer}><Text style={styles.labelText}>Upload Document</Text><InfoTooltip text="Upload a document to summarize." /></View>
                <TouchableOpacity style={[styles.uploadBox, isFileDisabled && styles.disabled]} onPress={handleFilePick} disabled={isFileDisabled}>
                    <Text style={styles.uploadText}>{uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : "Upload your document"}</Text>
                </TouchableOpacity>
            </View>

            <Controller
                control={control} name="originalText"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={[styles.inputBase, styles.textarea, isTextDisabled && styles.disabled]} multiline numberOfLines={5} placeholder="Or paste your text here..." onChangeText={onChange} onBlur={onBlur} value={value} editable={!isTextDisabled} />
                )}
            />
            {errors.originalText && !uploadedFiles.length && <Text style={styles.errorMessage}>This field is required if no file is uploaded.</Text>}

            <TouchableOpacity style={[styles.submitButton, (!isSubmitEnabled || loading) && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={!isSubmitEnabled || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Summary</Text>}
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
    inputBase: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16, minHeight: 52, justifyContent: 'center' },
    input: { fontSize: 16 },
    textarea: { height: 140, textAlignVertical: 'top', paddingTop: 16 },
    uploadBox: { backgroundColor: '#f6f5ff', minHeight: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    uploadText: { color: '#5a5a5a' },
    disabled: { backgroundColor: '#f0f0f0', opacity: 0.7 },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
    inputError: { borderColor: 'red' },
    errorMessage: { color: 'red' }
});

export default SummarizeText;