import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { mathProblemSolverEndpoint, apiUrl } from '../../config/config';
import api from '../../utils/apiLogger';
import { useSelector } from 'react-redux';
import { selectUserId } from "../../redux/authSlice";
import tooltips from "../../data/fieldTooltips.json";
import InfoTooltip from "../InfoTooltip";
import { theme } from '../../styles/theme';

const MathProblemSolver = ({ onSubmit, setLoading }) => {
    const [image, setImage] = useState(null);
    const userId = useSelector(selectUserId);

    const selectImage = () => {
        ImagePicker.openPicker({
            cropping: true,
            width: 1024,
            height: 768,
            mediaType: 'photo',
            cropperToolbarTitle: 'Crop the Math Problem',
        }).then(img => {
            setImage({
                uri: img.path,
                width: img.width,
                height: img.height,
                mime: img.mime,
                name: img.filename || `image-${Date.now()}.jpg`,
            });
        }).catch(err => {
            if (err.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', 'Could not select image.');
            }
        });
    };

    const takePhoto = () => {
        ImagePicker.openCamera({
            cropping: true,
            width: 1024,
            height: 768,
            mediaType: 'photo',
            cropperToolbarTitle: 'Crop the Math Problem',
        }).then(img => {
            setImage({
                uri: img.path,
                width: img.width,
                height: img.height,
                mime: img.mime,
                name: `camera-${Date.now()}.jpg`,
            });
        }).catch(err => {
            if (err.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', 'Could not open camera.');
            }
        });
    };

    const handleMathSubmit = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('user_id', userId || "");
            formData.append('uploaded_file', {
                uri: image.uri,
                type: image.mime,
                name: image.name,
            });

            const response = await api.post(`${apiUrl}${mathProblemSolverEndpoint}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSubmit(response.data);
        } catch (error) {
            onSubmit(error.response?.data || { status: 500, result: 'Failed to solve problem.' });
        } finally {
            setLoading(false);
        }
    };

    return (
       <View style={styles.pageWrapper}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titlePart1}>Math Problem </Text>
                    <Text style={styles.titlePart2}>Solver</Text>
                </View>
                <Text style={styles.description}>Upload an image, crop the problem, and get a solution.</Text>
            </View>
            <View style={styles.contentContainer}>
                {!image ? (
                    <View style={styles.uploadArea}>
                        <TouchableOpacity style={styles.uploadBox} onPress={selectImage}>
                            <InfoTooltip text={tooltips.MathProblemSolver?.uploadedImage?.tooltip || ""} />
                            <Text style={styles.uploadIcon}>📁</Text>
                            <Text style={styles.uploadText}>Upload Image from Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                            <Text style={styles.cameraIcon}>📷</Text>
                            <Text style={styles.cameraButtonText}>Use Camera</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.previewContainer}>
                            <Text style={styles.cropperInstructions}>Selected Problem:</Text>
                            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="contain" />
                            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>× Remove</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.submitButton} onPress={handleMathSubmit}>
                            <Text style={styles.submitButtonText}>Solve Problem</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
       </View>
    );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, flexGrow: 1, backgroundColor: '#f8faff' },
    header: { alignItems: 'center', marginBottom: 24 },
    titleContainer: { flexDirection: 'row' },
    titlePart1: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary },
    titlePart2: { fontSize: 28, fontWeight: '500', color: '#2a2a2a' },
    description: { color: '#6b7280', fontSize: 16, marginTop: 8, textAlign: 'center' },
    contentContainer: { flex: 1, alignItems: 'center', gap: 20 },
    uploadArea: { width: '100%', alignItems: 'center', gap: 16 },
    uploadBox: { width: '100%', borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 12, padding: 32, alignItems: 'center', backgroundColor: 'white', gap: 8 },
    uploadIcon: { fontSize: 40 },
    uploadText: { fontSize: 16, fontWeight: '500', color: '#374151' },
    cameraButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8 },
    cameraIcon: { fontSize: 20 },
    cameraButtonText: { color: theme.colors.primary, fontWeight: '500' },
    previewContainer: { width: '100%', alignItems: 'center', gap: 12 },
    cropperInstructions: { alignSelf: 'flex-start', fontWeight: '500' },
    previewImage: { width: '100%', height: 250, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    removeButton: { alignSelf: 'flex-end', backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    removeButtonText: { color: '#b91c1c' },
    submitButton: { width: '100%', padding: 14, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center' },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: '500' },
});

export default MathProblemSolver;