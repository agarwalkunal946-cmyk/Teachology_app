import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

const mockApi = {
  post: async () => ({
    data: {
      data: [
        { _id: '1', title: 'Rubric Generator', content: 'Create detailed rubrics for any assignment.', image: 'https://picsum.photos/seed/1/200', tool_category: 'Productivity' },
        { _id: '2', title: 'Text Summarizer', content: 'Summarize long texts into key points.', image: 'https://picsum.photos/seed/2/200', tool_category: 'Content Generation' },
        { _id: '3', title: 'Lesson Planner', content: 'Generate structured lesson plans.', image: 'https://picsum.photos/seed/3/200', tool_category: 'Productivity' },
        { _id: '4', title: 'Writing Feedback', content: 'Get AI-powered feedback on writing.', image: 'https://picsum.photos/seed/4/200', tool_category: 'Content Generation' },
      ],
    },
  }),
};
const getToolDetailsEndpoint = '/getToolDetails';
const apiUrl = 'https://api.example.com';
const selectUser = (state) => ({ name: 'User' });
const selectUserId = (state) => '123';

const ToolCard = ({ tool, onClick }) => (
  <TouchableOpacity style={styles.favoriteCard} onPress={onClick}>
    <Image style={styles.cardImage} source={{ uri: tool.image }} defaultSource={require('../assets/logo.png')} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{tool.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={3}>{tool.content}</Text>
    </View>
  </TouchableOpacity>
);

const Tools = () => {
  const [tools, setTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCategories, setVisibleCategories] = useState({});
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(null);
  
  const navigation = useNavigation();
  const auth = useSelector(selectUser);
  const { width } = useWindowDimensions();
  
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    setGreetingIcon(require('../assets/img/teachology/687f2faa10cc3a3726b10840_sunrise_17356902-1.png'));
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
  setGreetingIcon(require('../assets/img/teachology/687f2faa10cc3a3726b10840_sunrise_17356902-1.png'));
    } else {
      setGreeting('Good Evening');
  setGreetingIcon(require('../assets/img/ui/robot.png'));
    }
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await mockApi.post(`${apiUrl}${getToolDetailsEndpoint}`, { type: 'recommendedTools' });
        const fetchedTools = response.data?.data || [];
        setTools(fetchedTools);
        const initialVisibility = fetchedTools.reduce((acc, tool) => {
          if (tool.tool_category) acc[tool.tool_category.trim()] = true;
          return acc;
        }, {});
        setVisibleCategories(initialVisibility);
      } catch (error) {
        setTools([]);
      }
    };
    fetchTools();
  }, []);

  const handleCardClick = (tool) => {
    navigation.navigate('ToolDetail', { tool });
  };

  const filteredTools = useMemo(
    () => tools.filter((tool) => tool.title?.toLowerCase().includes(searchTerm.toLowerCase())),
    [tools, searchTerm]
  );

  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      let category = tool.tool_category?.trim();
      if (category) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(tool);
      }
      return acc;
    }, {});
  }, [filteredTools]);

  const toggleCategoryVisibility = (category) => {
    setVisibleCategories((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  const numColumns = width > 992 ? 3 : width > 767 ? 2 : 1;
  const username = (auth?.name || auth?.username || '').split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.welcomeHeader}>
          <View style={styles.greeting}>
            {greetingIcon && <Image style={styles.greetingIcon} source={greetingIcon} />}
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>
          <Text style={styles.welcomeMessage} numberOfLines={1}>
            <Text style={styles.welcomeTextPrimary}>Welcome </Text>
            <Text style={styles.welcomeTextSecondary}>{username}</Text>
          </Text>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for any tool..."
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {Object.keys(toolsByCategory).map((category) => (
          <View style={styles.favoritesSection} key={category}>
            <TouchableOpacity style={styles.favoritesHeader} onPress={() => toggleCategoryVisibility(category)}>
              <View style={styles.favoritesTitleWrapper}>
                <View style={styles.starIconContainer}>
                   <Image source={require('../assets/img/teachology/687f1b412c3363fa68e5ff4f_Chat-Filled.png')} style={styles.starIcon} />
                </View>
                <Text style={styles.favoritesTitle}>{category}</Text>
              </View>
              <Icon name={visibleCategories[category] ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#443fe1" />
            </TouchableOpacity>
            {visibleCategories[category] && (
              <FlatList
                data={toolsByCategory[category]}
                renderItem={({ item }) => <ToolCard tool={item} onClick={() => handleCardClick(item)} />}
                keyExtractor={(item) => item._id}
                numColumns={numColumns}
                key={numColumns}
                columnWrapperStyle={numColumns > 1 ? { gap: 15 } : undefined}
                contentContainerStyle={{ gap: 15 }}
                scrollEnabled={false}
              />
            )}
          </View>
        ))}
        {filteredTools.length === 0 && searchTerm && (
          <View style={styles.noToolsFound}>
            <Text style={styles.noToolsTitle}>No tools found matching "{searchTerm}"</Text>
            <Text style={styles.noToolsSubtitle}>Try searching for something else!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  dashboardContainer: { padding: 20, gap: 24 },
  welcomeHeader: { gap: 4 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingIcon: { width: 32, height: 32 },
  greetingText: { color: '#6b6b6b', fontSize: 22 },
  welcomeMessage: { fontSize: 36 },
  welcomeTextPrimary: { color: '#443fe1', fontWeight: '700' },
  welcomeTextSecondary: { color: '#2a2a2a', fontWeight: '500' },
  searchBarContainer: { width: '100%', maxWidth: 700, alignSelf: 'center' },
  searchInput: {
    width: '100%', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 99, borderWidth: 1, borderColor: '#e5e7eb',
    fontSize: 16, backgroundColor: '#fff',
  },
  favoritesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24, padding: 20, gap: 20,
  },
  favoritesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  favoritesTitleWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starIconContainer: {
    backgroundColor: '#443fe1', borderRadius: 16, width: 32,
    height: 32, justifyContent: 'center', alignItems: 'center',
  },
  starIcon: { width: 15, height: 15, tintColor: '#fff' },
  favoritesTitle: { color: '#443fe1', fontSize: 22, fontWeight: '700' },
  favoriteCard: {
    flex: 1, backgroundColor: '#f3f2f9', borderRadius: 12,
    padding: 12, gap: 12,
  },
  cardImage: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#fff' },
  cardContent: { gap: 8, flex: 1 },
  cardTitle: { color: '#242424', fontSize: 18, fontWeight: '700' },
  cardDescription: { color: '#242424', fontSize: 14, lineHeight: 20 },
  noToolsFound: { alignItems: 'center', padding: 40 },
  noToolsTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  noToolsSubtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});

export default Tools;