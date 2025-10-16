import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Toast from 'react-native-toast-message';
import { pick, isCancel } from '@react-native-documents/picker';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import api from '../utils/apiLogger';
import { registerEndpoint } from '../config/config';
import { VITE_APP_API_BASE_URL } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SignupScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(null);
  const [gender, setGender] = useState(null);
  const [dob, setDob] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phonenoError, setPhonenoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [dobError, setDobError] = useState('');
  const [roleError, setRoleError] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);

  const roleItems = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
  ];
  const genderItems = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const handleImagePick = async () => {
    try {
      const result = await pick({
        allowMultiSelection: false,
        type: ['image/*'],
      });
      setProfileImage(result[0]);
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Error', 'Could not pick image.');
      }
    }
  };

  const handlePhoneChange = value => {
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneno(value);
      if (phonenoError) setPhonenoError('');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      if (dobError) setDobError('');
    }
  };

  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setUsernameError('');
    setEmailError('');
    setPhonenoError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGenderError('');
    setDobError('');
    setRoleError('');

    if (!name) {
      setNameError('Name is required.');
      isValid = false;
    }
    if (!username) {
      setUsernameError('Username is required.');
      isValid = false;
    }
    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format.');
      isValid = false;
    }
    if (phoneno && phoneno.length !== 10) {
      setPhonenoError('Phone number must be 10 digits.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }
    if (!gender) {
      setGenderError('Gender is required.');
      isValid = false;
    }
    if (!dob) {
      setDobError('Date of Birth is required.');
      isValid = false;
    }
    if (!role) {
      setRoleError('Role is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('email', email.toLowerCase());
    formData.append('phoneno', phoneno ? `+91${phoneno}` : '');
    formData.append('password', password);
    formData.append('role', role);
    formData.append('gender', gender);
    formData.append('dob', dob ? format(dob, 'yyyy-MM-dd') : '');

    if (profileImage) {
      formData.append('profile_image', {
        uri: profileImage.uri,
        name: profileImage.name,
        type: profileImage.type,
      });
    }

    try {
      const response = await api.post(
        `${VITE_APP_API_BASE_URL}${registerEndpoint}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (response.status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Signup successful! Please log in.',
        });
        setTimeout(() => navigation.navigate('Login'), 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: response.data.message || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Something went wrong.';
      Toast.show({ type: 'error', text1: 'Signup Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create Your Account</Text>
              <Text style={styles.headerSubtitle}>
                Fill in your details to get started
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setNameError('');
                  }}
                />
              </View>
              {nameError ? <Text style={styles.inputError}>{nameError}</Text> : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#888"
                  value={username}
                  onChangeText={text => {
                    setUsername(text);
                    setUsernameError('');
                  }}
                />
              </View>
              {usernameError ? <Text style={styles.inputError}>{usernameError}</Text> : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email id"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailError('');
                  }}
                />
              </View>
              {emailError ? <Text style={styles.inputError}>{emailError}</Text> : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Optional)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phoneno}
                  onChangeText={handlePhoneChange}
                />
              </View>
              {phonenoError ? <Text style={styles.inputError}>{phonenoError}</Text> : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="Enter password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}>
                  <FontAwesomeIcon
                    icon={showPassword ? faEye : faEyeSlash}
                    size={20}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.inputError}>{passwordError}</Text> : null}

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="Confirm password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}>
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                    size={20}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.inputError}>{confirmPasswordError}</Text> : null}

              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    setGender(value);
                    setGenderError('');
                  }}
                  items={genderItems}
                  value={gender}
                  placeholder={{ label: 'Select Gender', value: null }}
                  style={pickerSelectStyles}
                />
              </View>
              {genderError ? <Text style={styles.inputError}>{genderError}</Text> : null}

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}>
                <Text
                  style={[
                    styles.input,
                    styles.datePickerText,
                    !dob && styles.placeholderText,
                  ]}>
                  {dob ? format(dob, 'dd/MM/yyyy') : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 1),
                    )
                  }
                />
              )}
              {dobError ? <Text style={styles.inputError}>{dobError}</Text> : null}

              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    setRole(value);
                    setRoleError('');
                  }}
                  items={roleItems}
                  value={role}
                  placeholder={{ label: 'Select a Role', value: null }}
                  style={pickerSelectStyles}
                />
              </View>
              {roleError ? <Text style={styles.inputError}>{roleError}</Text> : null}

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={handleImagePick}>
                <Text
                  style={[
                    styles.input,
                    styles.imagePickerText,
                    !profileImage && styles.placeholderText,
                  ]}
                  numberOfLines={1}>
                  {profileImage
                    ? profileImage.name
                    : 'Upload Profile Image (Optional)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Register Here</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Login')}>
                  Login
                </Text>
              </Text>
              <Text style={styles.termsText}>
                By signing up you agree to our{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Terms')}>
                  Terms of Use
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('Privacy')}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 52,
    fontSize: 16,
    paddingHorizontal: 16,
    color: '#242424',
  },
  inputAndroid: {
    height: 52,
    fontSize: 16,
    paddingHorizontal: 16,
    color: '#242424',
  },
  placeholder: {
    color: '#888',
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoidingView: { flex: 1 },
    scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: { paddingHorizontal: 20, paddingVertical: 30 },
  header: { alignItems: 'center', marginBottom: 30 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4A5568',
    textAlign: 'center',
  },
  form: { width: '100%' },
  inputContainer: {
    width: '100%',
    height: 52,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    height: 52,
    fontSize: 16,
    color: '#242424',
    paddingHorizontal: 16,
  },
  passwordToggle: { position: 'absolute', right: 14, top: 16, zIndex: 2 },
  inputError: {
    color: '#d93025',
    fontSize: 12,
    paddingLeft: 10,
    marginTop: -12,
    marginBottom: 10,
  },
  datePickerText: {
    lineHeight: 52,
  },
  imagePickerText: {
    lineHeight: 52,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#443fe1',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLink: { color: '#443fe1', fontWeight: '700' },
  termsText: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 20,
  },
});

export default SignupScreen;