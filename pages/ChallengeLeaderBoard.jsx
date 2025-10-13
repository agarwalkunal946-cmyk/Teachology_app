import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectUserId, selectUserEmail } from '../redux/authSlice'; // Asegúrate de que la ruta sea correcta
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import RNPickerSelect from 'react-native-picker-select';
import api from '../utils/apiLogger'; // Asegúrate de que la ruta sea correcta
import {
  getViewChallengerChartEndpoint,
  getAllChallengesEndpoint,
  assessmentDetailsEndpoint,
} from '../config/config'; // Asegúrate de que la ruta sea correcta

// Componentes simulados (deberás crearlos o importarlos)
const BackButton = () => (
  <TouchableOpacity onPress={() => console.log('Back button pressed')}>
    <Text style={styles.backButton}>&lt; Volver</Text>
  </TouchableOpacity>
);

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <View style={styles.paginationContainer}>
      {pageNumbers.map(number => (
        <TouchableOpacity
          key={number}
          onPress={() => paginate(number)}
          style={[styles.pageItem, currentPage === number && styles.pageItemActive]}
        >
          <Text style={[styles.pageLink, currentPage === number && styles.pageLinkActive]}>{number}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


const ChallengeLeaderBoard = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalQuestions, setModalQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState(null);

  // Simulación de la URL de la API y datos del usuario (reemplazar con la configuración real)
  const apiUrl = "https://api.example.com"; 
  const userId = useSelector(selectUserId);
  const currentUserEmail = useSelector(selectUserEmail);

  const [receivedChallenges, setReceivedChallenges] = useState([]);
  const [sentChallenges, setSentChallenges] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState(null);

  const [assessmentId, setAssessmentId] = useState(null);
  const [assessmentIdOptions, setAssessmentIdOptions] = useState([]);
  const [chartData, setChartData] = useState(null);

  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 768);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const onResize = () => setIsMobile(Dimensions.get('window').width < 768);
    const subscription = Dimensions.addEventListener('change', onResize);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate]);

  const filterTypeOptions = [
    { label: "All Challenges", value: "all" },
    { label: "Received Challenges", value: "received" },
    { label: "Sent Challenges", value: "sent" },
  ];

  const fetchAssessmentQuestions = async (assessmentId) => {
    setLoadingQuestions(true);
    setErrorLoadingQuestions(null);
    try {
      const response = await api.post(`${apiUrl}${assessmentDetailsEndpoint}`, {
        assessment_id: assessmentId,
      });
      if (response.data?.data?.[0]?.output_data?.response) {
        setModalQuestions(response.data.data[0].output_data.response);
      } else {
        setModalQuestions([]);
        setErrorLoadingQuestions("No questions found for this assessment.");
      }
    } catch (error) {
      setErrorLoadingQuestions("Failed to load questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchChallenges = useCallback(async () => {
    setError(null);
    try {
      const response = await api.post(`${apiUrl}${getAllChallengesEndpoint}`, {
        recipient_id: userId,
        challenger_id: userId,
      });
      if (response.status === 200 && response.data.success) {
        const received = response.data.data[0]?.receiver || [];
        const sent = response.data.data[0]?.sender || [];
        setReceivedChallenges(received);
        setSentChallenges(sent);
        setAllChallenges([...received, ...sent]);
      } else {
        console.error("Failed to fetch challenges");
      }
    } catch (err) {
      console.error(`Failed to fetch challenges: ${err.message}`);
      setError(err.message);
    }
  }, [apiUrl, userId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const fetchChartData = useCallback(async (id) => {
    if (!id) {
      setChartData(null);
      return;
    }
    try {
      const response = await api.post(`${apiUrl}${getViewChallengerChartEndpoint}`, { assesment_id: id });
      if (response.status === 200 && response.data.success) {
        setChartData(response.data.data);
      } else {
        console.error("Failed to fetch chart data");
        setChartData(null);
      }
    } catch (error) {
      console.error(`Failed to fetch chart data: ${error.message}`);
      setChartData(null);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (allChallenges.length > 0) {
      const uniqueAssessments = [...new Map(allChallenges.map(item => [item.assessment_id, { value: item.assessment_id, label: item.title || item.assessment_id }])).values()];
      setAssessmentIdOptions(uniqueAssessments);
      const currentIdStillExists = uniqueAssessments.some(opt => opt.value === assessmentId);
      if (!assessmentId || !currentIdStillExists) {
        const firstAssessment = uniqueAssessments[0];
        if (firstAssessment) {
          setAssessmentId(firstAssessment.value);
          fetchChartData(firstAssessment.value);
        }
      }
    }
  }, [allChallenges, assessmentId, fetchChartData]);

  const handleViewClick = (id) => {
    setShowModal(true);
    fetchAssessmentQuestions(id);
  };
  
  const finalFilteredChallenges = useCallback(() => {
    let challenges = filterType === "received" ? receivedChallenges : filterType === "sent" ? sentChallenges : allChallenges;
    if (startDate && endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        challenges = challenges.filter((challenge) => {
            const challengeDate = new Date(challenge.created_at);
            return challengeDate >= startDate && challengeDate <= adjustedEndDate;
        });
    }
    return challenges;
  }, [filterType, receivedChallenges, sentChallenges, allChallenges, startDate, endDate])();

  const currentTableData = finalFilteredChallenges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const transformChartData = () => {
    if (!chartData || chartData.length === 0 || !chartData[0].users) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    const users = [...chartData[0].users].sort((a, b) => a.rank - b.rank).slice(0, 5);
    return {
      labels: users.map(user => `Rank ${user.rank}`),
      datasets: [{
        data: users.map(user => user.score),
      }],
      tooltips: users.map(user => `${user.username} - Score: ${user.score}`)
    };
  };

  const finalChartData = transformChartData();

  const onDateChange = (event, selectedDate, type) => {
    if (type === 'start') {
        setShowStartDatePicker(false);
        if (selectedDate) setStartDate(selectedDate);
    } else {
        setShowEndDatePicker(false);
        if (selectedDate) setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.containerWrapper}>
      <View style={styles.leaderboardContainer}>
        <BackButton />
        <Text style={styles.leaderboardHeader}>
          <Text style={styles.headerMain}>Challenge </Text>
          <Text style={styles.headerSecondary}>Leaderboard</Text>
        </Text>
        
        <View style={styles.leaderboardCard}>
          <View style={isMobile ? styles.filtersMobile : styles.filtersDesktop}>
            <View style={styles.filterItem}>
              <RNPickerSelect
                value={filterType}
                onValueChange={(value) => setFilterType(value)}
                items={filterTypeOptions}
                style={pickerSelectStyles}
                placeholder={{}}
                Icon={() => <FontAwesomeIcon icon={faCaretDown} color="#443fe1" size={16} />}
              />
            </View>
            <TouchableOpacity style={styles.filterItem} onPress={() => setShowStartDatePicker(true)}>
              <Text style={styles.dateText}>{startDate ? format(startDate, 'dd.MM.yyyy') : 'Start Date'}</Text>
              <FontAwesomeIcon icon={faCalendarAlt} style={styles.leaderboardDatepickerIcon} />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker value={startDate || new Date()} mode="date" display="default" onChange={(e, d) => onDateChange(e, d, 'start')} />
            )}
            <TouchableOpacity style={styles.filterItem} onPress={() => setShowEndDatePicker(true)}>
              <Text style={styles.dateText}>{endDate ? format(endDate, 'dd.MM.yyyy') : 'End Date'}</Text>
              <FontAwesomeIcon icon={faCalendarAlt} style={styles.leaderboardDatepickerIcon} />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={(e, d) => onDateChange(e, d, 'end')} minimumDate={startDate} />
            )}
          </View>
          
          {error && <Text style={styles.errorMessage}>Error: {error}</Text>}
          
          <ScrollView horizontal>
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Title</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Type</Text>
                <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Challenger</Text>
                <Text style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>Recipient</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Score</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Assessment</Text>
              </View>

              {currentTableData.length > 0 ? (
                currentTableData.map(challenge => (
                  <View style={styles.tableRow} key={challenge._id}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{challenge.title || "No Title"}</Text>
                    <Text style={styles.tableCell}>{receivedChallenges.some(c => c._id === challenge._id) ? "Received" : "Sent"}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {challenge.sender_email || "N/A"}
                      {challenge.sender_email === currentUserEmail && <Text style={styles.userIndicator}> (you)</Text>}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {challenge.recipient_email}
                      {challenge.recipient_email === currentUserEmail && <Text style={styles.userIndicator}> (you)</Text>}
                    </Text>
                    <Text style={styles.tableCell}>{challenge.score || 0}</Text>
                    <Text style={styles.tableCell}>{format(new Date(challenge.created_at), "dd.MM.yyyy")}</Text>
                    <View style={styles.tableCell}>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewClick(challenge.assessment_id)}>
                        <Text style={styles.viewBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No matching data found.</Text>
              )}
            </View>
          </ScrollView>
          <Pagination itemsPerPage={itemsPerPage} totalItems={finalFilteredChallenges.length} paginate={setCurrentPage} currentPage={currentPage} />
        </View>

        <Text style={styles.leaderboardHeader}>
          <Text style={styles.headerMain}>Challenge </Text>
          <Text style={styles.headerSecondary}>Ranking</Text>
        </Text>

        <View style={styles.leaderboardCard}>
          <View style={styles.chartFilter}>
              <RNPickerSelect
                value={assessmentId}
                onValueChange={(value) => { setAssessmentId(value); fetchChartData(value); }}
                items={assessmentIdOptions}
                style={pickerSelectStyles}
                placeholder={{ label: "Select a Challenge", value: null }}
                Icon={() => <FontAwesomeIcon icon={faCaretDown} color="#443fe1" size={16} />}
              />
          </View>

          {finalChartData.labels.length > 0 ? (
            <BarChart
              data={finalChartData}
              width={Dimensions.get('window').width - 60}
              height={finalChartData.labels.length * 60}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
              withInnerLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={false}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(68, 63, 225, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(93, 93, 93, ${opacity})`,
                propsForBars: {
                  rx: 12,
                },
              }}
              style={styles.chartStyle}
            />
          ) : (
            <Text style={styles.noDataText}>No ranking data to display.</Text>
          )}
        </View>
        
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Assessment Questions</Text>
              <ScrollView style={styles.modalBody}>
                {loadingQuestions && <ActivityIndicator size="large" color="#443fe1" />}
                {errorLoadingQuestions && <Text style={styles.errorMessage}>{errorLoadingQuestions}</Text>}
                {!loadingQuestions && !errorLoadingQuestions && modalQuestions.length > 0 && (
                  modalQuestions.map((q, index) => (
                    <View key={index} style={styles.questionBlock}>
                      <Text style={styles.questionTitle}>Question {index + 1}</Text>
                      <Text>{q.question}</Text>
                      {q.options && q.options.map((opt, i) => <Text key={i}>- {opt}</Text>)}
                      {q.answer && <Text style={styles.answerText}>Answer: {q.answer}</Text>}
                    </View>
                  ))
                )}
                {!loadingQuestions && !errorLoadingQuestions && modalQuestions.length === 0 && (
                  <Text>No questions available.</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    backgroundColor: '#f0f2f5',
  },
  leaderboardContainer: {
    padding: 16,
    maxWidth: 1700,
    alignSelf: 'center',
    width: '100%',
  },
  leaderboardHeader: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 16,
    marginBottom: 8,
  },
  headerMain: {
    color: '#443fe1',
  },
  headerSecondary: {
    color: '#2a2a2a',
    fontWeight: '500',
  },
  leaderboardCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  filtersDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersMobile: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  filterItem: {
    borderWidth: 1,
    borderColor: '#443fe1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    minWidth: 200,
  },
  dateText: {
    fontFamily: 'Montserrat-Regular', // Asegúrate de tener esta fuente
    fontSize: 16,
    color: '#2a2a2a',
  },
  leaderboardDatepickerIcon: {
    color: '#443fe1',
    fontSize: 20,
  },
  tableWrapper: {
    width: '100%',
    minWidth: 900,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#deddff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#deddff',
  },
  tableCell: {
    verticalAlign: 'middle',
    textAlign: 'left',
    fontSize: 14,
    color: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 16,
    flex: 1,
  },
  headerCell: {
    color: '#443fe1',
    fontWeight: '600',
    fontSize: 16,
  },
  userIndicator: {
    color: '#443fe1',
    fontWeight: '500',
  },
  viewBtn: {
    backgroundColor: '#443fe1',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#6c757d',
  },
  errorMessage: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: 'red',
  },
  chartFilter: {
    maxWidth: 400,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#443fe1',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalBody: {
    marginBottom: 15,
  },
  questionBlock: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answerText: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#443fe1',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    color: '#443fe1',
    fontSize: 16,
    marginBottom: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  pageItem: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageItemActive: {
    backgroundColor: '#443fe1',
    borderColor: '#443fe1',
  },
  pageLink: {
    color: '#443fe1',
  },
  pageLinkActive: {
    color: '#fff',
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#2a2a2a',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#2a2a2a',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 18,
    right: 15,
  },
});

export default ChallengeLeaderBoard;