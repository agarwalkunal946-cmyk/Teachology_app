import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
// Mock data import - ensure this file exists in your project
// import periodicTableData from '../data/periodicTableData.json';

// --- MOCK DATA AND FUNCTIONS FOR DEMONSTRATION ---
const periodicTableData = [ { "atomicNumber": 1, "symbol": "H", "name": "Hydrogen", "atomicMass": 1.008, "category": "diatomic-nonmetal", "group": 1, "period": 1, "block": "s" }, { "atomicNumber": 2, "symbol": "He", "name": "Helium", "atomicMass": 4.002602, "category": "noble-gas", "group": 18, "period": 1, "block": "p" }, /* ... more elements */ ];
// --- END MOCK DATA ---

const ElementTile = ({ element, onClick, isSelected, isVisible }) => {
  const categoryClass = element.category.replace(/\s+/g, '-') || 'unknown';
  return (
    <TouchableOpacity
      style={[
        styles.tile,
        styles[categoryClass],
        {
          position: 'absolute',
          left: `${((element.group - 1) / 18) * 100}%`,
          top: `${((element.period - 1) / 7) * 100}%`,
          opacity: isVisible ? 1 : 0.2,
        },
        isSelected && styles.selectedTile,
      ]}
      onPress={onClick}
      disabled={!isVisible}
    >
      <Text style={styles.tileNumber}>{element.atomicNumber}</Text>
      <Text style={styles.tileSymbol}>{element.symbol}</Text>
      <Text style={styles.tileName}>{element.name}</Text>
    </TouchableOpacity>
  );
};

const AtomViewer = ({ element, onClose }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const electronShells = [2, 8, 18, 32].reduce((acc, capacity) => {
    if (acc.remaining > 0) {
      const electrons = Math.min(acc.remaining, capacity);
      acc.shells.push({ count: electrons, size: 80 + acc.shells.length * 40 });
      acc.remaining -= electrons;
    }
    return acc;
  }, { shells: [], remaining: element.atomicNumber }).shells;

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>{element.name} ({element.symbol})</Text>
          <View style={styles.atomVisualization}>
            <View style={styles.nucleus} />
            {electronShells.map((shell, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.electronShell,
                  {
                    width: shell.size,
                    height: shell.size,
                    transform: [{ rotate: i % 2 === 0 ? spin : `-${i + 1}deg` }],
                  },
                ]}
              >
                {Array.from({ length: shell.count }).map((_, j) => (
                  <View
                    key={j}
                    style={[
                      styles.electron,
                      {
                        transform: [
                          { rotate: `${(360 / shell.count) * j}deg` },
                          { translateX: shell.size / 2 },
                        ],
                      },
                    ]}
                  />
                ))}
              </Animated.View>
            ))}
          </View>
          <Text style={styles.detailText}>Atomic Mass: {element.atomicMass.toFixed(3)}</Text>
          <Text style={styles.detailText}>Category: {element.category}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const PeriodicTable = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());

  const handleFilterToggle = (filter) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) newFilters.delete(filter);
      else newFilters.add(filter);
      return newFilters;
    });
  };

  const isElementVisible = (element) => {
    return activeFilters.size === 0 || activeFilters.has(element.category);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerTitle}>Interactive Periodic Table</Text>
        <Text style={styles.headerSubtitle}>Tap an element to learn more.</Text>
        
        <View style={styles.tableContainer}>
          {periodicTableData.map(element => (
            element.group && element.period ? (
                <ElementTile
                    key={element.symbol}
                    element={element}
                    onClick={() => setSelectedElement(element)}
                    isSelected={selectedElement?.symbol === element.symbol}
                    isVisible={isElementVisible(element)}
                />
            ) : null
          ))}
        </View>
        {/* F-block elements would need separate layout logic */}
      </ScrollView>
      {selectedElement && <AtomViewer element={selectedElement} onClose={() => setSelectedElement(null)} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#e0e0e0', textAlign: 'center', marginTop: 20 },
    headerSubtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
    tableContainer: { width: '100%', aspectRatio: 18 / 7, marginBottom: 20 },
    tile: { width: '5.55%', height: '14.28%', alignItems: 'center', justifyContent: 'center', padding: 2, borderWidth: 1, borderColor: '#334155', borderRadius: 4 },
    tileNumber: { fontSize: 8, color: '#cbd5e1', position: 'absolute', top: 2, left: 2 },
    tileSymbol: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    tileName: { fontSize: 8, color: '#9ca3af', textAlign: 'center' },
    selectedTile: { borderColor: '#22d3ee', borderWidth: 2, shadowColor: '#22d3ee', shadowRadius: 5, shadowOpacity: 0.8 },
    // Category Colors
    'diatomic-nonmetal': { backgroundColor: '#0369a1' },
    'noble-gas': { backgroundColor: '#7e22ce' },
    'alkali-metal': { backgroundColor: '#be123c' },
    'alkaline-earth-metal': { backgroundColor: '#ea580c' },
    'transition-metal': { backgroundColor: '#f59e0b' },
    'post-transition-metal': { backgroundColor: '#16a34a' },
    lanthanide: { backgroundColor: '#ca8a04' },
    actinide: { backgroundColor: '#b45309' },
    metalloid: { backgroundColor: '#0d9488' },
    unknown: { backgroundColor: '#374151' },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, width: '90%', alignItems: 'center' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#22d3ee', marginBottom: 20 },
    atomVisualization: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    nucleus: { width: 20, height: 20, backgroundColor: '#ef4444', borderRadius: 10 },
    electronShell: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(107, 114, 128, 0.4)', borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
    electron: { position: 'absolute', width: 10, height: 10, backgroundColor: '#4ade80', borderRadius: 5 },
    detailText: { fontSize: 16, color: '#e0e0e0', marginTop: 5 },
});

export default PeriodicTable;