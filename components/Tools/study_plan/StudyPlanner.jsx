import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { PlusCircle, Trash2 } from "lucide-react-native";
import RNPickerSelect from 'react-native-picker-select';
import { pick, isCancel } from '@react-native-documents/picker';
import { CreateStudyPlanEndpoint, UserStudyPlanDetailsEndpoint, DeleteStudyPlanEndpoint, apiUrl } from "../../../config/config";
import { selectUserId } from "../../../redux/authSlice";
import api from "../../../utils/apiLogger";
import ScreenLoader from "../../ScreenLoader";
import InfoTooltip from "../../InfoTooltip";
import tooltips from "../../../data/fieldTooltips.json";
import { theme } from "../../../styles/theme";

const StudyPlannerForm = ({ formFields, onFormSubmit, isLoading }) => {
  const { control, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm();
  const syllabusTextValue = watch("syllabus_text");
  const fileValue = watch("syllabus_file");
  const isTextDisabled = !!fileValue;
  const isFileDisabled = !!syllabusTextValue;

  const handleFilePick = async () => {
    try {
      const [res] = await pick({
          type: ['image/*', 'application/pdf'],
      });
      setValue('syllabus_file', res);
    } catch (err) {
      if (!isCancel(err)) {
        console.error(err);
      }
    }
  };

  const onSubmit = data => {
    if (!data.syllabus_text && !data.syllabus_file) {
      setError("syllabus_text", { type: "manual", message: "Please provide syllabus text or a file." });
      return;
    }
    onFormSubmit(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.pageWrapper}>
        <View style={styles.header}>
            <Text style={styles.titlePart1}>Create a New </Text><Text style={styles.titlePart2}>Study Plan</Text>
        </View>
        <Text style={styles.description}>Generate a personalized study schedule based on your goals.</Text>

        {formFields.map((field) => (
            <View key={field.name} style={styles.fieldWrapper}>
                <View style={styles.labelContainer}><Text style={styles.labelText}>{field.label}</Text><InfoTooltip text={tooltips.StudyPlannerPage?.[field.name]?.tooltip} /></View>
                <Controller
                    control={control}
                    name={field.name}
                    rules={{ required: field.required ? `${field.label} is required.` : false }}
                    render={({ field: { onChange, onBlur, value } }) => {
                        if (field.type === 'select') return <RNPickerSelect onValueChange={onChange} items={field.options.map(o => ({ label: o, value: o }))} style={pickerSelectStyles} value={value} placeholder={{ label: field.placeholder, value: null }} />;
                        if (field.type === 'textarea') return <TextInput style={[styles.inputBase, styles.textArea]} multiline value={value} onChangeText={onChange} onBlur={onBlur} placeholder={field.placeholder} editable={!isTextDisabled} />;
                        if (field.name === 'syllabus_file') return (
                            <TouchableOpacity style={[styles.filePicker, isFileDisabled && styles.disabled]} onPress={handleFilePick} disabled={isFileDisabled}>
                                <Text>{value ? value.name : 'Choose a file (Image/PDF)'}</Text>
                            </TouchableOpacity>
                        );
                        return <TextInput style={styles.inputBase} keyboardType={field.type === 'number' ? 'numeric' : 'default'} value={value} onChangeText={onChange} onBlur={onBlur} placeholder={field.placeholder} />;
                    }}
                />
                {errors[field.name] && <Text style={styles.errorMessage}>{errors[field.name].message}</Text>}
            </View>
        ))}
        <TouchableOpacity style={[styles.submitButton, isLoading && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Study Plan</Text>}
        </TouchableOpacity>
    </ScrollView>
  );
};

const DashboardView = ({ plansData, onNewPlanClick, userId, onPlanDeleted, canAddNewPlan }) => {
    const navigation = useNavigation();
    const [deletingPlanId, setDeletingPlanId] = useState(null);

    const handleDelete = (planId) => {
      Alert.alert("Confirm Delete", "Are you sure you want to delete this plan?", [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
            setDeletingPlanId(planId);
            try {
              await api.post(`${apiUrl}${DeleteStudyPlanEndpoint}`, { user_id_str: userId, plan_id_str: planId });
              onPlanDeleted(planId);
            } catch (error) { Alert.alert("Error", "Failed to delete the plan."); }
            finally { setDeletingPlanId(null); }
        }},
      ]);
    };

    const renderPlanCard = ({ item }) => (
        <TouchableOpacity style={styles.planCard} onPress={() => navigation.navigate("StudyPlanDetails", { planId: item.plan_id, userId })}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.plan_id)}>
                {deletingPlanId === item.plan_id ? <ActivityIndicator size="small" /> : <Trash2 size={18} color="#6c757d" />}
            </TouchableOpacity>
            <Text style={styles.planTitle}>{item.exam_name}</Text>
            <Text>{item.days_completed_in_plan} / {item.total_days_in_plan} Days Completed</Text>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${item.progress_percentage}%` }]} />
            </View>
            <Text>{item.progress_percentage.toFixed(1)}% Progress</Text>
        </TouchableOpacity>
    );

    return (
      <View style={styles.pageWrapper}>
        <View style={styles.header}><Text style={styles.titlePart1}>Study </Text><Text style={styles.titlePart2}>Plan</Text></View>
        <FlatList
            data={plansData?.plans_details || []}
            renderItem={renderPlanCard}
            keyExtractor={item => item.plan_id}
            ListFooterComponent={canAddNewPlan ? (
                <TouchableOpacity style={styles.addNewCard} onPress={onNewPlanClick}>
                    <PlusCircle size={40} color="#adb5bd" />
                    <Text>Create New Plan</Text>
                </TouchableOpacity>
            ) : null}
        />
      </View>
    );
};

const StudyPlannerPage = ({ formFields }) => {
  const [view, setView] = useState("loading");
  const [plansData, setPlansData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSelector(selectUserId);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserPlans = async () => {
      setIsLoading(true);
      try {
        const response = await api.post(`${apiUrl}${UserStudyPlanDetailsEndpoint}`, { user_id: userId });
        setPlansData(response.data);
      } catch (err) { /* Handle error */ }
      finally { setIsLoading(false); setView("dashboard"); }
    };
    if (userId) fetchUserPlans(); else { setView("dashboard"); }
  }, [userId]);

  const handleCreatePlan = async (data) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("exam_name", data.exam_name);
    formData.append("total_days", data.days);
    formData.append("syllabus_text", data.syllabus_text || "");
    if (data.syllabus_file) formData.append("syllabus_file", data.syllabus_file);

    try {
      const response = await api.post(`${apiUrl}${CreateStudyPlanEndpoint}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      navigation.navigate("StudyPlanDetails", { planId: response.data._id, userId });
    } catch (error) { Alert.alert("Error", "Could not create plan."); }
    finally { setIsLoading(false); }
  };

  if (isLoading || view === 'loading') return <ScreenLoader />;

  if (view === "form") return <StudyPlannerForm formFields={formFields} onFormSubmit={handleCreatePlan} isLoading={isLoading} />;

  return (
    <DashboardView
      plansData={plansData}
      onNewPlanClick={() => setView("form")}
      userId={userId}
      onPlanDeleted={(deletedId) => setPlansData(prev => ({ ...prev, plans_details: prev.plans_details.filter(p => p.plan_id !== deletedId) }))}
      canAddNewPlan={!plansData || plansData.plans_details.length < 3}
    />
  );
};

