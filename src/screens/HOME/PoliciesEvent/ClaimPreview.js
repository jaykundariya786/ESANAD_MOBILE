import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, verticalScale, scale } from '@constants/metrics';
import Header from '@components/ui/Header';
import FloatingButton from '@components/ui/FloatingButton';
import { useFinalClaimSubmit } from '@hooks/policy/useMotorClaim';
import { SCREEN_NAMES } from '@constants/screenNames';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ClaimPreview = () => {
    const { theme } = useThemeContext();
    const styles = getStyles(theme);
    const navigation = useNavigation();
    const route = useRoute();
    const { claimData } = route.params || {};
    const { documents } = claimData || {};

    const [loader, setLoader] = useState(false);
    const { mutate: submitClaim } = useFinalClaimSubmit();

    const DetailRow = ({ label, value }) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '-'}</Text>
        </View>
    );

    const Section = ({ title, children, onEdit }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeading}>{title}</Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                        <Ionicons name="create-outline" size={scale(16)} color={theme.colors.primary} />
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    const handleSubmit = () => {
        setLoader(true);
        const formData = new FormData();

        // Add claim details
        Object.keys(claimData).forEach(key => {
            if (key !== 'documents') {
                formData.append(key, claimData[key]);
            }
        });

        // Add documents
        if (documents) {
            Object.keys(documents).forEach(key => {
                const file = documents[key];
                if (file) {
                    formData.append(key, {
                        uri: file.serverPath || file.uri || file.fileCopyUri,
                        type: file.type || 'image/jpeg',
                        name: file.name || `${key}_${Date.now()}.jpg`,
                    });
                }
            });
        }

        submitClaim(formData, {
            onSuccess: () => {
                setLoader(false);
                navigation.navigate(SCREEN_NAMES.THANKYOU_SCREEN, {
                    title: 'Claim Submitted!',
                    subtitle: 'Your motor insurance claim has been successfully submitted. Our team will review it and get back to you shortly.',
                });
            },
            onError: (error) => {
                setLoader(false);
                Alert.alert('Submission Failed', error?.message || 'Something went wrong while submitting your claim.');
            }
        });
    };

    const renderDocPreview = (label, file) => {
        if (!file) return null;
        const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

        return (
            <View style={styles.docItem}>
                <Text style={styles.docLabel}>{label}</Text>
                <View style={styles.docPreview}>
                    {isPdf ? (
                        <View style={styles.pdfContainer}>
                            <Ionicons name="document-text" size={scale(32)} color={theme.colors.primary} />
                            <Text style={styles.docName} numberOfLines={1}>{file.name}</Text>
                        </View>
                    ) : (
                        <Image source={{ uri: file.uri }} style={styles.imagePreview} resizeMode="cover" />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            <Header title="Details Preview" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Claim Summary</Text>
                    <Text style={styles.subheading}>Please review your details before submitting the claim.</Text>
                </View>

                <Section title="Claim Details" onEdit={() => navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS)}>
                    <DetailRow label="Customer Name" value={claimData?.customerName} />
                    <DetailRow label="Email" value={claimData?.customerEmail} />
                    <DetailRow label="Mobile No" value={claimData?.customerMobileNo} />
                    <DetailRow label="Policy Number" value={claimData?.policyNumber} />
                    <DetailRow label="Police Report No" value={claimData?.policeReportNumber} />
                    <DetailRow label="Plate Code" value={claimData?.plateCode} />
                    <DetailRow label="Plate Number" value={claimData?.plateNumber} />
                    <DetailRow label="Preferred Location" value={claimData?.preferredGarageLocation} />
                    <DetailRow label="Selected Garage" value={claimData?.selectedGarage} />
                </Section>

                <Section title="Documents" onEdit={() => navigation.navigate(SCREEN_NAMES.MOTOR_DOCUMENT_UPLOAD)}>
                    <View style={styles.docsGrid}>
                        {renderDocPreview('Registration Card', documents?.registrationCard)}
                        {renderDocPreview('Driving License', documents?.drivingLicense)}
                        {renderDocPreview('Emirates ID', documents?.emiratesId)}
                        {renderDocPreview('Police Report', documents?.policeReport)}
                    </View>
                </Section>
            </ScrollView>

            <FloatingButton
                title="Submit Claim"
                onPress={handleSubmit}
                loading={loader}
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
            padding: verticalScale(20),
            paddingBottom: verticalScale(100),
            gap: verticalScale(20),
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
        section: {
            backgroundColor: theme.colors.bgSecondary,
            borderRadius: 16,
            padding: scale(16),
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: verticalScale(15),
        },
        sectionHeading: {
            fontSize: fontScale(18),
            fontFamily: 'Lato-Black',
            color: theme.colors.text,
        },
        editButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(4),
            paddingHorizontal: scale(10),
            paddingVertical: verticalScale(4),
            backgroundColor: theme.colors.primary + '10',
            borderRadius: 20,
        },
        editText: {
            fontSize: fontScale(12),
            fontFamily: 'Lato-Bold',
            color: theme.colors.primary,
        },
        sectionContent: {
            gap: verticalScale(2),
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: verticalScale(10),
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border + '50',
        },
        detailLabel: {
            fontSize: fontScale(13),
            fontFamily: 'Lato-Regular',
            color: theme.colors.placeholder,
            flex: 1,
        },
        detailValue: {
            fontSize: fontScale(13),
            fontFamily: 'Lato-Bold',
            color: theme.colors.text,
            flex: 1.5,
            textAlign: 'right',
        },
        docsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: verticalScale(15),
        },
        docItem: {
            width: '47.5%',
            gap: verticalScale(8),
        },
        docLabel: {
            fontSize: fontScale(11),
            fontFamily: 'Lato-Bold',
            color: theme.colors.placeholder,
        },
        docPreview: {
            height: verticalScale(100),
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        imagePreview: {
            width: '100%',
            height: '100%',
        },
        pdfContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: scale(10),
        },
        docName: {
            fontSize: fontScale(9),
            fontFamily: 'Lato-Regular',
            color: theme.colors.textTertiary,
            marginTop: verticalScale(4),
            textAlign: 'center',
        },
    });

export default ClaimPreview;
