import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useRoute } from '@react-navigation/native';
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import { useAuth } from "../App";
import { theme } from '../styles/theme';

const PublicLayout = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const route = useRoute();

  const noFooterPaths = [
    "Login",
    "Register",
    "ForgotPassword",
    "ResetPassword",
    "ResetEmail",
    "VerifyEmailOTP",
    "VerifyMobileOTP",
  ];

  const showFooter = !noFooterPaths.includes(route.name);

  return (
    <SafeAreaView style={styles.publicLayoutContainer}>
      <Header isLoggedIn={isLoggedIn} user={user} />
      <View style={styles.mainPublicContent}>
        {children}
      </View>
      {showFooter && <Footer />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  publicLayoutContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainPublicContent: {
    flex: 1,
    paddingTop: theme.headerHeight
  },
});

export default PublicLayout;