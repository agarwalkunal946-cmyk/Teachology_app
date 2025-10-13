import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
// Lightweight local date formatter to avoid depending on date-fns in the React Native bundle
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
function formatDate(dateInput, pattern) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const yy = String(yyyy).slice(-2);
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());

  switch (pattern) {
    case 'MM/dd/yy HH:mm':
      return `${MM}/${dd}/${yy} ${HH}:${mm}`;
    case 'MM/dd/yyyy':
      return `${MM}/${dd}/${yyyy}`;
    default:
      return d.toISOString();
  }
}
import { useSelector, useDispatch } from 'react-redux';
// Mock imports - replace with your actual Redux and API setup
// import { updateHistory } from '../redux/historySlice';
// import { selectUserId } from '../redux/authSlice';
// import api from '../utils/apiLogger';
// import { deleteAllHistoryEndpoint, historyEndpoint, deleteHistoryEndpoint } from "../config/config";

// --- MOCK DATA AND FUNCTIONS FOR DEMONSTRATION ---
const selectUserId = () => 'mock-user-id';
const mockApi = {
  get: async (url) => {
    if (url.includes('/history')) {
      return {
        data: Array.from({ length: 25 }, (_, i) => ({
          _id: `id_${i}`,
          title: `Generated Content #${i + 1}`,
          tool: i % 3 === 0 ? 'Text Summarizer' : 'Code Generator',
          createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
        })),
      };
    }
    if (url.includes('/distinctTools')) {
      return { data: ['Text Summarizer', 'Code Generator', 'Image Generator'] };
    }
    return { data: [] };
  },
  post: async () => ({ data: {} }),
};
const API_BASE_URL = 'https://api.example.com';
const historyEndpoint = '/history';
const deleteHistoryEndpoint = '/deleteHistory';
const deleteAllHistoryEndpoint = '/deleteAllHistory';
// --- END MOCK DATA ---

const OutputHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState('All Tools');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allTools, setAllTools] = useState(['All Tools']);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // NOTE: A real date picker (e.g., @react-native-community/datetimepicker) is recommended
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('start');

  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockApi.get(`${API_BASE_URL}${historyEndpoint}?user_id=${userId}`);
      setHistoryData(response.data);
      // dispatch(updateHistory(response.data)); // Uncomment when using Redux
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const getDistinctTools = async () => {
      try {
        const response = await mockApi.get(`${API_BASE_URL}/distinctTools?user_id=${userId}`);
        setAllTools(['All Tools', ...response.data]);
      } catch (err) {
        console.error('Failed to fetch tools');
      }
    };
    fetchHistoryData();
    getDistinctTools();
  }, [fetchHistoryData, userId]);

  const handleDelete = (id) => {
    Alert.alert(
      'Are you sure?',
      "You won't be able to revert this!",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, delete it!',
          style: 'destructive',
          onPress: async () => {
            try {
              await mockApi.post(`${API_BASE_URL}${deleteHistoryEndpoint}`, { history_id: id, user_id: userId });
              fetchHistoryData();
              Alert.alert('Deleted!', 'Your entry has been deleted.');
            } catch (err) {
              Alert.alert('Error!', 'Could not delete the entry.');
            }
          },
        },
      ],
    );
  };

  const deleteAllHistory = () => {
    Alert.alert(
      'Delete All History?',
      'This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, delete all!',
          style: 'destructive',
          onPress: async () => {
            try {
              await mockApi.post(`${API_BASE_URL}${deleteAllHistoryEndpoint}`, { user_id: userId });
              fetchHistoryData();
              Alert.alert('Deleted!', 'All history has been cleared.');
            } catch (err) {
              Alert.alert('Error!', 'Could not delete history.');
            }
          },
        },
      ],
    );
  };

  const filteredData = historyData.filter(item => {
    const itemDate = new Date(item.createdAt);
    const isAfterStartDate = !startDate || itemDate >= startDate;
    const isBeforeEndDate = !endDate || itemDate <= new Date(endDate).setHours(23, 59, 59, 999);
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTool = selectedTool === 'All Tools' || item.tool === selectedTool;
    return matchesSearch && matchesTool && isAfterStartDate && isBeforeEndDate;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 3 }]}>{item.title}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{item.tool}</Text>
  <Text style={[styles.tableCell, { flex: 2 }]}>{formatDate(new Date(item.createdAt), 'MM/dd/yy HH:mm')}</Text>
      <TouchableOpacity style={[styles.tableCell, { flex: 1, alignItems: 'center' }]} onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Output History</Text>
        <TouchableOpacity style={styles.deleteAllBtn} onPress={deleteAllHistory} disabled={loading || historyData.length === 0}>
          <Text style={styles.deleteAllBtnText}>❌ Delete All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Title..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {/* Simple Text component for tool picker, ideally replace with a dropdown component */}
        <Text style={styles.filterLabel}>Tool: {selectedTool}</Text>
        
        <View style={styles.datePickerGroup}>
          <TouchableOpacity onPress={() => { setDatePickerTarget('start'); setDatePickerVisible(true); }} style={styles.datePickerInput}>
            <Text style={styles.datePickerText}>{startDate ? formatDate(startDate, 'MM/dd/yyyy') : 'Start Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setDatePickerTarget('end'); setDatePickerVisible(true); }} style={styles.datePickerInput}>
             <Text style={styles.datePickerText}>{endDate ? formatDate(endDate, 'MM/dd/yyyy') : 'End Date'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 3 }]}>Title</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Tool</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Created At</Text>
        <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Actions</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6c63ff" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        <FlatList
          data={paginatedData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.noDataText}>No matching data found.</Text>}
        />
      )}

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Text style={styles.paginationInfo}>Page {currentPage} of {totalPages}</Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity onPress={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}>
              <Text style={styles.paginationButtonText}>‹ Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}>
              <Text style={styles.paginationButtonText}>Next ›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff', padding: 15 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 15 },
    header: { fontSize: 22, fontWeight: '600', color: '#333' },
    deleteAllBtn: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    deleteAllBtnText: { color: 'white', fontWeight: '500' },
    filters: { marginBottom: 15, gap: 10 },
    searchInput: { height: 42, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#f8f9fa' },
    filterLabel: { fontSize: 16, color: '#555', paddingVertical: 5 },
    datePickerGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    datePickerInput: { flex: 1, height: 42, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#f8f9fa' },
    datePickerText: { color: '#333', fontSize: 16 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderBottomColor: '#e9ecef', paddingVertical: 12, paddingHorizontal: 10 },
    headerCell: { fontWeight: '600', fontSize: 14, color: '#343a40', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
    tableCell: { fontSize: 15, color: '#495057' },
    deleteIcon: { fontSize: 20, color: '#dc3545' },
    errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
    noDataText: { textAlign: 'center', color: '#6c757d', marginTop: 20, fontSize: 16 },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e9ecef' },
    paginationInfo: { fontSize: 16, color: '#6c757d' },
    paginationControls: { flexDirection: 'row', gap: 10 },
    paginationButton: { backgroundColor: '#6c63ff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
    paginationButtonText: { color: 'white', fontWeight: '500' },
    disabledButton: { backgroundColor: '#e9ecef' },
});

export default OutputHistory;