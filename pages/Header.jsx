import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const VITE_APP_API_BASE_URL = "YOUR_API_BASE_URL_HERE"; 

function Header({ toggleSidebar }) {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = useSelector((state) => state.auth);

  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const getProfileImageSource = () => {
    const imageUrl = auth?.profile_image;
    if (profileImageError || !imageUrl || imageUrl === "None") {
      return require("../assets/profile.png");
    }
    if (imageUrl.startsWith("http")) {
      return { uri: imageUrl };
    }
    return { uri: `${VITE_APP_API_BASE_URL}${imageUrl}` };
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    navigation.navigate("Logout");
  };

  if (auth.user) {
    return (
      <View style={styles.loggedInHeader}>
        <View style={styles.headerLeftContent}>
          <TouchableOpacity
            style={styles.mobileMenuToggle}
            onPress={toggleSidebar}
          >
            <FontAwesome name="bars" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoArea}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.appTitle}>TeachologyAI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Help")}
          >
            <FontAwesome name="question-circle" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => setIsProfileDropdownOpen((prev) => !prev)}
            >
              <Image
                source={getProfileImageSource()}
                style={styles.profileImage}
                onError={() => setProfileImageError(true)}
              />
            </TouchableOpacity>
            {isProfileDropdownOpen && (
              <View style={styles.modernDropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIsProfileDropdownOpen(false);
                    navigation.navigate("ManageAccount");
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={20}
                    color="#443fe1"
                  />
                  <Text style={styles.itemText}>Manage Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#d92d27"
                  />
                  <Text style={styles.itemText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.loggedOutHeader}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isNavMenuOpen}
        onRequestClose={() => setIsNavMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsNavMenuOpen(false)}
        >
          <View style={styles.modalNavMenu}>
            <TouchableOpacity
              onPress={() => {
                setIsNavMenuOpen(false);
                navigation.navigate("Landing");
              }}
            >
              <Text style={[styles.navLink, route.name === "Landing" && styles.navLinkActive]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsNavMenuOpen(false);
                navigation.navigate("Pricing");
              }}
            >
              <Text style={[styles.navLink, route.name === "Pricing" && styles.navLinkActive]}>Pricing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsNavMenuOpen(false);
                navigation.navigate("Contact");
              }}
            >
              <Text style={[styles.navLink, route.name === "Contact" && styles.navLinkActive]}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnLogin}
              onPress={() => {
                setIsNavMenuOpen(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.btnLoginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnRegister}
              onPress={() => {
                setIsNavMenuOpen(false);
                navigation.navigate("Register");
              }}
            >
              <Text style={styles.btnRegisterText}>Register</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.logoLink}
        onPress={() => navigation.navigate("Landing")}
      >
        <Image
          source={require("../assets/logo.png")}
          style={styles.logoImg}
        />
        <Text style={styles.logoText}>Teachology AI</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuToggle}
        onPress={() => setIsNavMenuOpen(true)}
      >
        <FontAwesome name="bars" size={24} color="#242424" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loggedInHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  mobileMenuToggle: {
    padding: 8,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  appTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#242424",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  actionBtn: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  modernDropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  loggedOutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: "5%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    height: 80,
  },
  logoLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImg: {
    width: 35,
    height: 46,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#242424",
  },
  menuToggle: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalNavMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 280,
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 32,
  },
  navLink: {
    color: "#242424",
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 8,
  },
  navLinkActive: {
    color: "#443fe1",
    fontWeight: "700",
  },
  btnLogin: {
    borderWidth: 2,
    borderColor: "#443fe1",
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnLoginText: {
    color: "#443fe1",
    fontWeight: "700",
    fontSize: 16,
  },
  btnRegister: {
    backgroundColor: "#443fe1",
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnRegisterText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default Header;