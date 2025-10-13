import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Header from "../pages/Header";
import SideBar from "../pages/sidebar/SideBar";
import Footer from "../pages/Footer";
import Notifications from "../pages/Notifications";
import api from "../utils/apiLogger";
import { getAllNotificationEndpoint, apiUrl } from "../config/config";
import { selectUserEmail } from "../redux/authSlice";
import { theme } from '../styles/theme'; // Assuming a theme file for colors and constants

const Layout = ({ children }) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const route = useRoute();
  const useremail = useSelector(selectUserEmail);
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = !!auth.user;

  const fetchNotifications = async () => {
    if (!useremail) return;
    try {
      const response = await api.post(`${apiUrl}${getAllNotificationEndpoint}`, {
        user_email: useremail,
      });
      if (response.data?.status === "success") {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [useremail])
  );

  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };
  
  const isChatbotPage = route.name === "Chatbot";

  if (!isLoggedIn) {
    return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
  }

  return (
    <ImageBackground
      source={require("../assets/img/login/4498897.jpg")} // Update with your image path
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Header
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          toggleNotifications={toggleNotifications}
          unreadCount={unreadCount}
        />
        <View style={styles.appBody}>
          {isSidebarOpen && !isMobile && (
            <SideBar isOpen={isSidebarOpen} toggle={toggleSidebar} isMobile={isMobile} />
          )}

          <ScrollView style={styles.mainContentArea}>
            <View style={styles.contentWrap}>
              {children}
            </View>
            {!isChatbotPage && <Footer />}
          </ScrollView>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isSidebarOpen && isMobile}
          onRequestClose={toggleSidebar}
        >
          <Pressable style={styles.modalOverlay} onPress={toggleSidebar}>
            <SideBar isOpen={isSidebarOpen} toggle={toggleSidebar} isMobile={isMobile} />
          </Pressable>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isNotificationsOpen}
          onRequestClose={toggleNotifications}
        >
          <Notifications
            closePanel={toggleNotifications}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: 'rgba(238, 238, 255, 0.8)',
  },
  appBody: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  mainContentArea: {
    flex: 1,
  },
  contentWrap: {
    padding: 20,
    minHeight: '100%'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});


export default Layout;