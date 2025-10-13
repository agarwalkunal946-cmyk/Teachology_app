import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Share2, Clock, CheckCircle, XCircle } from "lucide-react-native";
import Svg, { Circle } from 'react-native-svg';
import { CreateStudyPlanQuestionsEndpoint, SubmitAnswersEndpoint, apiUrl } from "../../../config/config";
import { completeDay } from "../../../redux/studyPlanSlice";
import api from "../../../utils/apiLogger";
import ScreenLoader from "../../ScreenLoader";
import BackButton from "../../BackButton";
import { theme } from "../../../styles/theme";

const ProgressCircle = ({ value }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <View style={styles.progressCircleContainer}>
      <Svg width="120" height="120" viewBox="0 0 120 120">
        <Circle stroke="rgba(0, 0, 0, 0.1)" strokeWidth="10" fill="none" cx="60" cy="60" r={radius} />
        <Circle stroke={theme.colors.primary} strokeWidth="10" fill="none" cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" />
      </Svg>
      <Text style={styles.progressCircleText}>{`${Math.round(value)}%`}</Text>
    </View>
  );
};

const UpdateProgressView = ({ dayDetails, planId, userId }) => {
  const [progress, setProgress] = useState(0);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(completeDay({ day_number: dayDetails.day_number }));
    const timer = setInterval(() => setProgress(prev => (prev >= 100 ? 100 : prev + 5)), 80);
    const navTimeout = setTimeout(() => {
      clearInterval(timer);
      navigation.navigate("StudyPlanDetails", { planId, userId });
    }, 2000);
    return () => {
      clearInterval(timer);
      clearTimeout(navTimeout);
    };
  }, [dayDetails, dispatch, navigation, planId, userId]);

  return (
    <View style={styles.updateProgressView}>
      <ProgressCircle value={progress} />
      <Text style={styles.updateProgressTitle}>Unlocking Next Topic...</Text>
      <Text>Great job! Saving your progress.</Text>
    </View>
  );
};

