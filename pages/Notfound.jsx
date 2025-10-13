import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotFound = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>
        <Text style={styles.message}>
          Sorry, the page you are looking for does not exist or has been moved.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')} // Assuming you have a 'Home' route
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>Go to Homepage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 96,
    fontWeight: '800',
    color: '#4a45e4',
    lineHeight: 96,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555e6d',
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'center',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4a45e4',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#4a45e4',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default NotFound;