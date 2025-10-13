import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { GetCurrentAffairEndpoint, apiUrl } from "../../../config/config";
import api from "../../../utils/apiLogger";
import tooltips from "../../../data/fieldTooltips.json";
import InfoTooltip from "../../InfoTooltip";
import { useSelector } from "react-redux";
import { selectUserId } from "../../../redux/authSlice";
import { theme } from "../../../styles/theme";

const CATEGORIES = [
  "National Affairs", "International Affairs", "Economy & Banking", "Science & Technology",
  "Sports", "Environment & Ecology", "Appointments & Resignations", "Awards & Honours",
];

const CurrentAffairsSelector = () => {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [examName, setExamName] = useState("ssc cgl");
  const [page, setPage] = useState(1);
  const [showAnswers, setShowAnswers] = useState(false);
  const resultsRef = useRef(null);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (showResults && resultsRef.current) {
      resultsRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [questions, showResults]);

  useEffect(() => {
    if (!isTimerActive || countdown <= 0) {
      setIsTimerActive(false);
      return;
    }
    const intervalId = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [isTimerActive, countdown]);

  const startTimer = () => {
    setCountdown(30);
    setIsTimerActive(true);
  };

  const fetchQuestions = async (pageNumber) => {
    if (!examName.trim()) {
      Alert.alert("Validation Error", "Please enter an exam name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post(`${apiUrl}${GetCurrentAffairEndpoint}`, {
        exam_name: examName, num_questions: 5, pageno: pageNumber, user_id: userId,
      });
      setQuestions(response.data.data);
      setPage(pageNumber);
      setShowResults(true);
      setShowAnswers(false);
      startTimer();
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInitialView = () => (
    <ScrollView contentContainerStyle={styles.pageWrapper}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titlePart1}>Current </Text>
          <Text style={styles.titlePart2}>Affairs</Text>
        </View>
        <Text style={styles.description}>Get questions from topics like:</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.categoryWrapper}>
          {CATEGORIES.map((cat) => <Text key={cat} style={styles.categoryTag}>{cat}</Text>)}
        </View>
        <View style={styles.fieldWrapper}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Enter Exam Name</Text>
            <InfoTooltip text={tooltips.CurrentAffairsSelector?.examName?.tooltip || ""} />
          </View>
          <View style={styles.inputBase}>
            <TextInput
              style={styles.input}
              value={examName}
              onChangeText={setExamName}
              placeholder="e.g., ssc cgl, upsc, banking"
              placeholderTextColor="#888"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={() => fetchQuestions(1)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Generate Questions</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderResultsView = () => (
    <ScrollView ref={resultsRef} contentContainerStyle={styles.pageWrapper}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titlePart1}>Results for: </Text>
          <Text style={styles.titlePart2}>{examName.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.pageCount}>Page {page}</Text>
          <TouchableOpacity onPress={() => setShowAnswers(!showAnswers)} style={styles.toggleAnswerButton}>
            <Text style={styles.toggleAnswerButtonText}>{showAnswers ? "Hide Answers" : "Show Answers"}</Text>
          </TouchableOpacity>
        </View>
        {questions?.questions.map((q, index) => (
          <View key={`${q.question}-${index}`} style={styles.questionCard}>
            <Text style={styles.questionText}>
              <Text style={{ fontWeight: 'bold' }}>{(page - 1) * 5 + index + 1}. </Text>
              {q.question}
            </Text>
            <View style={styles.options}>
              {q.options.map((option, i) => <Text key={i} style={styles.optionText}>{`\u25CB ${option}`}</Text>)}
            </View>
            {showAnswers && <Text style={styles.answer}><Text style={{ fontWeight: 'bold' }}>Answer:</Text> {q.answer}</Text>}
          </View>
        ))}
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={() => fetchQuestions(page - 1)} style={[styles.navButton, (loading || page <= 1) && styles.disabledButton]} disabled={loading || page <= 1}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fetchQuestions(page + 1)} style={[styles.navButton, (loading || isTimerActive) && styles.disabledButton]} disabled={loading || isTimerActive}>
            <Text style={styles.navButtonText}>
              {loading ? "Loading..." : isTimerActive ? `Next in ${countdown}s` : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.flexContainer}>
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
      {!showResults ? renderInitialView() : renderResultsView()}
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  pageWrapper: { padding: 20, backgroundColor: '#f8faff' },
  header: { marginBottom: 24 },
  titleContainer: { flexDirection: 'row' },
  titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
  titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
  description: { color: '#242424', fontSize: 16, marginTop: 8 },
  formContainer: { borderRadius: 24, padding: 24, backgroundColor: 'rgba(255, 255, 255, 0.8)', gap: 24 },
  resultsContainer: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', gap: 16 },
  categoryWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryTag: { backgroundColor: 'rgba(255, 255, 255, 0.4)', color: '#5a5a5a', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, fontSize: 14, borderWidth: 1, borderColor: '#f0f0f0' },
  fieldWrapper: { gap: 12 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labelText: { color: '#242424', fontSize: 16, fontWeight: '700' },
  inputBase: { borderRadius: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderWidth: 1, borderColor: '#ddd', height: 52, justifyContent: 'center' },
  input: { fontSize: 16, color: '#242424' },
  submitButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pageCount: { fontSize: 16, fontWeight: '500', color: '#2a2a2a' },
  toggleAnswerButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: theme.colors.primary },
  toggleAnswerButtonText: { color: 'white' },
  questionCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  questionText: { fontSize: 17, color: '#212529', marginBottom: 12 },
  options: { paddingLeft: 8, marginBottom: 12, gap: 6 },
  optionText: { color: '#495057', fontSize: 16 },
  answer: { backgroundColor: 'rgba(230, 230, 255, 0.7)', padding: 12, borderRadius: 6, fontSize: 15, color: '#242424', overflow: 'hidden' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navButton: { paddingVertical: 12, paddingHorizontal: 20, width: '48%', borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: 'center' },
  navButtonText: { color: 'white', fontWeight: '600' },
  disabledButton: { backgroundColor: '#ccc' },
  errorMessage: { color: 'red', textAlign: 'center', padding: 10 },
});

export default CurrentAffairsSelector;