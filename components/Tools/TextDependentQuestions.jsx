import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import RNPickerSelect from 'react-native-picker-select';
import { pick, isCancel } from '@react-native-documents/picker';
import { theme } from '../../../styles/theme';
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import TryWithExampleButton from "../TryWithExampleButton";

const TextDependentQuestions = ({ formFields, onSubmit, loading, websearch, setWebsearch, uploadedFiles, handleFileUpload }) => {
    const { control, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
    const selectedContentType = watch("uploadContentType", "Plain Text");

    useEffect(() => {
        setWebsearch(selectedContentType !== "Document");
        if (selectedContentType !== "Document") handleFileUpload({ target: { files: [] } });
        if (selectedContentType !== "Plain Text") setValue("description", "");
    }, [selectedContentType]);

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
                <View style={styles.titleContainer}><Text style={styles.titlePart1}>Smart Quiz </Text><Text style={styles.titlePart2}>Generator</Text></View>
                <TryWithExampleButton toolName="TextDependentQuestions" formFields={formFields} handleInputChange={(name, val) => setValue(name, val)} handleSelectChange={(val, name) => setValue(name, val)} setValue={setValue} />
            </View>

            {formFields.map(field => {
                if (field.name === "description" && selectedContentType !== "Plain Text") return null;
                return (
                    <View key={field.name} style={styles.fieldWrapper}>
                        <View style={styles.labelContainer}><Text style={styles.labelText}>{field.label}{field.required && ' *'}</Text><InfoTooltip text={tooltips.TextDependentQuestions?.[field.name]?.tooltip} /></View>
                        <Controller
                            control={control} name={field.name} rules={{ required: field.required }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[styles.inputBase, errors[field.name] && styles.inputError]}>
                                    {field.type === 'select' ?
                                        <RNPickerSelect onValueChange={onChange} items={field.options.map(o => ({ label: o, value: o }))} value={value} placeholder={{ label: field.placeholder, value: null }} /> :
                                        <TextInput style={[styles.input, field.type === 'textarea' && styles.textarea]} multiline={field.type === 'textarea'} keyboardType={field.type === 'number' ? 'numeric' : 'default'} placeholder={field.placeholder} onChangeText={onChange} onBlur={onBlur} value={value} />
                                    }
                                </View>
                            )}
                        />
                        {errors[field.name] && <Text style={styles.errorMessage}>{errors[field.name].message}</Text>}
                    </View>
                )
            })}

            {selectedContentType === "Document" && (
                <View style={styles.fieldWrapper}>
                    <View style={styles.labelContainer}><Text style={styles.labelText}>Upload Document *</Text><InfoTooltip text="Upload a document for question generation." /></View>
                    <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
                        <Text>{uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : "Upload your document"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {selectedContentType !== "Document" && (
                <View style={styles.webSearchContainer}>
                    <InfoTooltip text="Allow AI to search the web for context." /><Text style={styles.labelText}>Web search</Text>
                    <Switch value={websearch} onValueChange={setWebsearch} trackColor={{ false: "#767577", true: theme.colors.primary }} thumbColor={"#f4f3f4"} />
                </View>
            )}

            <TouchableOpacity style={[styles.submitButton, !isValid || loading]} onPress={handleSubmit(onSubmit)} disabled={!isValid || loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Questions</Text>}
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
    textarea: { minHeight: 120, textAlignVertical: 'top', paddingTop: 16 },
    inputError: { borderColor: 'red' },
    errorMessage: { color: 'red' },
    uploadBox: { backgroundColor: '#f6f5ff', minHeight: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
    webSearchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
});

export default TextDependentQuestions;