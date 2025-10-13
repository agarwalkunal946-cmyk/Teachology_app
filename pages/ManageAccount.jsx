import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, Modal,
  TextInput, StyleSheet, ActivityIndicator, Platform, Alert
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import api from '../utils/apiLogger';
import { updateUser } from "../redux/authSlice";
import { profileEndpoint, profileUpdateEndpoint, streakEndpoint, updateProfileEndpoint, apiUrl } from "../config/config";

const ManageAccount = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", phoneno: "", address: "", email: "" });
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [profileImage, setProfileImage] = useState(require("../assets/img/profile.png"));
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Lógica para cargar el perfil y el streak
    const fetchProfile = async () => {
        if (!auth.user_id) return;
        try {
            const response = await api.get(`${apiUrl}${profileEndpoint}/${auth.user_id}`);
            const profile = response.data;
            setFormData({ name: profile.name || "", username: profile.username || "", phoneno: profile.phoneno?.replace('+91', '') || "", address: profile.address || "", email: profile.email || ""});
            setDob(profile.dob ? parseISO(profile.dob) : null);
            if (profile.profile_image && profile.profile_image !== "None") {
                setProfileImage({ uri: profile.profile_image.startsWith("http") ? profile.profile_image : `${apiUrl}${profile.profile_image}` });
            }
        } catch (error) { Alert.alert("Error", "No se pudo cargar el perfil."); }
    };
    fetchProfile();
  }, [auth.user_id]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel || response.errorCode) return;
      setImagePreview(response.assets[0]);
    });
  };

  const handleSaveImage = async () => {
    if (!imagePreview) return;
    setIsUpdating(true);
    const body = new FormData();
    body.append('profile_image', { uri: imagePreview.uri, name: imagePreview.fileName, type: imagePreview.type });
    body.append('userId', auth.user_id);
    body.append('name', formData.name);
    body.append('phoneno', `+91${formData.phoneno}`);
    
    try {
        await api.post(`${apiUrl}${updateProfileEndpoint}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert("Éxito", "Imagen actualizada correctamente.");
        setImagePreview(null);
    } catch (error) { Alert.alert("Error", "No se pudo actualizar la imagen."); }
    finally { setIsUpdating(false); }
  };
  
  const handleUpdateDetails = async () => {
    setIsUpdating(true);
    try {
        const payload = { ...formData, dob: dob ? format(dob, "yyyy-MM-dd") : null, phoneno: formData.phoneno ? `+91${formData.phoneno}` : "" };
        await api.put(`${apiUrl}${profileUpdateEndpoint}/${auth.user_id}`, payload);
        Alert.alert("Éxito", "Perfil actualizado correctamente.");
        setShowEditModal(false);
    } catch (error) { Alert.alert("Error", "No se pudo actualizar el perfil."); }
    finally { setIsUpdating(false); }
  };

  const streakProgress = (streak / 30) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}><Text style={styles.titleAccent}>Configuración</Text> de la Cuenta</Text>
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Mi Perfil</Text></View>
          <View style={styles.profileImageSection}>
            <Image style={styles.avatar} source={imagePreview ? { uri: imagePreview.uri } : profileImage} />
            <TouchableOpacity style={styles.cameraIcon} onPress={handleImagePicker}><Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png'}} style={styles.cameraImage}/></TouchableOpacity>
          </View>
          {imagePreview && <View style={styles.imageActions}><TouchableOpacity onPress={handleSaveImage} style={styles.saveBtn}><Text style={{color: 'white'}}>Guardar</Text></TouchableOpacity><TouchableOpacity onPress={()=>setImagePreview(null)} style={styles.cancelBtn}><Text>Cancelar</Text></TouchableOpacity></View>}
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Detalles del Perfil</Text><TouchableOpacity onPress={()=>setShowEditModal(true)} style={styles.editButton}><Text style={styles.editButtonText}>Editar</Text></TouchableOpacity></View>
          <View style={styles.detailsGrid}>
            <DetailItem label="Nombre" value={formData.name} />
            <DetailItem label="Usuario" value={formData.username} />
            <DetailItem label="Email" value={formData.email} />
            <DetailItem label="Teléfono" value={formData.phoneno} />
            <DetailItem label="Fecha Nac." value={dob ? format(dob, "dd/MM/yyyy") : 'NA'} />
            <DetailItem label="Dirección" value={formData.address} />
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Racha Actual</Text></View>
          <View style={styles.streakContainer}>
            <Svg viewBox="0 0 36 36" width="200" height="200">
                <Path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" strokeWidth="2.5"/>
                <Path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#443fe1" strokeWidth="2.5" strokeDasharray={`${streakProgress}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"/>
                <SvgText x="18" y="18" textAnchor="middle" dy="1" fontSize="8" fontWeight="700">{String(streak).padStart(2, '0')}</SvgText>
                <SvgText x="18" y="22" textAnchor="middle" dy="1" fontSize="3">de 30 Días</SvgText>
            </Svg>
          </View>
          <Text style={styles.streakMotivation}>¡Sigue así!</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Logout')}><Text style={styles.logoutText}>Cerrar Sesión</Text></TouchableOpacity>
      <Modal visible={showEditModal} transparent={true} animationType="slide" onRequestClose={()=>setShowEditModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Detalles del Perfil</Text>
            <FormInput label="Nombre" value={formData.name} onChangeText={v=>handleInputChange('name', v)} />
            <FormInput label="Teléfono" value={formData.phoneno} onChangeText={v=>handleInputChange('phoneno', v.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="phone-pad" />
            <TouchableOpacity onPress={()=>setShowDatePicker(true)}><FormInput label="Fecha Nac." value={dob ? format(dob, "dd/MM/yyyy") : ''} editable={false} /></TouchableOpacity>
            {showDatePicker && <DateTimePicker value={dob||new Date()} mode="date" display="default" onChange={(e,d)=>{setShowDatePicker(false); if(d)setDob(d);}} />}
            <FormInput label="Dirección" value={formData.address} onChangeText={v=>handleInputChange('address', v)} />
            <View style={styles.modalFooter}><TouchableOpacity onPress={handleUpdateDetails} style={styles.saveBtn}><Text style={{color: 'white'}}>Guardar Cambios</Text></TouchableOpacity></View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
const DetailItem = ({ label, value }) => <View style={styles.detailItem}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || 'NA'}</Text></View>;
const FormInput = (props) => <View style={{marginBottom: 15}}><Text style={styles.formLabel}>{props.label}</Text><TextInput style={styles.formInput} {...props} /></View>;
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f7f7fe' },
    headerTitle: { fontSize: 32, fontWeight: '500', marginBottom: 24 },
    titleAccent: { color: '#443fe1', fontWeight: '700' },
    contentWrapper: { gap: 24 },
    card: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 24, padding: 24, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    cardTitle: { color: '#443fe1', fontSize: 20, fontWeight: '700' },
    editButton: { borderWidth: 2, borderColor: '#443fe1', borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16 },
    editButtonText: { color: '#443fe1', fontWeight: '600' },
    profileImageSection: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#443fe1', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    cameraImage: { width: 16, height: 16, tintColor: 'white' },
    imageActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    saveBtn: { backgroundColor: '#443fe1', borderRadius: 100, paddingVertical: 10, paddingHorizontal: 24 },
    cancelBtn: { borderColor: '#ccc', borderWidth: 2, borderRadius: 100, paddingVertical: 10, paddingHorizontal: 24 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    detailItem: { flexBasis: '48%', gap: 4 },
    detailLabel: { fontSize: 14, color: '#555' },
    detailValue: { fontSize: 16, fontWeight: '700' },
    streakContainer: { alignItems: 'center' },
    streakMotivation: { color: '#443fe1', textAlign: 'center', fontSize: 16, fontWeight: '600' },
    logoutButton: { alignSelf: 'center', backgroundColor: '#443fe1', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 40, maxWidth: 400, width: '100%', alignItems: 'center' },
    logoutText: { color: 'white', fontSize: 16, fontWeight: '600' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
    formLabel: { fontSize: 14, color: '#555', marginBottom: 8 },
    formInput: { backgroundColor: '#f7f7fe', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16 },
    modalFooter: { marginTop: 20, alignItems: 'flex-end' },
});

export default ManageAccount;