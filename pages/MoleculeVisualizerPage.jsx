import React, { useState, Suspense } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Dimensions
} from "react-native";
import Markdown from "react-native-markdown-display";
import MoleculeViewer from "./MoleculeViewer";
import { Generate3d, apiUrl } from "../config/config";
import api from "../utils/apiLogger";
import { useSelector } from "react-redux";
import { selectUserId } from "../redux/authSlice";

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 992;

function MoleculeVisualizerPage() {
  const [inputValue, setInputValue] = useState("");
  const [moleculeData, setMoleculeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = useSelector(selectUserId);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    setError("");
    setLoading(true);
    setMoleculeData(null);
    try {
      const response = await api.post(`${apiUrl}/${Generate3d}`, { name: inputValue, user_id: userId });
      setMoleculeData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "No se encontró ningún resultado");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.pageWrapper}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
          <View style={styles.controlsContainer}>
            <View>
              <View style={styles.fieldWrapper}>
                <Text style={styles.labelText}>Introduce la Fórmula</Text>
                <TextInput
                  style={[styles.inputBase, styles.input]}
                  value={inputValue}
                  onChangeText={(text) => setInputValue(text.toUpperCase())}
                  placeholder="Ejemplo: H2O"
                  onSubmitEditing={handleSubmit}
                />
              </View>
              <TouchableOpacity
                style={[styles.submitButton, (loading || !inputValue.trim()) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading || !inputValue.trim()}
              >
                <Text style={styles.submitButtonText}>{loading ? "Generando..." : "Visualizar"}</Text>
              </TouchableOpacity>
            </View>
            {moleculeData && (
              <ScrollView>
                <View style={styles.infoDetails}>
                  {moleculeData.chemical_formula_from_gemini && <Text style={styles.infoTitle}>{moleculeData.chemical_formula_from_gemini}</Text>}
                  <Text style={styles.infoText}>FÓRMULA: {moleculeData.chemical_formula_from_gemini}</Text>
                  {moleculeData.description_from_gemini && (
                    <View style={styles.description}>
                      <Text style={styles.descriptionTitle}>Descripción</Text>
                      <Markdown>{moleculeData.description_from_gemini}</Markdown>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.viewerContainer}>
            {error && <View style={styles.statusOverlay}><Text style={styles.errorText}>{error}</Text></View>}
            {loading && <View style={styles.statusOverlay}><ActivityIndicator size="large" color="#443fe1" /></View>}
            {!loading && moleculeData && (
              <Suspense fallback={<View style={styles.statusOverlay}><Text>Cargando Activos 3D...</Text></View>}>
                <MoleculeViewer moleculeData={moleculeData} />
              </Suspense>
            )}
            {!loading && !moleculeData && !error && (
              <View style={styles.statusOverlay}><Text>Introduce una molécula para visualizar.</Text></View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, flexDirection: 'row', gap: 24, padding: 16 },
  pageWrapperMobile: { flexDirection: 'column' },
  controlsContainer: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 16, padding: 24, gap: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', maxHeight: '80vh' },
  fieldWrapper: { gap: 8, marginBottom: 16 },
  labelText: { color: '#242424', fontSize: 14, fontWeight: '600' },
  inputBase: { borderRadius: 8, paddingHorizontal: 16, height: 48, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  input: { height: '100%', fontSize: 16, color: '#242424' },
  submitButton: { backgroundColor: '#443FE1', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#a3a1f3' },
  infoDetails: { marginTop: 16, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  infoTitle: { fontSize: 28, color: '#2a2a2a', marginBottom: 12, fontWeight: '700' },
  infoText: { color: '#34495e', lineHeight: 24, marginVertical: 4 },
  description: { marginTop: 16 },
  descriptionTitle: { fontSize: 18, color: '#443fe1', marginBottom: 8, fontWeight: '700' },
  viewerContainer: { flex: isMobile ? 1 : 1.5, backgroundColor: '#f8f9fa', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', minHeight: isMobile ? 400 : undefined },
  statusOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248, 249, 250, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#443fe1', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default MoleculeVisualizerPage;