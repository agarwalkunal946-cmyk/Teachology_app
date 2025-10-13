import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Componente de barra lateral de marcador de posición. Reemplázalo con tu implementación real.
const SideBar = ({ isOpen, toggleSidebar }) => {
  if (!isOpen) return null;

  return (
    <View style={sidebarStyles.sidebar}>
      <TouchableOpacity onPress={toggleSidebar}>
        <Text style={sidebarStyles.closeButton}>Cerrar</Text>
      </TouchableOpacity>
      <Text style={sidebarStyles.menuItem}>Elemento del Menú 1</Text>
      <Text style={sidebarStyles.menuItem}>Elemento del Menú 2</Text>
      <Text style={sidebarStyles.menuItem}>Elemento del Menú 3</Text>
    </View>
  );
};

const sidebarStyles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#f8f9fa',
    padding: 20,
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  closeButton: {
    marginBottom: 20,
    color: 'blue',
    fontSize: 16,
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
});


function Home({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <View style={styles.homeContainer}>
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <View style={styles.content}>
        {/* Aquí es donde se renderizarán las pantallas de tu aplicación */}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});

export default Home;