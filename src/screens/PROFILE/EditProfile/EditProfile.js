import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { pick, types } from '@react-native-documents/picker';
import Pdf from 'react-native-pdf';
import dayjs from 'dayjs';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useAuthStore } from '@store/authStore';
import EditInput from '@components/ui/EditInput';
import DatePickerModal from '@components/ui/CustomDatePicker';
import Header from '@components/ui/Header';
import CustomButton from '@components/ui/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import { env } from '@config/index';

import {
  useProfile,
  useUpdateProfile,
  useUploadEmiratesId,
  useUploadDrivingLicense,
  useRemoveEmiratesId,
  useRemoveDrivingLicense,
  useVerifyEmiratesId,
  useVerifyDrivingLicense,
  useUploadProfilePic,
} from '@hooks/profile/useProfile';

import { ageCalculator } from '@utils/ageCalculator';

// Document Uploader Component
const DocumentUploadSection = ({
  docType,
  status,
  isLoading,
  file,
  theme,
  styles,
  onPress,
  onDelete,
}) => {
  const error = status === 'error';
  const fileUri = file;

  return (
    <View style={styles.docUploadContainer}>
      <View style={styles.docHeader}>
        <Text style={styles.docTitle}>{docType.label}</Text>
        {fileUri ? (
          <TouchableOpacity
            style={styles.trashCircle}
            activeOpacity={0.8}
            onPress={onDelete}
          >
            <Icon name="trash-2" size={scale(16)} color={theme.colors.red} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.uploadZone,
          {
            borderColor: error
              ? theme.colors.red
              : status === 'uploaded'
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: fileUri
              ? theme.colors.backgroundColor
              : theme.colors.primary + '05',
          },
        ]}
        disabled={fileUri != null}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={styles.uploadContent}>
          {fileUri ? (
            <View style={styles.filePreviewWrapper}>
              {fileUri.includes('pdf') ||
              fileUri.toLowerCase().endsWith('.pdf') ? (
                <View style={styles.imagePreviewContainer}>
                  <Pdf
                    trustAllCerts={false}
                    source={{ uri: fileUri, cache: true }}
                    style={styles.imagePreview}
                    singlePage={true}
                  />
                </View>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: fileUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderState}>
              <Icon
                name="upload-cloud"
                size={scale(28)}
                color={
                  isLoading ? theme.colors.primary : theme.colors.textTertiary
                }
              />
              <Text style={styles.uploadDescription}>
                <Text style={styles.browseText}>Upload</Text> your{' '}
                {docType.label.toLowerCase()}
              </Text>
              <Text style={styles.fileFormatInfo}>
                JPEG, PNG, PDF up to 5MB
              </Text>
            </View>
          )}
        </View>

        {status === 'uploaded' && !isLoading && (
          <View style={styles.successPill}>
            <Icon
              name="check-circle"
              size={scale(12)}
              color={theme.colors.primary}
            />
            <Text style={styles.successPillText}>Verified</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const EditProfileForm = ({
  control,
  watch,
  theme,
  styles,
  bottom,
  onSubmit,
  openDatePicker,
  handleEmiratesIdChange,
  emiratesDocument,
  drivingDocument,
  documentStatus,
  validationLoader,
  handleDocumentPick,
  handleDeleteDocument,
  showDatePicker,
  closeDatePicker,
  handleDateConfirm,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottom + verticalScale(80) },
      ]}
    >
      {/* IDENTITY DATA CARD */}
      <Text style={styles.groupHeader}>Personal Identity</Text>
      <View style={styles.cardGroup}>
        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="mobileNumber"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Phone Number"
                placeholder="5XXXXXXXX"
                value={value}
                prefix="+971"
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={9}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="emiratesId"
            render={({ field: { value } }) => (
              <EditInput
                title="Emirates ID"
                placeholder="784-XXXX-XXXXXXX-X"
                value={value}
                onChangeText={handleEmiratesIdChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Email Address"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
      </View>

      {/* DEMOGRAPHIC DATA CARD */}
      <Text style={styles.groupHeader}>Demographics & Location</Text>
      <View style={styles.cardGroup}>
        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { value } }) => (
              <View style={styles.dobContainer}>
                <View>
                  <Text style={styles.dobLabel}>Date of Birth</Text>
                  <Text style={styles.dobText}>
                    {value ? dayjs(value).format('DD/MM/YYYY') : 'Select Date'}
                    <Text style={styles.ageText}>
                      {' '}
                      • {ageCalculator(watch('dateOfBirth')) || 'Age'}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dobButton}
                  onPress={openDatePicker}
                >
                  <Icon
                    name="calendar"
                    size={scale(18)}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Gender"
                placeholder="e.g. Male"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Marital Status"
                placeholder="e.g. Single"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="nationality"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Nationality"
                placeholder="e.g. Indian"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="City"
                placeholder="e.g. Dubai"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
        <View style={styles.rowDivider} />

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="occupation"
            render={({ field: { onChange, value } }) => (
              <EditInput
                title="Occupation"
                placeholder="e.g. Software Engineer"
                value={value}
                onChangeText={onChange}
                canEdit
              />
            )}
          />
        </View>
      </View>

      {/* DOCUMENTS CARD */}
      <Text style={styles.groupHeader}>Verified Documents</Text>
      <View style={styles.cardGroup}>
        <DocumentUploadSection
          docType={{
            key: 'emiratesId',
            label: 'Emirates ID',
            type: [types.pdf, types.images],
          }}
          status={documentStatus.emiratesId}
          isLoading={validationLoader.emiratesId}
          file={emiratesDocument}
          theme={theme}
          styles={styles}
          onPress={() =>
            handleDocumentPick('emiratesId', [types.pdf, types.images])
          }
          onDelete={() => handleDeleteDocument('emiratesId')}
        />
        <View style={styles.rowDividerSecondary} />
        <DocumentUploadSection
          docType={{
            key: 'drivingLicense',
            label: 'Driving License',
            type: [types.pdf, types.images],
          }}
          status={documentStatus.drivingLicense}
          isLoading={validationLoader.drivingLicense}
          file={drivingDocument}
          theme={theme}
          styles={styles}
          onPress={() =>
            handleDocumentPick('drivingLicense', [types.pdf, types.images])
          }
          onDelete={() => handleDeleteDocument('drivingLicense')}
        />
      </View>

      <DatePickerModal
        visible={showDatePicker}
        initialDate={new Date()}
        onClose={closeDatePicker}
        onConfirm={handleDateConfirm}
        maxDate={moment().subtract(18, 'years').toDate()}
      />
    </ScrollView>
  );
};

// Main Component
const EditProfile = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { user, setUserDetailsUpdate } = useAuthStore();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: getProfile } = useProfile();

  const { mutate: uploadEmiratesId } = useUploadEmiratesId();
  const { mutate: uploadDrivingLicense } = useUploadDrivingLicense();
  const { mutate: verifyEmiratesId } = useVerifyEmiratesId();
  const { mutate: verifyDrivingLicense } = useVerifyDrivingLicense();
  const { mutate: uploadProfilePic } = useUploadProfilePic();
  const { mutate: removeEmiratesId } = useRemoveEmiratesId();
  const { mutate: removeDrivingLicense } = useRemoveDrivingLicense();

  const [emiratesDocument, setEmiratesDocument] = useState(null);
  const [drivingDocument, setDrivingDocument] = useState(null);
  const [emiratesRefPath, setEmiratesRefPath] = useState(null);
  const [drivingRefPath, setDrivingRefPath] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationLoader, setValidationLoader] = useState({});
  const [documentStatus, setDocumentStatus] = useState({});
  const [countryCode, setCountryCode] = useState('971');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: user?.fullName || '',
      mobileNumber: user?.mobileNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
      email: user?.email || '',
      emiratesId: user?.emiratesId || '',
      gender: user?.gender || '',
      maritalStatus: user?.maritalStatus || '',
      nationality: user?.nationality || '',
      city: user?.city || '',
      occupation: user?.occupation || '',
    },
  });

  useEffect(() => {
    if (user) {
      Object.keys(user).forEach(key => {
        if (typeof user[key] === 'string' || typeof user[key] === 'number') {
          setValue(key, user[key] || '');
        }
      });
      if (user.countryCode) setCountryCode(user.countryCode);
      if (user.emiratesIdP?.path)
        setEmiratesDocument(env.API_URL + user.emiratesIdP.path);
      if (user.drivingLicenseP?.path)
        setDrivingDocument(env.API_URL + user.drivingLicenseP.path);
    }
  }, [user, setValue]);

  const handleEmiratesIdChange = text => {
    let digits = text.replace(/\D/g, '');
    let masked = '';
    if (digits.length > 0) masked += digits.substring(0, 3);
    if (digits.length > 3) masked += '-' + digits.substring(3, 7);
    if (digits.length > 7) masked += '-' + digits.substring(7, 14);
    if (digits.length > 14) masked += '-' + digits.substring(14, 15);
    setValue('emiratesId', masked);
  };

  const handleDocumentPick = async (docKey, docType) => {
    try {
      const result = await pick({ type: docType, allowMultiSelection: false });
      handleValidationCheck(docKey, [result[0]]);
    } catch (err) {
      if (err.code !== 'RNDocumentPickerCanceled')
        Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleValidationCheck = async (docKey, files = []) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', {
        uri: file.uri || file.fileCopyUri,
        type: file.type || 'image/jpeg',
        name: file.name || `file_${Date.now()}.jpg`,
      });
    });

    setValidationLoader(prev => ({ ...prev, [docKey]: true }));
    const docConfig = {
      emiratesId: {
        verifyFn: verifyEmiratesId,
        uploadFn: uploadEmiratesId,
        uploadKey: 'emiratesId',
      },
      drivingLicense: {
        verifyFn: verifyDrivingLicense,
        uploadFn: uploadDrivingLicense,
        uploadKey: 'drivingLicense',
      },
    };
    const currentDoc = docConfig[docKey];

    currentDoc.verifyFn(formData, {
      onSuccess: res => {
        const uploadFormData = new FormData();
        uploadFormData.append('text', JSON.stringify(res?.data?.data?.text));
        files.forEach(file => {
          uploadFormData.append(currentDoc.uploadKey, {
            uri: file.uri || file.fileCopyUri,
            type: file.type || 'image/jpeg',
            name: file.name || `file_${Date.now()}.jpg`,
          });
        });
        currentDoc.uploadFn(
          { id: user?._id, data: uploadFormData },
          {
            onSuccess: res => {
              setDocumentStatus(prev => ({ ...prev, [docKey]: 'uploaded' }));
              setValidationLoader(prev => ({ ...prev, [docKey]: false }));
              const path = res?.data?.data?.[docKey + 'P']?.path;
              if (docKey === 'emiratesId') {
                setEmiratesDocument(env.API_URL + path);
                setEmiratesRefPath(path);
              } else {
                setDrivingDocument(env.API_URL + path);
                setDrivingRefPath(path);
              }
              getProfile();
            },
            onError: () => {
              setDocumentStatus(prev => ({ ...prev, [docKey]: 'error' }));
              setValidationLoader(prev => ({ ...prev, [docKey]: false }));
            },
          },
        );
      },
      onError: () => {
        Alert.alert('Error', 'Verification failed');
        setDocumentStatus(prev => ({ ...prev, [docKey]: 'error' }));
        setValidationLoader(prev => ({ ...prev, [docKey]: false }));
      },
    });
  };

  const handleImagePick = async () => {
    try {
      const result = await pick({
        type: types.images,
        allowMultiSelection: false,
      });
      if (result && result.length > 0) {
        const file = result[0];
        const formData = new FormData();
        formData.append('profilePic', {
          uri: file.uri || file.fileCopyUri,
          type: file.type || 'image/jpeg',
          name: file.name || `profile_${Date.now()}.jpg`,
        });
        formData.append('userId', user?._id);
        uploadProfilePic(formData, { onSuccess: () => getProfile() });
      }
    } catch (err) {
      if (err.code !== 'RNDocumentPickerCanceled')
        console.log('Picker error:', err);
    }
  };

  const handleDeleteDocument = docKey => {
    if (docKey === 'emiratesId') {
      removeEmiratesId(
        { id: user?._id },
        {
          onSuccess: () => {
            setEmiratesDocument(null);
            setEmiratesRefPath(null);
            setDocumentStatus(prev => ({ ...prev, [docKey]: null }));
            getProfile();
          },
        },
      );
    } else if (docKey === 'drivingLicense') {
      removeDrivingLicense(
        { id: user?._id },
        {
          onSuccess: () => {
            setDrivingDocument(null);
            setDrivingRefPath(null);
            setDocumentStatus(prev => ({ ...prev, [docKey]: null }));
            getProfile();
          },
        },
      );
    }
  };

  const onSubmit = data => {
    try {
      const updatedData = {
        ...data,
        countryCode,
        mobile: `${countryCode}${data.mobileNumber}`,
        emiratesIdP: emiratesRefPath || user?.emiratesIdP?.path,
        drivingLicenseP: drivingRefPath || user?.drivingLicenseP?.path || '',
        profilePic: user?.profilePic?.documentUrl,
      };
      updateProfile(updatedData, {
        onSuccess: () => {
          getProfile();
          setUserDetailsUpdate(false);
          // navigation.goBack();
        },
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const getBottomPadding = () => {
    return Platform.OS === 'ios'
      ? verticalScale(insets.bottom + 10)
      : verticalScale(24);
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" onBack={() => navigation.goBack()} />

      {/* Modern Identity Header */}
      <View style={styles.userSummaryBlock}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleImagePick}
          activeOpacity={0.8}
        >
          {user?.profilePic?.documentUrl ? (
            <Image
              source={{ uri: user?.profilePic?.documentUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Icon
              name="camera"
              size={scale(12)}
              color={theme.colors.backgroundColor}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>
            {user?.email || 'email@example.com'}
          </Text>
          <View style={styles.referralChip}>
            <Icon name="tag" size={scale(10)} color={theme.colors.primary} />
            <Text style={styles.referralText}>
              {(user?.referralCode || 'ESANAD2360').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <EditProfileForm
        control={control}
        watch={watch}
        theme={theme}
        bottom={getBottomPadding()}
        styles={styles}
        openDatePicker={() => setShowDatePicker(true)}
        handleEmiratesIdChange={handleEmiratesIdChange}
        emiratesDocument={emiratesDocument}
        drivingDocument={drivingDocument}
        documentStatus={documentStatus}
        validationLoader={validationLoader}
        handleDocumentPick={handleDocumentPick}
        handleDeleteDocument={handleDeleteDocument}
        showDatePicker={showDatePicker}
        closeDatePicker={() => setShowDatePicker(false)}
        handleDateConfirm={date => {
          setShowDatePicker(false);
          setValue('dateOfBirth', dayjs(date).format('YYYY-MM-DD'));
        }}
      />

      {/* Floating Action Button */}
      <View
        style={[styles.footerContainer, { paddingBottom: getBottomPadding() }]}
      >
        <CustomButton
          title="Save Changes"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={styles.saveButton}
        />
      </View>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      paddingBottom: verticalScale(40),
    },

    // User Summary
    userSummaryBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(24),
      backgroundColor: theme.colors.bgSecondary,
      borderBottomWidth: 1,
      borderColor: theme.colors.border + '40',
      marginBottom: verticalScale(16),
    },
    avatarWrapper: {
      marginRight: scale(16),
      position: 'relative',
    },
    avatarImage: {
      width: scale(72),
      height: scale(72),
      borderRadius: scale(36),
      backgroundColor: theme.colors.border,
    },
    avatarPlaceholder: {
      width: scale(72),
      height: scale(72),
      borderRadius: scale(36),
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    avatarInitial: {
      fontSize: fontScale(28),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.bgSecondary,
      elevation: 2,
    },
    userInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    userName: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    userEmail: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginBottom: verticalScale(8),
    },
    referralChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
      gap: scale(4),
    },
    referralText: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },

    // Card Groups
    groupHeader: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginHorizontal: scale(24),
      marginBottom: verticalScale(8),
      marginTop: verticalScale(16),
    },
    cardGroup: {
      backgroundColor: theme.colors.bgSecondary,
      marginHorizontal: scale(20),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      overflow: 'hidden',
    },
    inputWrapper: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(4),
    },
    rowDivider: {
      height: 1,
      backgroundColor: theme.colors.border + '40',
      marginLeft: scale(16),
    },
    rowDividerSecondary: {
      height: 1,
      backgroundColor: theme.colors.border + '40',
      marginHorizontal: scale(16),
    },

    // Date Picker Input Style Custom
    dobContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(14),
    },
    dobLabel: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginBottom: verticalScale(4),
    },
    dobText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    ageText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
    },
    dobButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: theme.colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Documents
    docUploadContainer: {
      padding: scale(16),
    },
    docHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    docTitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    trashCircle: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      backgroundColor: theme.colors.red + '10',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadZone: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: scale(12),
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    uploadContent: {
      alignItems: 'center',
      width: '100%',
    },
    placeholderState: {
      alignItems: 'center',
    },
    uploadDescription: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginTop: verticalScale(8),
    },
    browseText: {
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    fileFormatInfo: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
      marginTop: verticalScale(4),
    },
    filePreviewWrapper: {
      width: '90%',
      height: verticalScale(140),
      borderRadius: scale(8),
      overflow: 'hidden',
    },

    imagePreview: {
      width: '100%',
      height: '100%',
    },
    successPill: {
      position: 'absolute',
      right: scale(12),
      top: scale(12),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderRadius: scale(10),
      gap: scale(4),
    },
    successPillText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },

    // Fixed Footer
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.backgroundColor,
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(16),
      borderTopWidth: 1,
      borderColor: theme.colors.border + '50',
    },
    saveButton: {
      width: '100%',
      height: verticalScale(50),
      borderRadius: scale(12),
    },
  });

export default EditProfile;
