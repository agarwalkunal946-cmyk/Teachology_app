import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, SafeAreaView, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");
const isMobileScreen = screenWidth < 768;

const Header = ({ toggleSidebar, isMobile, toggleNotifications, unreadCount }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = useSelector((state) => state.auth);

  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  
  const apiUrl = "YOUR_API_URL"; // Reemplaza con tu URL de API real
  const localProfileImage = null; // Asumiendo que esta lógica se manejará de otra manera

  const getProfileImageSource = () => {
    if (localProfileImage) return { uri: localProfileImage };

    const imageUrl = auth?.profile_image;

    if (!imageUrl || imageUrl === "None" || profileImageError) {
      return require("../assets/img/profile.png"); // Asegúrate de que la ruta sea correcta
    }

    return { uri: imageUrl.startsWith("http") ? imageUrl : `${apiUrl}${imageUrl}` };
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    navigation.navigate("Logout");
  };
  
  const LoggedInHeader = () => (
    <View style={styles.headerBase}>
      <View style={styles.headerLeft}>
        {isMobile && (
          <TouchableOpacity onPress={toggleSidebar} style={styles.mobileMenuToggle}>
            <FontAwesome name="bars" size={22} color="#374151" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoArea}>
          <Image source={require('../assets/logo.png')} style={styles.logoImage} />
          {!isMobile && <Text style={styles.appTitle}>TeachologyAI</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={toggleNotifications} style={styles.actionButton}>
          <Image source={require('../assets/logo.png')} style={styles.actionIcon} />
          {unreadCount > 0 && (
            <View style={styles.notificationDot}>
              <Text style={styles.notificationText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Help')} style={styles.actionButton}>
          <FontAwesome name="question-circle" size={24} color="#555" />
        </TouchableOpacity>
        <View>
          <TouchableOpacity onPress={() => setIsProfileDropdownOpen(prev => !prev)} style={styles.actionButton}>
            <Image source={getProfileImageSource()} onError={() => setProfileImageError(true)} style={styles.profileImage} />
          </TouchableOpacity>
          {isProfileDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setIsProfileDropdownOpen(false); navigation.navigate('ManageAccount'); }}>
                <MaterialIcons name="account-circle" size={22} color="#443fe1" />
                <Text style={styles.dropdownItemText}>Gestionar Cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <MaterialIcons name="logout" size={22} color="#d92d27" />
                <Text style={styles.dropdownItemText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const LoggedOutHeader = () => (
    <View style={[styles.headerBase, styles.loggedOutContainer]}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoArea}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
        <Text style={styles.logoText}>Teachology AI</Text>
      </TouchableOpacity>
      {isMobileScreen ? (
        <TouchableOpacity onPress={() => setIsNavMenuOpen(true)}>
          <FontAwesome name="bars" size={24} color="#242424" />
        </TouchableOpacity>
      ) : (
        <View style={styles.navMenu}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}><Text style={[styles.navLink, route.name === 'Home' && styles.navLinkActive]}>Inicio</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Pricing')}><Text style={[styles.navLink, route.name === 'Pricing' && styles.navLinkActive]}>Precios</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Contact')}><Text style={[styles.navLink, route.name === 'Contact' && styles.navLinkActive]}>Contacto</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}><Text style={styles.loginButtonText}>Iniciar Sesión</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={[styles.loginButton, styles.registerButton]}><Text style={[styles.loginButtonText, {color: '#fff'}]}>Registrarse</Text></TouchableOpacity>
        </View>
      )}
      <Modal visible={isNavMenuOpen} transparent={true} animationType="slide" onRequestClose={() => setIsNavMenuOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsNavMenuOpen(false)} />
        <SafeAreaView style={styles.mobileNavMenu}>
            <TouchableOpacity onPress={() => { setIsNavMenuOpen(false); navigation.navigate('Home'); }}><Text style={styles.mobileNavLink}>Inicio</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsNavMenuOpen(false); navigation.navigate('Pricing'); }}><Text style={styles.mobileNavLink}>Precios</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsNavMenuOpen(false); navigation.navigate('Contact'); }}><Text style={styles.mobileNavLink}>Contacto</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsNavMenuOpen(false); navigation.navigate('Login'); }} style={styles.loginButton}><Text style={styles.loginButtonText}>Iniciar Sesión</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsNavMenuOpen(false); navigation.navigate('Register'); }} style={[styles.loginButton, styles.registerButton]}><Text style={[styles.loginButtonText, {color: '#fff'}]}>Registrarse</Text></TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.headerWrapper}>
      {auth.user ? <LoggedInHeader /> : <LoggedOutHeader />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    headerWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000 },
    headerBase: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 80, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    logoArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoImage: { width: 35, height: 42, resizeMode: 'contain' },
    appTitle: { fontSize: 21, fontWeight: '700', color: '#242424' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    actionButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
    actionIcon: { width: 24, height: 24, resizeMode: 'contain' },
    notificationDot: { position: 'absolute', top: -2, right: -4, backgroundColor: '#dc3545', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2, minWidth: 18, justifyContent: 'center', alignItems: 'center' },
    notificationText: { color: '#ffffff', fontSize: 10, fontWeight: '500' },
    profileImage: { width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover' },
    dropdownMenu: { position: 'absolute', top: 50, right: 0, backgroundColor: '#ffffff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, padding: 12, minWidth: 220, zIndex: 1001 },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10 },
    dropdownItemText: { fontSize: 15, fontWeight: '500', color: '#333' },
    mobileMenuToggle: { padding: 8 },
    loggedOutContainer: { paddingHorizontal: '5%' },
    logoText: { fontSize: 22, fontWeight: '700', color: '#242424' },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    navLink: { fontSize: 16, color: '#242424' },
    navLinkActive: { color: '#443fe1', fontWeight: '700', borderBottomWidth: 2, borderBottomColor: '#443fe1' },
    loginButton: { borderWidth: 2, borderColor: '#443fe1', borderRadius: 100, paddingVertical: 10, paddingHorizontal: 28 },
    loginButtonText: { color: '#443fe1', fontWeight: '700' },
    registerButton: { backgroundColor: '#443fe1' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    mobileNavMenu: { position: 'absolute', top: 0, left: 0, width: 280, height: '100%', backgroundColor: '#ffffff', padding: 24, paddingTop: 60, gap: 24 },
    mobileNavLink: { fontSize: 18, fontWeight: '500', paddingVertical: 10 },
});

export default Header;