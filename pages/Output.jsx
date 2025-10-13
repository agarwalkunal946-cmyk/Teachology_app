import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
// Assuming you have these imports configured for your project
// import { selectUserId } from "../redux/authSlice";
// import api from "../utils/apiLogger";
// import {
//   assessmentDetailsEndpoint,
//   shareAssessmentEndpoint,
//   apiUrl,
// } from "../../src/config/config";
// import BackButton from "../components/BackButton";


// Mock data and functions for demonstration since imports are project-specific
const selectUserId = (state) => "mock-user-id-123";
const api = { post: async (url, data) => new Promise(res => setTimeout(() => res({ data: { status: 200, message: "Challenge sent!" } }), 1000)) };
const assessmentDetailsEndpoint = "/assessmentDetails";
const shareAssessmentEndpoint = "/shareAssessment";
const apiUrl = "https://api.example.com";
const BackButton = () => <View />;


const OutputScreen = () => {
  const route = useRoute();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [output, setOutput] = useState(null);
  const [isStructured, setIsStructured] = useState(false);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const QUESTIONS_PER_PAGE = 1;
  const [showFeedback, setShowFeedback] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false);
  
  const userId = useSelector(selectUserId);
  const auth = useSelector((state) => state.auth);
  
  const [assessmentIdFromURL, setAssessmentIdFromURL] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [recipients, setRecipients] = useState([{ email: "", nickName: "" }]);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [finalPercentage, setFinalPercentage] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = allQuestions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );

  const checkAllQuestionsFilled = useCallback(() => {
    if (!allQuestions || allQuestions.length === 0) return false;
    return allQuestions.every(
      (q, index) =>
        allSelectedAnswers[index] !== undefined &&
        allSelectedAnswers[index] !== "" &&
        allSelectedAnswers[index] !== null
    );
  }, [allQuestions, allSelectedAnswers]);
  
  const checkCurrentPageFilled = useCallback(() => {
    if (!currentQuestions || currentQuestions.length === 0) return true;
    return currentQuestions.every((_, indexInPage) => {
      const globalIndex = startIndex + indexInPage;
      return (
        allSelectedAnswers[globalIndex] !== undefined &&
        allSelectedAnswers[globalIndex] !== "" &&
        allSelectedAnswers[globalIndex] !== null
      );
    });
  }, [currentQuestions, allSelectedAnswers, startIndex]);

  useEffect(() => {
    const assessmentId = route.params?.assessment_id;
    if (assessmentId) {
      setAssessmentIdFromURL(assessmentId);
    }
  }, [route.params]);

  const processAssessmentContent = useCallback(
    (data) => {
      let responseContent;
      if (Array.isArray(data) && data?.length > 0 && data[0].output_data) {
        responseContent = data[0].output_data.response;
      } else if (route.params?.result?.response?.response) {
        responseContent = route.params.result.response.response;
      } else if (data?.response?.response) {
        responseContent = data.response.response;
      } else {
        responseContent = data;
      }

      if (
        Array.isArray(responseContent) &&
        responseContent.length > 0 &&
        responseContent[0]?.hasOwnProperty("question")
      ) {
        setAllQuestions(responseContent);
        setIsStructured(true);
        setAllSelectedAnswers(
          new Array(responseContent.length).fill(undefined)
        );
      } else if (typeof responseContent === "string") {
        setOutput(responseContent);
        setIsStructured(false);
      } else {
         setOutput(JSON.stringify(responseContent, null, 2));
        setIsStructured(false);
      }
    },
    [route.params]
  );
  
  const fetchAssessmentDetails = useCallback(
    async (assessmentId) => {
      setIsFetchingDetails(true);
      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          `${apiUrl}${assessmentDetailsEndpoint}`,
          { assessment_id: assessmentId }
        );
        if (response.data && response.data.data) {
          setAssessmentData(response.data.data);
          processAssessmentContent(response.data.data);
        } else {
          setError("Failed to fetch assessment details.");
        }
      } catch (error) {
        setError("Failed to fetch assessment details. Please try again.");
      } finally {
        setLoading(false);
        setIsFetchingDetails(false);
      }
    },
    [processAssessmentContent]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const initialResult = route.params?.result;
      if (assessmentIdFromURL) {
        await fetchAssessmentDetails(assessmentIdFromURL);
      } else if (initialResult) {
        setAssessmentData(initialResult);
        processAssessmentContent(initialResult);
      } else {
        setError("No data received. Please go back and try again.");
      }
    } catch (err) {
      setError(`An error occurred while loading the results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    route.params,
    assessmentIdFromURL,
    fetchAssessmentDetails,
    processAssessmentContent,
  ]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (questionIndexInPage, value) => {
    if (showFeedback) return;
    const globalIndex = startIndex + questionIndexInPage;
    const updatedAnswers = [...allSelectedAnswers];
    updatedAnswers[globalIndex] = value;
    setAllSelectedAnswers(updatedAnswers);
  };
  
  const handleOptionChange = (questionIndexInPage, optionValue) => {
    if (showFeedback) return;
    const globalIndex = startIndex + questionIndexInPage;
    const updatedAnswers = [...allSelectedAnswers];
    updatedAnswers[globalIndex] = optionValue;
    setAllSelectedAnswers(updatedAnswers);
  };
  
  const handleClosePopup = () => setShowScorePopup(false);
  
  const handleAddRecipient = () => {
    if (recipients.length < 5) {
      setRecipients([...recipients, { email: "", nickName: "" }]);
    }
  };
  
  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const handleRemoveRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };
  
  const checkEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChallengeFriend = async () => {
    if (!challengeTitle) {
      alert("Please enter a Challenge Title.");
      return;
    }
    const validRecipients = recipients.filter((r) => r.email && r.nickName && checkEmailValid(r.email));
    if (validRecipients.length === 0) {
      alert("Please enter at least one valid email and nickname.");
      return;
    }

    setLoading(true);
    try {
      const assessmentId = Array.isArray(assessmentData) && assessmentData.length > 0
        ? assessmentData[0]._id
        : assessmentData?.assesment_id || assessmentIdFromURL;
      const payload = {
        assessment_id: assessmentId,
        challenger_id: userId,
        shared_medium: "email",
        recipient: validRecipients.map((r) => ({ recipient_email: r.email, nick_name: r.nickName })),
        score: finalScore,
        title: challengeTitle,
      };
      
      const response = await api.post(`${apiUrl}${shareAssessmentEndpoint}`, payload);
      if (response.data.status === 200) {
        alert(response.data.message);
        handleClosePopup();
      }
    } catch (error) {
      alert("Failed to send challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkAllQuestionsFilled()) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setLoading(true);
    let score = 0;
    allQuestions.forEach((item, index) => {
      const itemType = item.type.toString().toLowerCase();
      if (itemType === "multiple choice" || itemType === "true/false") {
        if (allSelectedAnswers[index] === item.answer) score++;
      }
      // Short answer evaluation would require API call, simplified for now
    });

    setFinalScore(score);
    setTotalQuestions(allQuestions.length);
    const percentage = allQuestions.length > 0 ? (score / allQuestions.length) * 100 : 0;
    setFinalPercentage(Math.round(percentage));
    setShowFeedback(true);
    setShowScorePopup(true);
    setCurrentPage(0);
    setLoading(false);
  };
  
  const handlePreviousPage = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => {
    if (!checkCurrentPageFilled()) {
      alert("Please answer the question on this page.");
      return;
    }
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  };

  const totalPages = allQuestions ? Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE) : 1;
  const isLastPage = currentPage === totalPages - 1;
  const questionsToRender = showFeedback ? allQuestions : currentQuestions;
  
  const { part1: titlePart1, part2: titlePart2 } = {
    part1: isStructured ? "Interactive" : "Generated",
    part2: isStructured ? "Assessment" : "Output",
  };

  const renderQuestion = (item, index) => {
      const globalIndex = showFeedback ? index : startIndex + index;
      const indexInPage = showFeedback ? -1 : index;
      const userAnswer = allSelectedAnswers[globalIndex];
      const itemType = item.type.toString().toLowerCase();
      const isCorrect = userAnswer === item.answer;

      return (
        <View key={globalIndex} style={styles.questionBlock}>
          <Text style={styles.questionIdentifier}>Question {globalIndex + 1}</Text>
          <Text style={styles.questionParagraph}>{item.question}</Text>
          
          {(itemType === "multiple choice" || itemType === "true/false") && (item.options || ["True", "False"]).map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              style={[
                styles.optionItem, 
                userAnswer === option && styles.selectedOption,
                showFeedback && item.answer === option && styles.correctOption,
                showFeedback && userAnswer === option && userAnswer !== item.answer && styles.incorrectOption,
              ]}
              onPress={() => handleOptionChange(indexInPage, option)}
              disabled={showFeedback}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}

          {itemType === "short answer" && (
            <TextInput
              style={styles.shortAnswerInput}
              value={userAnswer || ""}
              onChangeText={(text) => handleInputChange(indexInPage, text)}
              placeholder="Type your answer here..."
              multiline
              editable={!showFeedback}
            />
          )}

          {showFeedback && (itemType === "multiple choice" || itemType === "true/false") && (
            <View style={[styles.answerResult, isCorrect ? styles.correct : styles.incorrect]}>
              <Text style={styles.answerResultText}>
                {isCorrect ? "Correct! 🎉" : `Incorrect. The correct answer is: "${item.answer}"`}
              </Text>
            </View>
          )}
        </View>
      );
  };
  
  return (
    <SafeAreaView style={styles.pageContainer}>
      <Modal visible={showScorePopup} transparent={true} animationType="slide" onRequestClose={handleClosePopup}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Results</Text>
            <Text style={styles.modalScoreText}>Score: {finalPercentage}%</Text>
            <Text style={styles.modalInfoText}>You completed an assessment with {totalQuestions} questions.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Assessment Challenge Title"
              value={challengeTitle}
              onChangeText={setChallengeTitle}
            />
            <ScrollView style={{width: '100%', maxHeight: 150}}>
              {recipients.map((recipient, index) => (
                <View key={index} style={styles.recipientRow}>
                  <TextInput
                    style={[styles.modalInput, {flex: 1}]}
                    placeholder="Email"
                    value={recipient.email}
                    onChangeText={(val) => handleRecipientChange(index, "email", val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={[styles.modalInput, {flex: 1, marginHorizontal: 5}]}
                    placeholder="Nickname"
                    value={recipient.nickName}
                    onChangeText={(val) => handleRecipientChange(index, "nickName", val)}
                  />
                  {recipients.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveRecipient(index)}>
                      <Text style={styles.removeButtonText}>-</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
            {recipients.length < 5 && (
              <TouchableOpacity onPress={handleAddRecipient} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add More</Text>
              </TouchableOpacity>
            )}
             <TouchableOpacity style={styles.modalButton} onPress={handleChallengeFriend} disabled={loading}>
              <Text style={styles.actionButtonText}>{loading ? "Sending..." : "Challenge via Email"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#6c757d'}]} onPress={handleClosePopup}>
              <Text style={styles.actionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BackButton />

      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <View style={styles.headerSection}>
          <Text style={styles.titlePrimary}>{titlePart1} <Text style={styles.titleSecondary}>{titlePart2}</Text></Text>
          {isStructured && (
            <Text style={styles.descriptionText}>
              {showFeedback ? "Assessment Completed! Review your answers below." : `Question ${currentPage + 1} of ${totalPages}`}
            </Text>
          )}
        </View>
        
        {loading || isFetchingDetails ? (
            <ActivityIndicator size="large" color="#4a45e4" />
        ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : isStructured ? (
            <View>
              {questionsToRender.map((item, index) => renderQuestion(item, index))}
            </View>
        ) : (
            <Text style={styles.markdownRender}>{output}</Text>
        )}
      </ScrollView>

      {isStructured && allQuestions.length > 0 && (
        <View style={styles.actionsFooter}>
            {showFeedback && (
              <Text style={styles.finalScoreDisplay}>
                Final Score: {finalPercentage}% ({finalScore}/{totalQuestions})
              </Text>
            )}
            <View style={styles.buttonContainer}>
              {!showFeedback && currentPage > 0 && (
                <TouchableOpacity onPress={handlePreviousPage} style={styles.actionButtonSecondary}>
                  <Text style={styles.actionButtonTextSecondary}>Previous</Text>
                </TouchableOpacity>
              )}
              {!showFeedback && !isLastPage && (
                <TouchableOpacity onPress={handleNextPage} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Next</Text>
                </TouchableOpacity>
              )}
              {!showFeedback && isLastPage && (
                <TouchableOpacity onPress={handleSubmit} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Check Answers</Text>
                </TouchableOpacity>
              )}
            </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: '#f7f9fc' },
  contentWrapper: { padding: 20, paddingBottom: 100 },
  headerSection: { alignItems: 'center', marginBottom: 20 },
  titlePrimary: { fontSize: 24, fontWeight: 'bold', color: '#1a202c', textAlign: 'center' },
  titleSecondary: { color: '#4a45e4' },
  descriptionText: { fontSize: 16, color: '#555e6d', marginTop: 5 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20, fontSize: 16 },
  questionBlock: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  questionIdentifier: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  questionParagraph: { fontSize: 18, marginBottom: 15, lineHeight: 24, color: '#1a202c' },
  optionItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedOption: { backgroundColor: '#e9e7ff', borderColor: '#4a45e4' },
  correctOption: { backgroundColor: '#d4edda', borderColor: '#28a745' },
  incorrectOption: { backgroundColor: '#f8d7da', borderColor: '#dc3545' },
  optionText: { fontSize: 16, color: '#333' },
  shortAnswerInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  answerResult: { marginTop: 10, padding: 10, borderRadius: 5, borderWidth: 1 },
  correct: { backgroundColor: '#d4edda', borderColor: '#c3e6cb' },
  incorrect: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' },
  answerResultText: { fontWeight: 'bold' },
  actionsFooter: {
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    padding: 15,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  finalScoreDisplay: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { backgroundColor: '#4a45e4', padding: 15, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  actionButtonSecondary: { backgroundColor: '#6c757d', padding: 15, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  actionButtonTextSecondary: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  markdownRender: { fontSize: 16, lineHeight: 24 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    width: Dimensions.get('window').width * 0.9,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  modalScoreText: { fontSize: 20, fontWeight: 'bold', color: '#4a45e4', marginBottom: 10 },
  modalInfoText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: '100%', marginBottom: 10 },
  recipientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  removeButtonText: { color: 'red', fontSize: 24, paddingHorizontal: 10 },
  modalButton: { backgroundColor: '#4a45e4', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  addButton: { padding: 10, alignItems: 'center', marginTop: 5 },
  addButtonText: { color: '#007bff', fontSize: 16 },
});

export default OutputScreen;