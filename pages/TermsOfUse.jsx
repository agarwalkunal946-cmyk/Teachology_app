import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';

// --- Mock Data & API for demonstration ---
const mockApi = {
  post: async () => ({
    data: [{
      type: 'terms-content',
      title: 'Terms of Use',
      last_updated: new Date().toISOString(),
      body: `<h2>1. Acceptance of Terms</h2><p>By accessing our service, you agree to be bound by these Terms of Use.</p><h2>2. Use License</h2><ul><li>Permission is granted to temporarily download one copy of the materials.</li><li>This is the grant of a license, not a transfer of title.</li></ul>`,
    }],
  }),
};
const SiteContentEndpoint = '/siteContent';
const apiUrl = 'https://api.example.com';
// ---

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
};

const ScreenLoader = () => (
    <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#443fe1" />
    </View>
);

const TermsPage = () => {
  const [data, setData] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    mockApi.post(`${apiUrl}${SiteContentEndpoint}`)
      .then((res) => {
        const termsData = res.data.find(item => item.type === 'terms-content');
        setData(termsData);
      })
      .catch((err) => {
        // Handle error
      });
  }, []);

  if (!data) {
    return <ScreenLoader />;
  }
  
  const tagsStyles = {
      h2: {
        fontSize: 22,
        color: '#443fe1',
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
      },
      p: {
        fontSize: 16,
        marginBottom: 16,
        color: '#333',
        lineHeight: 28,
      },
      ul: {
        marginLeft: 10,
        marginBottom: 20,
      },
      li: {
        fontSize: 16,
        marginBottom: 8,
        color: '#444',
      },
      a: {
        color: '#443fe1',
        textDecorationLine: 'underline',
      },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.termsContainer}>
        <BackButton />
        <View style={styles.termsHeader}>
          <Text style={styles.headerTitle}>{data.title}</Text>
          {data.last_updated && (
            <Text style={styles.lastUpdated}>
              Last Updated: {new Date(data.last_updated).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          )}
        </View>
        <RenderHTML
            contentWidth={width}
            source={{ html: data.body }}
            tagsStyles={tagsStyles}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9ff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    termsContainer: { padding: 24 },
    backButton: { position: 'absolute', top: 10, left: 10, backgroundColor: '#443fe1', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, zIndex: 10 },
    backButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
    termsHeader: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: '700', color: '#443fe1', textAlign: 'center' },
    lastUpdated: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 8 },
});

export default TermsPage;