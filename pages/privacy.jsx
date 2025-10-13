import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

// --- Mock Data & API for demonstration ---
const mockApi = {
  post: async () => ({
    data: [
      {
        type: 'privacy-content',
        body: JSON.stringify({
          title: 'Privacy Policy',
          last_updated: 'January 1, 2025',
          sections: [
            {
              title: 'Introduction',
              subsections: [{ subtitle: 'Welcome', content: 'Welcome to our Privacy Policy...' }],
            },
            {
              title: 'Information We Collect',
              subsections: [
                { subtitle: 'Personal Data', content: 'We may collect personally identifiable information...' },
                { subtitle: 'Usage Data', content: 'Usage Data is collected automatically when using the Service.' },
              ],
            },
          ],
        }),
      },
    ],
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

function Privacy() {
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await mockApi.post(`${apiUrl}${SiteContentEndpoint}`);
        const privacyDoc = response.data.find(item => item.type === 'privacy-content');
        if (privacyDoc) {
          const parsedPolicy = JSON.parse(privacyDoc.body);
          setPolicy(parsedPolicy);
        }
      } catch (error) {
        // Handle error in a real app
      }
    };
    fetchPolicy();
  }, []);

  if (!policy) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.privacyContainer}>
        <BackButton />
        <View style={styles.privacyHeader}>
          <Text style={styles.headerTitle}>{policy.title}</Text>
          <Text style={styles.lastUpdated}>Last Updated: {policy.last_updated}</Text>
        </View>

        <View style={styles.privacyContent}>
          {policy.sections.map((section, i) => (
            <View style={styles.privacySection} key={i}>
              <Text style={styles.privacySectionTitle}>
                {i + 1}. {section.title}
              </Text>
              {section.subsections.map((sub, j) => (
                <View key={j}>
                  <Text style={styles.privacySubsectionTitle}>{sub.subtitle}</Text>
                  <Text style={styles.paragraph}>{sub.content}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.privacyFooter}>
          <Text>© {new Date().getFullYear()} TeachologyAI. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9ff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  privacyContainer: { padding: 24 },
  privacyHeader: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#443fe1', letterSpacing: 1 },
  lastUpdated: { fontSize: 14, color: '#555', marginTop: 8 },
  privacyContent: {},
  privacySection: { marginBottom: 25 },
  privacySectionTitle: { fontSize: 24, fontWeight: '600', color: '#443fe1', borderLeftWidth: 5, borderLeftColor: '#443fe1', paddingLeft: 12, marginBottom: 15 },
  privacySubsectionTitle: { fontSize: 18, fontWeight: '600', color: '#443fe1', marginTop: 15, marginBottom: 10 },
  paragraph: { fontSize: 16, color: '#2e2e2e', lineHeight: 28 },
  privacyFooter: { alignItems: 'center', color: '#888', marginTop: 30 },
  backButton: { position: 'absolute', top: 10, left: 10, backgroundColor: '#443fe1', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, zIndex: 10 },
  backButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});

export default Privacy;