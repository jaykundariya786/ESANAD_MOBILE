import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, verticalScale, scale } from '@constants/metrics';
import Header from '@components/ui/Header';
import FloatingButton from '@components/ui/FloatingButton';
import { pick, types } from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useVerifyCarRegistration,
  useVerifyDrivingLicense,
  useVerifyEmiratesId,
  useVerifyPoliceReport,
  useExtractEmiratesId,
  useExtractDrivingLicense,
  useExtractPoliceReport,
} from '@hooks/policy/useMotorClaim';
import { useUploadItVehicleDocuments } from '@hooks/policy/useMotorPolicy';

import { SCREEN_NAMES } from '@constants/screenNames';
import { env } from '@config/index';

const MotorDocumentUpload = () => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation();
  const route = useRoute();
  const { claimData } = route.params || {};

  const [documents, setDocuments] = useState({
    registrationCard: null,
    drivingLicense: null,
    emiratesId: null,
    policeReport: null,
  });

  const [statuses, setStatuses] = useState({
    registrationCard: 'idle', // idle, loading, uploaded, error
    drivingLicense: 'idle',
    emiratesId: 'idle',
    policeReport: 'idle',
  });

  const { mutate: verifyReg } = useVerifyCarRegistration();
  const { mutate: verifyLicense } = useVerifyDrivingLicense();
  const { mutate: verifyId } = useVerifyEmiratesId();
  const { mutate: verifyPolice } = useVerifyPoliceReport();

  const { mutate: uploadEmirates } = useExtractEmiratesId();
  const { mutate: uploadLicense } = useExtractDrivingLicense();
  const { mutate: uploadReg } = useUploadItVehicleDocuments();
  const { mutate: uploadPolice } = useExtractPoliceReport();

  const handleDocumentPick = async key => {
    try {
      const result = await pick({
        type: [types.images, types.pdf],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        uploadAndVerify(key, file);
      }
    } catch (err) {
      if (err.code !== 'RNDocumentPickerCanceled') {
        console.log('Picker error:', err);
      }
    }
  };

  const uploadAndVerify = (key, file) => {
    setStatuses(prev => ({ ...prev, [key]: 'loading' }));

    const formData = new FormData();
    formData.append('files', {
      uri: file.uri || file.fileCopyUri,
      type: file.type || 'image/jpeg',
      name: file.name || `${key}_${Date.now()}.jpg`,
    });

    const verifyFns = {
      registrationCard: verifyReg,
      drivingLicense: verifyLicense,
      emiratesId: verifyId,
      policeReport: verifyPolice,
    };

    const uploadFns = {
      registrationCard: {
        fn: uploadReg,
        key: 'registrationCard',
        needsCarId: false,
        extraData: { documentType: 'registrationCard', isCarCreate: 'false' },
      },
      drivingLicense: {
        fn: uploadLicense,
        key: 'drivingLicense',
        needsCarId: false,
      },
      emiratesId: { fn: uploadEmirates, key: 'emiratesId', needsCarId: false },
      policeReport: {
        fn: uploadPolice,
        key: 'policeReport',
        needsCarId: false,
      },
    };

    const verifyFn = verifyFns[key];
    const uploadConfig = uploadFns[key];

    if (!verifyFn) {
      setStatuses(prev => ({ ...prev, [key]: 'error' }));
      return;
    }

    verifyFn(formData, {
      onSuccess: res => {
        if (res?.data?.data?.text) {
          if (uploadConfig) {
            const uploadFormData = new FormData();
            const textObj = res?.data?.data?.text;

            if (uploadConfig.key === 'registrationCard') {
              if (textObj) {
                Object.keys(textObj).forEach(k => {
                  uploadFormData.append(
                    `text[${k}]`,
                    JSON.stringify(textObj[k]),
                  );
                });
              }
            } else {
              uploadFormData.append('text', JSON.stringify(textObj));
            }

            if (uploadConfig.extraData) {
              Object.keys(uploadConfig.extraData).forEach(k => {
                uploadFormData.append(k, uploadConfig.extraData[k]);
              });
            }

            uploadFormData.append(uploadConfig.key, {
              uri: file.uri || file.fileCopyUri,
              type: file.type || 'image/jpeg',
              name: file.name || `${key}_${Date.now()}.jpg`,
            });

            const payload = uploadConfig.needsCarId
              ? {
                  carId: claimData?.carId?._id || claimData?.carId || '',
                  data: uploadFormData,
                }
              : uploadFormData;

            uploadConfig.fn(payload, {
              onSuccess: uploadRes => {
                setStatuses(prev => ({ ...prev, [key]: 'uploaded' }));
                const path =
                  env.API_URL +
                  (uploadRes?.data?.fileUrl?.path ||
                    uploadRes?.data?.fileUrl?.documentUrl);

                setDocuments(prev => ({
                  ...prev,
                  [key]: path ? { ...file, serverPath: path } : file,
                }));
              },
              onError: () => setStatuses(prev => ({ ...prev, [key]: 'error' })),
            });
          } else {
            setStatuses(prev => ({ ...prev, [key]: 'uploaded' }));
            const serverDocPath =
              res?.data?.fileUrl?.path ||
              res?.data?.fileUrl?.documentUrl ||
              res?.data?.data?.[`${key}P`]?.path ||
              res?.data?.data?.documentUrl?.path ||
              res?.data?.data?.path;
            setDocuments(prev => ({
              ...prev,
              [key]: serverDocPath
                ? { ...file, serverPath: serverDocPath }
                : file,
            }));
          }
        } else {
          setStatuses(prev => ({ ...prev, [key]: 'error' }));
        }
      },
      onError: () => {
        setStatuses(prev => ({ ...prev, [key]: 'error' }));
      },
    });
  };

  const isAllUploaded =
    statuses.registrationCard === 'uploaded' &&
    statuses.drivingLicense === 'uploaded' &&
    statuses.emiratesId === 'uploaded' &&
    statuses.policeReport === 'uploaded';

  const handleNext = () => {
    navigation.navigate(SCREEN_NAMES.CLAIM_PREVIEW, {
      claimData: { ...claimData, documents },
    });
  };

  const renderUploader = (label, key, icon) => {
    const status = statuses[key];
    const file = documents[key];

    return (
      <TouchableOpacity
        style={[
          styles.uploadCard,
          status === 'uploaded' && styles.successCard,
          status === 'error' && styles.errorCard,
          status === 'loading' && styles.loadingCard,
        ]}
        onPress={() => handleDocumentPick(key)}
        disabled={status === 'loading'}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            {status === 'loading' ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Ionicons
                name={status === 'uploaded' ? 'checkmark-circle' : icon}
                size={scale(32)}
                color={
                  status === 'uploaded'
                    ? theme.colors.primary
                    : theme.colors.textTertiary
                }
              />
            )}
          </View>
          <Text style={styles.cardLabel}>{label}</Text>
          {file ? (
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
          ) : (
            <Text style={styles.uploadHint}>Tap to upload</Text>
          )}
        </View>
        {status === 'uploaded' && (
          <View style={styles.statusBadge}>
            <Ionicons
              name="checkmark-sharp"
              size={scale(12)}
              color={theme.colors.backgroundColor}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <Header title="Document Upload" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Document Upload</Text>
          <Text style={styles.subheading}>
            Please upload the required documents to process your claim.
          </Text>
        </View>

        <View style={styles.grid}>
          {renderUploader(
            'Registration Card',
            'registrationCard',
            'car-outline',
          )}
          {renderUploader('Driving License', 'drivingLicense', 'card-outline')}
          {renderUploader('Emirates ID', 'emiratesId', 'person-outline')}
          {renderUploader(
            'Police Report',
            'policeReport',
            'shield-checkmark-outline',
          )}
        </View>
      </ScrollView>

      <FloatingButton
        disabled={!isAllUploaded}
        onPress={handleNext}
        isShowIcon
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    container: {
      flexGrow: 1,
      gap: verticalScale(20),
      padding: verticalScale(20),
      paddingBottom: verticalScale(100),
    },
    header: {
      gap: verticalScale(5),
    },
    heading: {
      fontSize: fontScale(24),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheading: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.placeholder,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: verticalScale(15),
    },
    uploadCard: {
      width: '47.5%',
      aspectRatio: 1,
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      padding: scale(15),
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '05',
    },
    successCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
      borderStyle: 'solid',
    },
    errorCard: {
      borderColor: theme.colors.red,
      backgroundColor: theme.colors.red + '10',
      borderStyle: 'solid',
    },
    cardContent: {
      alignItems: 'center',
      gap: verticalScale(8),
    },
    iconContainer: {
      width: scale(56),
      height: scale(56),
      borderRadius: 28,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    cardLabel: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    fileName: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    uploadHint: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
    },
    statusBadge: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
      width: scale(20),
      height: scale(20),
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default MotorDocumentUpload;
