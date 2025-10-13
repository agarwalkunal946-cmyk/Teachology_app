import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MoleculeVisualizerPage = () => <View style={styles.placeholder}><Text>3D Molecule Visualizer</Text></View>;
const PeriodicTable = () => <View style={styles.placeholder}><Text>Periodic Table</Text></View>;

function UnifiedVisualizer() {
  const [visualizationMode, setVisualizationMode] = useState('chemistry');

  return (
    <SafeAreaView style={styles.uvPageWrapper}>
      <View style={styles.uvHeader}>
        <View>
          <Text style={styles.uvTitlePart1}>
            3D Model <Text style={styles.uvTitlePart2}>Visualizer</Text>
          </Text>
        </View>
        <View style={styles.uvModeSelector}>
          <Text style={styles.modeLabel}>Visualizer Mode:</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
                style={[styles.modeButton, visualizationMode === 'chemistry' && styles.activeModeButton]}
                onPress={() => setVisualizationMode('chemistry')}
            >
                <Text style={[styles.modeButtonText, visualizationMode === 'chemistry' && styles.activeModeButtonText]}>Chemistry</Text>
            </TouchableOpacity>
             <TouchableOpacity
                style={[styles.modeButton, visualizationMode === 'periodic-table' && styles.activeModeButton]}
                onPress={() => setVisualizationMode('periodic-table')}
            >
                <Text style={[styles.modeButtonText, visualizationMode === 'periodic-table' && styles.activeModeButtonText]}>Periodic Table</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.uvContentArea}>
        {visualizationMode === 'chemistry' && <MoleculeVisualizerPage />}
        {visualizationMode === 'periodic-table' && <PeriodicTable />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  uvPageWrapper: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  uvHeader: { marginBottom: 24, gap: 20 },
  uvTitlePart1: { color: '#443fe1', fontSize: 32, fontWeight: '700' },
  uvTitlePart2: { color: '#2a2a2a', fontWeight: '500' },
  uvModeSelector: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modeLabel: { fontWeight: '600', fontSize: 16, color: '#2a2a2a' },
  modeButtons: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden'},
  modeButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff' },
  activeModeButton: { backgroundColor: '#443fe1'},
  modeButtonText: { fontSize: 14, fontWeight: '500', color: '#333' },
  activeModeButtonText: { color: '#fff' },
  uvContentArea: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
  },
  placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  }
});

export default UnifiedVisualizer;