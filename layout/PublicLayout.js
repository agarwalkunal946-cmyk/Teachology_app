import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../pages/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../pages/Footer';
import { useAuth } from '../App';
import { theme } from '../styles/theme';

const PublicLayout = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const route = useRoute();

  const noFooterPaths = [
    'Login',
    'Register',
    'ForgotPassword',
    'ResetPassword',
    'ResetEmail',
    'VerifyEmailOTP',
    'VerifyMobileOTP',
  ];

  const showFooter = !noFooterPaths.includes(route.name);

  return (
    <SafeAreaView style={styles.publicLayoutContainer}>
      <Header isLoggedIn={isLoggedIn} user={user} />
      {/* View ko ScrollView se replace kiya gaya hai */}
      <ScrollView contentContainerStyle={styles.mainPublicContent}>
        {children}
        {/* Footer ko ScrollView ke andar move kiya gaya hai */}
        {showFooter && <Footer />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  publicLayoutContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainPublicContent: {
    flexGrow: 1,
  },
});

export default PublicLayout;
