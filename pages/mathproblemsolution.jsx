import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MathView from "react-native-math-view";
import Markdown from "react-native-markdown-display";
import Clipboard from '@react-native-clipboard/clipboard';
import api from '../utils/apiLogger';
import { explainLineEndpoint, apiUrl } from "../../src/config/config";
import Icon from 'react-native-vector-icons/Ionicons';

const cleanLatexString = (str) => str ? str.replace(/\\f/g, "\\").replace(/\\rac/g, "\\frac").replace(/\\sqt/g, "\\sqrt") : "";

const Solution = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { solutionData = "[]", toolTitle = "Solución" } = route.params || {};

  let solutionArray = [];
  try {
    solutionArray = Array.isArray(solutionData) ? solutionData : JSON.parse(solutionData);
  } catch (err) { console.error("Invalid solution JSON:", err); }

  const [showModal, setShowModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");

  const fetchExplanation = async (line) => {
    setShowModal(true);
    setIsLoading(true);
    setExplanation("");
    try {
      const response = await api.post(`${apiUrl}${explainLineEndpoint}`, { entire_solution: solutionArray, clicked_line: line });
      setExplanation(response.data?.explanation || "No se pudo obtener una explicación.");
    } catch (err) {
      setExplanation("Error al obtener la explicación. Inténtalo de nuevo.");
    } finally { setIsLoading(false); }
  };

  const handleAskAiClick = (line) => {
    setSelectedLine(line);
    fetchExplanation(line);
  };
  
  const handleCopy = () => {
    Clipboard.setString(explanation);
    // Podrías mostrar un toast o alerta aquí
  };

  const renderMathContent = (content, isExplanation = false) => {
    if (!content) return null;
    return <MathView math={cleanLatexString(content)} style={isExplanation ? styles.explanationMath : styles.lineMath} />;
  };

  return (
    <ScrollView style={styles.page}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Icon name="arrow-back" size={20} color="white"/><Text style={{color: 'white'}}> Volver</Text></TouchableOpacity>
      <Modal visible={showModal} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Explicación de IA</Text>
                <Text>Preguntaste sobre esta línea:</Text>
                <MathView math={cleanLatexString(selectedLine)} />
                <Text>Aquí tienes una explicación:</Text>
                {isLoading ? <ActivityIndicator/> : <Markdown>{cleanLatexString(explanation)}</Markdown>}
                <View style={styles.modalFooter}>
                    <TouchableOpacity onPress={handleCopy}><Text>Copiar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowModal(false)}><Text>Cerrar</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <Text style={styles.solutionTitle}>{toolTitle}</Text>

      {solutionArray.length > 0 ? (
        solutionArray.map((step, stepIndex) => (
          <View key={stepIndex} style={styles.solutionStep}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            {step.content.map((lineItem, lineIndex) => (
              <View key={lineIndex} style={styles.stepLine}>
                <View style={styles.mathContainer}>
                  {renderMathContent(lineItem.line)}
                  {stepIndex > 0 && stepIndex < solutionArray.length - 1 && (
                    <TouchableOpacity style={styles.askAiButton} onPress={() => handleAskAiClick(lineItem.line)}>
                      <Text style={styles.askAiText}>Obtener Explicación</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {lineItem.explanation && <View style={styles.lineExplanation}>{renderMathContent(lineItem.explanation, true)}</View>}
              </View>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.solutionEmpty}><Text>No hay soluciones disponibles</Text></View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    page: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
    backButton: { flexDirection: 'row', backgroundColor: '#443FE1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
    solutionTitle: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#1a1a1a' },
    solutionStep: { backgroundColor: '#fff', padding: 20, marginBottom: 24, borderRadius: 10, elevation: 3 },
    stepTitle: { fontSize: 22, fontWeight: '600', color: '#2c3e50', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 8 },
    stepLine: { marginBottom: 16 },
    mathContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
    lineMath: { minHeight: 40, flex: 1 },
    askAiButton: { backgroundColor: '#667eea', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 },
    askAiText: { color: 'white', fontWeight: '500' },
    lineExplanation: { marginTop: 8 },
    explanationMath: { minHeight: 40, backgroundColor: 'rgba(52, 152, 219, 0.05)' },
    solutionEmpty: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 8 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%' },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 20 },
});

export default Solution;