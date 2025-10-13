import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Linking, Alert } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import { apiUrl, searchPapersEndpoint } from "../../config/config";
import customFetch from "../../utils/customFetch";
import ScreenLoader from "../ScreenLoader";
import { theme } from '../../styles/theme';

const PaperFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setLoading(true);
    setError("");
    setPapers([]);

    try {
      const response = await customFetch(`${apiUrl}${searchPapersEndpoint}?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setPapers(data);
        if (data.length === 0) setError("No papers found. Try a different query.");
      } else {
        setError("Invalid data format received.");
      }
    } catch (err) {
      setError(`Failed to search: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onCopyText = (text, id) => {
    Clipboard.setString(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const PaperItem = ({ item }) => (
    <View style={styles.paperItem}>
      <Text style={styles.paperTitle}>{item.title || "No Title"}</Text>
      <Text>Authors: {item.authors?.join(", ") || "N/A"}</Text>
      <Text>Year: {item.publication_year || "N/A"}</Text>
      {item.doi && <Text>DOI: <Text style={styles.link} onPress={() => Linking.openURL(`https://doi.org/${item.doi}`)}>{item.doi}</Text></Text>}
      <Text>Abstract: {item.abstract || "N/A"}</Text>
      {item.landing_page_url && <Text style={styles.link} onPress={() => Linking.openURL(item.landing_page_url)}>View on Publisher Site</Text>}
      {item.pdf_url && <Text style={styles.link} onPress={() => Linking.openURL(item.pdf_url)}>Download PDF</Text>}
      {item.abstract && (
        <View style={styles.copySection}>
          <TouchableOpacity style={styles.copyButton} onPress={() => onCopyText(item.abstract, item.doi || item.title)}>
            <Text style={styles.copyButtonText}>Copy Abstract</Text>
          </TouchableOpacity>
          {copiedId === (item.doi || item.title) && <Text style={styles.copiedMessage}>Copied!</Text>}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paper Finder</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter your research query"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchButtonText}>{loading ? "..." : "Search"}</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
      {loading ? <ScreenLoader /> : (
        <FlatList
          data={papers}
          renderItem={PaperItem}
          keyExtractor={(item) => item.doi || item.title}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f7f8fc' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
    searchBar: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    searchInput: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 16, backgroundColor: 'white' },
    searchButton: { paddingHorizontal: 15, backgroundColor: theme.colors.primary, justifyContent: 'center', borderRadius: 8 },
    searchButtonText: { color: 'white', fontSize: 16 },
    errorMessage: { color: 'red', textAlign: 'center', marginBottom: 10 },
    paperItem: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, marginBottom: 15, gap: 5 },
    paperTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    link: { color: theme.colors.primary, textDecorationLine: 'underline' },
    copySection: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    copyButton: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
    copyButtonText: { color: 'white' },
    copiedMessage: { color: 'green', marginLeft: 10 },
});

export default PaperFinder;