const styles = StyleSheet.create({
    pageWrapper: { padding: 20, backgroundColor: '#f8faff', flexGrow: 1 },
    header: { flexDirection: 'row', marginBottom: 8 },
    titlePart1: { color: theme.colors.primary, fontSize: 32, fontWeight: '700' },
    titlePart2: { color: '#2a2a2a', fontSize: 32, fontWeight: '500' },
    description: { fontSize: 16, color: '#5d5d5d', marginBottom: 24 },
    fieldWrapper: { marginBottom: 20 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    labelText: { fontSize: 16, fontWeight: '600' },
    inputBase: { backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 16, height: 52, justifyContent: 'center', borderWidth: 1, borderColor: '#ddd' },
    textArea: { height: 120, textAlignVertical: 'top', paddingTop: 16 },
    filePicker: { height: 52, justifyContent: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, backgroundColor: 'white' },
    disabled: { backgroundColor: '#f0f0f0' },
    submitButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
    submitButtonText: { color: 'white', fontWeight: 'bold' },
    planCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
    deleteButton: { position: 'absolute', top: 16, right: 16, padding: 4 },
    planTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    progressContainer: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 12, marginBottom: 4 },
    progressBar: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
    addNewCard: { height: 150, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 16 },
    errorMessage: { color: 'red', marginTop: 4 },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: { ...styles.inputBase },
    inputAndroid: { ...styles.inputBase },
});

export default StudyPlannerPage;