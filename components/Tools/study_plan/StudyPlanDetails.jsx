import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Lock, Download, CheckCircle, Book, FlaskConical } from "lucide-react-native";
import { GetStudyPlanByIdEndpoint, apiUrl } from "../../../config/config";
import { setStudyPlan as setReduxStudyPlan } from "../../../redux/studyPlanSlice";
import api from "../../../utils/apiLogger";
import BackButton from "../../BackButton";
import ScreenLoader from "../../ScreenLoader";
import { theme } from "../../../styles/theme";

const StudyPlanDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { planId, userId } = route.params || {};
    if (!planId || !userId) {
      navigation.navigate("Tools");
      return;
    }
    const fetchPlanDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.post(`${apiUrl}${GetStudyPlanByIdEndpoint}`, { plan_id_str: planId, user_id_str: userId });
        setStudyPlan(response.data);
        dispatch(setReduxStudyPlan(response.data));
      } catch (error) {
        navigation.navigate("Tools");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanDetails();
  }, [route.params, navigation, dispatch]);

  const handleDownloadPdf = async (topic) => {
    const completedDayData = studyPlan.completed_questions?.find(day => day.current_progress_day === topic.day_number);
    const questionsForPdf = completedDayData?.questions;

    if (!questionsForPdf || questionsForPdf.length === 0) {
      Alert.alert("No Data", "Completed questions for this day are not available for download.");
      return;
    }

    const tableRows = questionsForPdf.map(q => {
        const correctAnswer = q.options && typeof q.correct_answer_index !== 'undefined' ? q.options[q.correct_answer_index] : 'N/A';
        return `<tr><td>${q.question_text}</td><td>${correctAnswer}</td><td>${q.explanation}</td></tr>`;
    }).join('');

    const htmlContent = `
        <html>
            <head><style>
                body { font-family: Helvetica, sans-serif; }
                h1 { color: #1a237e; text-align: center; }
                h2 { color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #3f51b5; color: white; }
            </style></head>
            <body>
                <h1>Teachology AI</h1>
                <h2>Study Plan: ${studyPlan.exam_name}</h2>
                <h3>Day ${topic.day_number}: ${topic.topic_description}</h3>
                <table>
                    <thead><tr><th>Question</th><th>Correct Answer</th><th>Explanation</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
        </html>`;

    try {
        const options = {
            html: htmlContent,
            fileName: `Day_${topic.day_number}_${studyPlan.exam_name}_Quiz`,
            directory: 'Documents',
        };
        const file = await RNHTMLtoPDF.convert(options);
        await Share.open({
            url: `file://${file.filePath}`,
            title: 'Share PDF',
            message: 'Here are my quiz results!',
            type: 'application/pdf',
        });
    } catch (error) {
        Alert.alert('Error', 'Could not generate or share the PDF.');
    }
  };

  if (isLoading) return <ScreenLoader />;
  if (!studyPlan?.daily_topics) return <Text style={styles.centered}>No study plan found.</Text>;

  const firstPendingIndex = studyPlan.daily_topics.findIndex(topic => topic.status !== "completed");

  const renderDayCard = ({ item, index }) => {
    const isCompleted = item.status === "completed";
    const isLocked = firstPendingIndex !== -1 && index > firstPendingIndex;
    const isActive = index === firstPendingIndex;
    
    return (
      <View style={[styles.dayCard, isActive && styles.activeCard, isLocked && styles.lockedCard, isCompleted && styles.completedCard]}>
        <View style={styles.dayCardContent}>
          <Text style={[styles.dayNumber, isActive && styles.activeText, isCompleted && styles.completedText]}>
            Day {item.day_number}
          </Text>
          <Text style={styles.topicDescription}>{item.topic_description}</Text>
        </View>
        <View style={styles.cardFooter}>
          {isCompleted ? (
            <>
              <View style={styles.statusBadge}>
                <CheckCircle color="#155724" size={16} />
                <Text style={[styles.badgeText, styles.completedText]}>Passed</Text>
              </View>
              <TouchableOpacity onPress={() => handleDownloadPdf(item)} title="Download Quiz PDF">
                <Download color="#495057" size={22} />
              </TouchableOpacity>
            </>
          ) : isLocked ? (
            <View style={styles.statusBadge}>
              <Lock color="#6c757d" size={16} />
              <Text style={styles.badgeText}>Locked</Text>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.learnBtn} onPress={() => navigation.navigate("StudyPlanLearn", { examName: studyPlan.exam_name, topicDescription: item.topic_description, originalPlanState: route.params, day_number: item.day_number })}>
                <Book color={theme.colors.primary} size={16} />
                <Text style={styles.learnBtnText}>Study</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testBtn} onPress={() => navigation.navigate("StudyPlanDetailView", { dayDetails: item, studyPlan })}>
                <FlaskConical color="white" size={16} />
                <Text style={styles.testBtnText}>Give Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.pageWrapper}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.titlePart1}>Study Plan: </Text>
        <Text style={styles.titlePart2}>{studyPlan.exam_name}</Text>
      </View>
      <FlatList
        data={studyPlan.daily_topics}
        renderItem={renderDayCard}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
        contentContainerStyle={styles.dayGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, padding: 16, backgroundColor: '#f8faff' },
  centered: { flex: 1, textAlign: 'center', marginTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  titlePart1: { color: theme.colors.primary, fontSize: 28, fontWeight: '700' },
  titlePart2: { color: '#2a2a2a', fontSize: 28, fontWeight: '500' },
  dayGrid: { paddingBottom: 20 },
  dayCard: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 16, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16, overflow: 'hidden' },
  activeCard: { borderColor: theme.colors.primary, borderWidth: 2 },
  completedCard: { backgroundColor: 'rgba(230, 255, 230, 0.8)', borderColor: 'rgba(21, 87, 36, 0.2)' },
  lockedCard: { backgroundColor: 'rgba(241, 243, 245, 0.9)', opacity: 0.7 },
  dayCardContent: { padding: 20 },
  dayNumber: { fontSize: 18, fontWeight: '600', color: '#2a2a2a', marginBottom: 8 },
  activeText: { color: theme.colors.primary },
  completedText: { color: '#155724' },
  topicDescription: { color: '#495057', lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeText: { fontWeight: '600', fontSize: 14, color: '#6c757d' },
  actionButtons: { flexDirection: 'row', gap: 12, flex: 1 },
  learnBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, backgroundColor: 'rgba(230, 230, 255, 0.8)' },
  learnBtnText: { color: theme.colors.primary, fontWeight: '600' },
  testBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, backgroundColor: theme.colors.primary },
  testBtnText: { color: 'white', fontWeight: '600' },
});

export default StudyPlanDetails;