const QuizResultView = ({ result, questions, userAnswers, onProceed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isPassed = result.status === "passed";

  const handleShare = async () => {
    setIsProcessing(true);
    let htmlRows = '';
    questions.forEach((q, index) => {
        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            let marker = `&#9675; ${opt}`;
            if (i === q.correct_answer_index) marker = `&#10003; ${opt}`;
            if (i === userAnswers[index] && i !== q.correct_answer_index) marker = `&#10007; ${opt}`;
            optionsHtml += `<li style="list-style: none;">${marker}</li>`;
        });
        htmlRows += `<div><h4>Q${index + 1}: ${q.question_text}</h4><ul>${optionsHtml}</ul><p><b>Explanation:</b> ${q.explanation}</p></div>`;
    });
    
    const html = `<html><body><h2>Quiz Results: ${result.score.toFixed(0)}%</h2>${htmlRows}</body></html>`;

    try {
        const { filePath } = await RNHTMLtoPDF.convert({ html, fileName: 'quiz-result', directory: 'Documents' });
        await Share.open({ url: `file://${filePath}`, title: 'Share Quiz Result' });
    } catch (error) {
        Alert.alert('Error', 'Could not share the result.');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.resultWrapper}>
      <View style={[styles.resultSummary, isPassed ? styles.passed : styles.failed]}>
        <Text style={styles.resultTitle}>{isPassed ? "Congratulations! You Passed!" : "Review Your Attempt"}</Text>
        <Text>Your score: {result.score.toFixed(0)}% ({result.correctAnswers}/{result.totalQuestions} correct)</Text>
      </View>
      <View style={styles.resultActions}>
        {isPassed && <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onProceed}><Text style={styles.primaryButtonText}>Unlock Next Topic</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.button} onPress={handleShare} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#333" /> : <Share2 size={18} color="#333" />}
            <Text> Share Result</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reviewArea}>
        <Text style={styles.reviewTitle}>Review Your Answers</Text>
        {questions.map((q, index) => (
          <View key={q.question_number} style={styles.reviewCard}>
            <Text style={styles.reviewQuestionText}>Q{q.question_number}: {q.question_text}</Text>
            {q.options.map((option, optIndex) => {
              const isCorrect = optIndex === q.correct_answer_index;
              const isUserChoice = optIndex === userAnswers[index];
              return (
                <View key={optIndex} style={[styles.reviewOption, isCorrect && styles.correctOption, isUserChoice && !isCorrect && styles.incorrectOption]}>
                  {isCorrect ? <CheckCircle size={16} color="#155724" /> : isUserChoice ? <XCircle size={16} color="#721c24" /> : <View style={styles.optionBullet} />}
                  <Text>{option}</Text>
                </View>
              );
            })}
            <Text style={styles.explanation}>Explanation: {q.explanation}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const QuizView = ({ dayDetails, studyPlan, questions, onSubmit }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const totalQuizTime = questions.length * (studyPlan.per_question_time || 1) * 60;
    const [timeLeft, setTimeLeft] = useState(totalQuizTime);
  
    useEffect(() => {
      if (totalQuizTime <= 0) return;
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onSubmit(userAnswers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [totalQuizTime]);
  
    const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  
    const currentQuestion = questions[currentQuestionIndex];
  
    return (
      <View style={styles.quizWrapper}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>Day {dayDetails.day_number}: Test Your Knowledge</Text>
          {totalQuizTime > 0 && <Text style={[styles.timer, timeLeft < 60 && styles.criticalTimer]}><Clock size={16} /> {formatTime(timeLeft)}</Text>}
          <Text style={styles.progressIndicator}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.quizCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity key={index} style={[styles.option, userAnswers[currentQuestionIndex] === index && styles.selectedOption]} onPress={() => setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }))}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.quizActions}>
          <TouchableOpacity style={[styles.button, currentQuestionIndex === 0 && styles.disabledButton]} onPress={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}><Text>Back</Text></TouchableOpacity>
          {currentQuestionIndex === questions.length - 1 ? (
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => onSubmit(userAnswers)}><Text style={styles.primaryButtonText}>Submit Quiz</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setCurrentQuestionIndex(p => p + 1)} disabled={userAnswers[currentQuestionIndex] === undefined}><Text>Next</Text></TouchableOpacity>
          )}
        </View>
      </View>
    );
};

const parseTopics = (description) => {
    if (!description) return [];
    return description.split(/[.;\n]/).flatMap(part => part.includes(':') ? part.split(':')[1].split(',').map(t => `${part.split(':')[0]}: ${t.trim()}`) : part.split(',').map(t => t.trim())).filter(Boolean);
};
  
const StudyPlanDetailView = () => {
    const { params } = useRoute();
    const { dayDetails, studyPlan } = params || {};
    const [questions, setQuestions] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
  
    useEffect(() => {
      if (!dayDetails || !studyPlan) {
        setError("Missing data"); setIsFetching(false); return;
      }
      const fetchQuestions = async () => {
        setIsFetching(true);
        try {
          const response = await api.post(`${apiUrl}${CreateStudyPlanQuestionsEndpoint}`, {
            topics_descriptions: parseTopics(dayDetails.topic_description),
            exam_name: studyPlan.exam_name,
            total_days: studyPlan.total_days,
            user_id: studyPlan.user_id,
            study_plan_id: studyPlan._id,
            per_exam_questions: studyPlan.per_exam_questions,
            per_question_time: studyPlan.per_question_time
          });
          if (response.data?.questions?.length > 0) {
            setQuestions(response.data.questions);
          } else {
            setError("No questions generated.");
          }
        } catch (err) {
          setError("Failed to load questions.");
        } finally {
          setIsFetching(false);
        }
      };
      fetchQuestions();
    }, [dayDetails, studyPlan]);
  
    const handleSubmitQuiz = async (answers) => {
      setUserAnswers(answers);
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correct_answer_index) correctAnswers++;
      });
      const score = (correctAnswers / questions.length) * 100;
      setQuizResult({
        score,
        status: score >= 80 ? "passed" : "failed",
        correctAnswers,
        totalQuestions: questions.length,
      });
    };
  
    if (isFetching) return <ScreenLoader />;
    if (error) return <View style={styles.pageWrapper}><Text style={styles.errorText}>{error}</Text></View>;
  
    return (
      <View style={styles.pageWrapper}>
        <BackButton />
        <View style={styles.header}>
            <Text style={styles.titlePart1}>{studyPlan.exam_name}</Text>
            <Text style={styles.titlePart2}> Quiz</Text>
        </View>
        <View style={styles.contentContainer}>
          {isUpdating ? <UpdateProgressView dayDetails={dayDetails} planId={studyPlan._id} userId={studyPlan.user_id} /> :
           quizResult ? <QuizResultView result={quizResult} questions={questions} userAnswers={userAnswers} onProceed={() => setIsUpdating(true)} /> :
           questions.length > 0 ? <QuizView dayDetails={dayDetails} studyPlan={studyPlan} questions={questions} onSubmit={handleSubmitQuiz} /> : null}
        </View>
      </View>
    );
};
  
