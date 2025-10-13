import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Dimensions
} from "react-native";
import Plotly from 'react-native-plotly';
import { v4 as uuidv4 } from "uuid";
import RNPickerSelect from 'react-native-picker-select';
import api from "../utils/apiLogger";
import { visualizeMultipleEndpoint, apiUrl } from "../config/config";

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 992;

function MathVisualizer() {
  const [equations, setEquations] = useState([{ id: uuidv4(), value: "y = x**2" }]);
  const [dimension, setDimension] = useState(1);
  const [variables, setVariables] = useState(["x"]);
  const [plotRanges, setPlotRanges] = useState({ x: [-10, 10] });
  const [numPoints, setNumPoints] = useState(100);
  const [parameters, setParameters] = useState({});
  const [parameterInput, setParameterInput] = useState("");
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dimensionOptions = [
    { label: "1D (y = f(x))", value: 1 },
    { label: "2D (z = f(x,y))", value: 2 },
    { label: "3D (f(x,y,z)=0)", value: 3 },
  ];

  useEffect(() => {
    let initialEquationValue = "y = x**2";
    if (dimension === 1) {
      setVariables(["x"]);
      setPlotRanges({ x: [-10, 10] });
    } else if (dimension === 2) {
      setVariables(["x", "y"]);
      setPlotRanges({ x: [-10, 10], y: [-10, 10] });
      initialEquationValue = "z = x**2 + y**2";
    } else if (dimension === 3) {
      setVariables(["x", "y", "z"]);
      setPlotRanges({ x: [-5, 5], y: [-5, 5], z: [-5, 5] });
      initialEquationValue = "x**2 + y**2 + z**2 - 1 = 0";
    }
    setEquations([{ id: uuidv4(), value: initialEquationValue }]);
  }, [dimension]);

  const handleEquationChange = (id, value) => setEquations(prev => prev.map(eq => (eq.id === id ? { ...eq, value } : eq)));
  const addEquation = () => setEquations(prev => [...prev, { id: uuidv4(), value: "" }]);
  const removeEquation = (id) => {
    if (equations.length > 1) {
      setEquations(prev => prev.filter(eq => eq.id !== id));
    }
  };

  const handleRangeChange = (variable, index, value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) return;
    setPlotRanges(prev => {
        const newRange = [...(prev[variable] || [0, 0])];
        newRange[index] = parsedValue;
        return { ...prev, [variable]: newRange };
    });
  };
  
  const handleParameterInputChange = (text) => {
    setParameterInput(text);
    try {
      const parsedParams = text.split(',').map(p => p.trim().split('=')).reduce((obj, [k, v]) => (k && v ? { ...obj, [k.trim()]: parseFloat(v.trim()) } : obj), {});
      setParameters(parsedParams);
    } catch (err) {}
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError("");
    setPlotData(null);
    const equationStrings = equations.map(eq => eq.value).filter(val => val.trim());
    if (equationStrings.length === 0) {
      setError("Por favor, introduce al menos una ecuación.");
      setLoading(false);
      return;
    }
    const payload = {
      equations_str: equationStrings,
      dimension: dimension,
      variables, plot_ranges: plotRanges,
      num_points: numPoints,
      parameters: Object.keys(parameters).length > 0 ? parameters : null,
    };
    try {
      const response = await api.post(`${apiUrl}${visualizeMultipleEndpoint}`, payload);
      setPlotData(response.data.plot_json);
    } catch (err) {
      setError(err.response?.data?.detail || "No se encontró ningún resultado");
    } finally {
      setLoading(false);
    }
  }, [equations, dimension, variables, plotRanges, numPoints, parameters]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (equations.some(eq => eq.value.trim())) {
        handleSubmit();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [equations, dimension, plotRanges, numPoints, parameters]);

  return (
    <SafeAreaView style={styles.pageWrapper}>
        <ScrollView style={isMobile && { flex: 1 }}>
            <View style={isMobile ? styles.pageWrapperMobile : styles.pageWrapper}>
                <View style={styles.controlsContainer}>
                    {equations.map((eq, index) => (
                    <View key={eq.id} style={styles.fieldWrapper}>
                        <Text style={styles.labelText}>Ecuación {index + 1}</Text>
                        <View style={styles.inputBase}>
                        <TextInput style={styles.input} value={eq.value} onChangeText={(text) => handleEquationChange(eq.id, text)} placeholder="ej., y = x**2" />
                        {equations.length > 1 && <TouchableOpacity onPress={() => removeEquation(eq.id)}><Text style={styles.removeButton}>×</Text></TouchableOpacity>}
                        </View>
                    </View>
                    ))}
                    <TouchableOpacity onPress={addEquation} style={styles.addButton}><Text style={styles.addButtonText}>+ Añadir Ecuación</Text></TouchableOpacity>

                    <View style={styles.gridControls}>
                        <View style={styles.fieldWrapperFull}><Text style={styles.labelText}>Dimensión</Text><RNPickerSelect onValueChange={(value) => setDimension(value)} items={dimensionOptions} style={pickerSelectStyles} value={dimension} /></View>
                        {variables.map((varName) => (
                            <View key={varName} style={styles.fieldWrapperHalf}><Text style={styles.labelText}>Rango de {varName}</Text>
                            <View style={styles.rangeInputs}>
                                <TextInput style={[styles.inputBase, styles.input, {width: '48%'}]} keyboardType="numeric" defaultValue={String(plotRanges[varName]?.[0] ?? "")} onEndEditing={(e) => handleRangeChange(varName, 0, e.nativeEvent.text)} />
                                <TextInput style={[styles.inputBase, styles.input, {width: '48%'}]} keyboardType="numeric" defaultValue={String(plotRanges[varName]?.[1] ?? "")} onEndEditing={(e) => handleRangeChange(varName, 1, e.nativeEvent.text)} />
                            </View>
                            </View>
                        ))}
                        <View style={styles.fieldWrapperFull}><Text style={styles.labelText}>Parámetros</Text><TextInput style={[styles.inputBase, styles.input]} value={parameterInput} onChangeText={handleParameterInputChange} placeholder="ej., a=1, b=2" /></View>
                        <View style={styles.fieldWrapperFull}><Text style={styles.labelText}>Puntos</Text><TextInput style={[styles.inputBase, styles.input]} value={String(numPoints)} keyboardType="numeric" onChangeText={text => setNumPoints(parseInt(text, 10) || 100)} /></View>
                    </View>
                </View>
                <View style={styles.plotContainer}>
                    {error && <View style={styles.statusOverlay}><Text style={styles.errorText}>{error}</Text></View>}
                    {loading && <View style={styles.statusOverlay}><ActivityIndicator size="large" color="#443fe1" /><Text>Generando Gráfico...</Text></View>}
                    {plotData && <Plotly data={plotData.data} layout={{...plotData.layout, autosize: true}} style={{width: '100%', height: '100%'}} debug enableFullPlotly />}
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, flexDirection: 'row', gap: 24, padding: 16 },
  pageWrapperMobile: { flexDirection: 'column' },
  controlsContainer: { flex: isMobile ? 0 : 1, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 16, padding: 24, gap: 16, maxHeight: isMobile ? undefined : '85vh' },
  fieldWrapper: { gap: 8 },
  labelText: { color: '#242424', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputBase: { borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: '100%', fontSize: 14, color: '#242424' },
  removeButton: { fontSize: 24, color: '#adb5bd', marginLeft: 8 },
  addButton: { backgroundColor: 'rgba(230, 230, 255, 0.7)', borderWidth: 1, borderColor: '#443fe1', borderStyle: 'dashed', padding: 10, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#443fe1', fontWeight: '600' },
  gridControls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  fieldWrapperFull: { width: '100%', marginBottom: 16 },
  fieldWrapperHalf: { width: '48%', marginBottom: 16 },
  rangeInputs: { flexDirection: 'row', gap: 8 },
  plotContainer: { flex: isMobile ? 1 : 1.5, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 16, padding: 16, minHeight: isMobile ? 450 : undefined, justifyContent: 'center', alignItems: 'center' },
  statusOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', borderRadius: 16, padding: 20 },
  errorText: { color: '#443fe1', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
const pickerSelectStyles = StyleSheet.create({ inputIOS: { fontSize: 14, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 8, color: '#242424', backgroundColor: 'rgba(255, 255, 255, 0.5)', height: 44 }, inputAndroid: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 8, color: '#242424', backgroundColor: 'rgba(255, 255, 255, 0.5)', height: 44 } });

export default MathVisualizer;