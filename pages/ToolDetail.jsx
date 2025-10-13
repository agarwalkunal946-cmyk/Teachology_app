import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Switch, Alert, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { pick, isCancel } from '@react-native-documents/picker';

const selectUserId = (state) => '123';
const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
};

const ScreenLoader = () => (
  <View style={StyleSheet.absoluteFill}>
    <View style={styles.loaderOverlay}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  </View>
);

const GenericToolForm = ({ tool, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  return (
    <View>
      {tool.fields?.map(field => (
        <View key={field.name} style={styles.formGroup}>
          <Text style={styles.formLabel}>{field.label}</Text>
          <TextInput
            style={styles.formControl}
            placeholder={field.placeholder}
            placeholderTextColor="#999"
            onChangeText={(value) => handleInputChange(field.name, value)}
            multiline={field.type === 'textarea'}
            numberOfLines={field.type === 'textarea' ? 4 : 1}
          />
        </View>
      ))}
      <TouchableOpacity
        style={[styles.submitButton, { marginTop: 10 }]}
        onPress={() => onSubmit(formData)}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>Generate</Text>
      </TouchableOpacity>
    </View>
  );
};

const TextDependentQuestions = ({ onSubmit, loading }) => {
  const [websearch, setWebsearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = async () => {
    try {
      const results = await pick({
        type: ['*/*'],
        allowMultiSelection: true,
      });
      setUploadedFiles(results);
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Error', 'Could not pick the file.');
      }
    }
  };

  const submitForm = () => {
    onSubmit({ textInput, websearch, files: uploadedFiles });
  };

  return (
    <View style={styles.fullWidthContainer}>
      <Text style={styles.fullWidthTitle}>Text-Dependent Questions</Text>
       <TextInput
        style={[styles.formControl, { minHeight: 120, textAlignVertical: 'top' }]}
        placeholder="Paste text here or upload a file..."
        value={textInput}
        onChangeText={setTextInput}
        multiline
      />
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Text style={styles.uploadButtonText}>Upload Files ({uploadedFiles.length})</Text>
        </TouchableOpacity>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Web Search</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={websearch ? "#443fe1" : "#f4f3f4"}
            onValueChange={setWebsearch}
            value={websearch}
          />
        </View>
      </View>
       <TouchableOpacity style={styles.submitButton} onPress={submitForm} disabled={loading}>
        <Text style={styles.submitButtonText}>Generate Questions</Text>
      </TouchableOpacity>
    </View>
  );
};

const ToolDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const passedState = route.params?.tool;

  const [loading, setLoading] = useState(false);

  if (!passedState) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Tool data is missing.</Text>
      </SafeAreaView>
    );
  }

  const handleGenericSubmit = async (data) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 1500));
    setLoading(false);
    navigation.navigate('Output', { result: { response: "Generated content based on your input." }, toolTitle: passedState.title });
  };

  const renderToolComponent = () => {
    switch (passedState.subType) {
      case 'Text Dependent Questions':
        return <TextDependentQuestions onSubmit={handleGenericSubmit} loading={loading} />;
      default:
        return (
          <GenericToolForm
            tool={passedState}
            onSubmit={handleGenericSubmit}
            loading={loading}
          />
        );
    }
  };

  const hasCustomLayout = ['Text Dependent Questions'].includes(passedState.subType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        {hasCustomLayout ? (
          renderToolComponent()
        ) : (
          <View style={styles.toolDetailCard}>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: passedState.image }}
                style={styles.toolImage}
              />
              <Text style={styles.toolTitle}>{passedState.title}</Text>
              <Text style={styles.toolContent}>{passedState.content}</Text>
            </View>
            <View style={styles.cardBody}>
                {renderToolComponent()}
            </View>
          </View>
        )}
      </ScrollView>
      {loading && <ScreenLoader />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f8ff' },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 },
  backButtonText: { color: '#443fe1', fontWeight: '500' },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolDetailCard: {
    backgroundColor: '#fff', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  cardHeader: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cardBody: { padding: 24 },
  toolImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 15 },
  toolTitle: { fontSize: 24, fontWeight: '600', color: '#443fe1', marginBottom: 10 },
  toolContent: { fontSize: 16, color: '#757575', textAlign: 'center' },
  formGroup: { marginBottom: 15 },
  formLabel: { fontSize: 14, color: '#424242', fontWeight: '500', marginBottom: 6 },
  formControl: {
    padding: 12, fontSize: 16, color: '#212121',
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#e91e63', paddingVertical: 14, borderRadius: 25,
    alignItems: 'center', marginTop: 15,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fullWidthContainer: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12,
    width: '100%',
  },
  fullWidthTitle: { fontSize: 22, fontWeight: '600', color: '#443fe1', marginBottom: 20, textAlign: 'center' },
  optionsContainer: { marginVertical: 15, gap: 15 },
  uploadButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, alignItems: 'center' },
  uploadButtonText: { color: '#443fe1', fontWeight: '500' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLabel: { fontSize: 16, color: '#424242' },
});

export default ToolDetail;