const styles = StyleSheet.create({
    pageWrapper: { flex: 1, padding: 16, backgroundColor: '#f8faff' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    titlePart1: { color: theme.colors.primary, fontSize: 28, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 28, fontWeight: '500' },
    contentContainer: { flex: 1, borderRadius: 24, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1, borderColor: '#eee' },
    quizWrapper: { flex: 1 },
    quizHeader: { alignItems: 'center', marginBottom: 24, gap: 8 },
    quizTitle: { color: '#2a2a2a', fontSize: 20, fontWeight: '600' },
    timer: { flexDirection: 'row', alignItems: 'center', gap: 8, fontWeight: '500', color: '#495057' },
    criticalTimer: { color: '#dc2626', fontWeight: '600' },
    progressIndicator: { color: '#6c757d', fontWeight: '500' },
    quizCard: { flex: 1, paddingBottom: 20 },
    questionText: { fontSize: 20, fontWeight: '600', marginBottom: 24, color: '#212529', textAlign: 'center' },
    option: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
    selectedOption: { borderColor: theme.colors.primary, backgroundColor: 'rgba(230, 230, 255, 0.8)', borderWidth: 2 },
    optionText: { fontWeight: '500', color: '#343a40' },
    quizActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50, backgroundColor: '#f1f3f5' },
    primaryButton: { backgroundColor: theme.colors.primary },
    primaryButtonText: { color: 'white', fontWeight: '600' },
    disabledButton: { opacity: 0.6 },
    updateProgressView: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
    updateProgressTitle: { fontSize: 20, fontWeight: 'bold' },
    progressCircleContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
    progressCircleText: { position: 'absolute', fontSize: 24, fontWeight: '600', color: theme.colors.primary },
    resultWrapper: { paddingBottom: 20 },
    resultSummary: { padding: 24, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
    passed: { backgroundColor: 'rgba(212, 237, 218, 0.7)' },
    failed: { backgroundColor: 'rgba(248, 215, 218, 0.7)' },
    resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    resultActions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
    reviewArea: { marginTop: 16 },
    reviewTitle: { textAlign: 'center', marginBottom: 24, fontSize: 20, fontWeight: 'bold' },
    reviewCard: { backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
    reviewQuestionText: { fontWeight: 'bold', marginBottom: 8 },
    reviewOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, marginVertical: 4 },
    correctOption: { backgroundColor: 'rgba(212, 237, 218, 0.8)' },
    incorrectOption: { backgroundColor: 'rgba(248, 215, 218, 0.8)' },
    optionBullet: { width: 16, height: 16 },
    explanation: { marginTop: 16, padding: 16, borderRadius: 8, backgroundColor: 'rgba(241, 243, 245, 0.8)', lineHeight: 20 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 }
});
  
export default StudyPlanDetailView;