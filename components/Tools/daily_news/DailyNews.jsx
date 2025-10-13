import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Linking, ScrollView } from "react-native";
import { DailyNewsEndpoint, apiUrl } from "../../../config/config";
import api from "../../../utils/apiLogger";
import { theme } from "../../../styles/theme";
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import RNPickerSelect from 'react-native-picker-select';

const CATEGORIES = ["nation", "world", "business", "technology", "entertainment", "sports", "science", "health"];
const countryOptions = [
  { value: "in", label: "India" },
  { value: "any", label: "World" },
];

const DailyNews = () => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("nation");
  const [selectedCountry, setSelectedCountry] = useState("in");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post(`${apiUrl}${DailyNewsEndpoint}`, {
        category: activeCategory,
        q: "important News",
        country: selectedCountry,
        lang: "en",
      });
      if (response.data && response.data.data) {
        setNewsData(response.data.data);
      } else {
        setError("No news data received from the server.");
      }
    } catch (err) {
      setError("Failed to fetch daily news. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedCountry]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const renderArticleContent = (content, url) => {
    const cleanedContent = content.replace(/\s*\[\d+\s*chars\]\s*$/, "");
    return (
      <Text style={styles.cardText}>
        {cleanedContent}...{" "}
        <Text style={styles.readMore} onPress={() => Linking.openURL(url)}>
          Read More
        </Text>
      </Text>
    );
  };

  const NewsCard = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/400x225?text=No+Image" }}
        style={styles.cardImage}
        defaultSource={require('../assets/img/placeholder.png')}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {renderArticleContent(item.content, item.url)}
        <View style={styles.cardMeta}>
          <Text style={styles.cardSource}>{item.source.name}</Text>
        </View>
      </View>
    </View>
  );

  const renderNews = () => {
    if (!newsData) return null;
    const allArticles = Object.values(newsData).flat();
    if (allArticles.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <Text>No news articles found for the selected criteria.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={allArticles}
        renderItem={({ item, index }) => <NewsCard item={item} />}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        contentContainerStyle={styles.articlesGrid}
      />
    );
  };

  return (
    <ScrollView style={styles.pageWrapper}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titlePart1}>Daily </Text>
          <Text style={styles.titlePart2}>News</Text>
        </View>
        <View style={styles.filtersContainer}>
          <View style={styles.selectGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Country:</Text>
              <InfoTooltip text={tooltips.DailyNews?.country?.tooltip || ""} />
            </View>
            <RNPickerSelect
              onValueChange={(value) => setSelectedCountry(value || 'in')}
              items={countryOptions}
              style={pickerSelectStyles}
              value={selectedCountry}
              placeholder={{}}
            />
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.activeTab]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.content}>
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text>Fetching headlines...</Text>
            </View>
          )}
          {error && (
            <View style={styles.messageContainer}>
              <Text>{error}</Text>
            </View>
          )}
          {!loading && !error && renderNews()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, padding: 16, backgroundColor: '#f8faff' },
  header: { marginBottom: 24 },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  titlePart1: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
  titlePart2: { fontSize: 32, fontWeight: '500', color: '#2a2a2a' },
  filtersContainer: { marginTop: 16 },
  selectGroup: { width: 200 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontWeight: '600', fontSize: 14, color: '#2a2a2a' },
  contentContainer: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  tabContainer: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: 'rgba(230, 230, 255, 0.5)', marginRight: 8 },
  activeTab: { backgroundColor: theme.colors.primary },
  tabText: { fontWeight: '500', color: '#5d5d5d' },
  activeTabText: { color: 'white' },
  content: { minHeight: 400, marginTop: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  articlesGrid: { paddingBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', marginBottom: 16, elevation: 2 },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 16, flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#2a2a2a', marginBottom: 8 },
  cardText: { fontSize: 15, color: '#495057', lineHeight: 22, flex: 1 },
  readMore: { color: theme.colors.primary, fontWeight: '600' },
  cardMeta: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 12, marginTop: 'auto' },
  cardSource: { fontSize: 12, color: '#868e96' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 4, color: 'black', paddingRight: 30 },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 0.5, borderColor: 'purple', borderRadius: 8, color: 'black', paddingRight: 30 },
});

export default DailyNews;