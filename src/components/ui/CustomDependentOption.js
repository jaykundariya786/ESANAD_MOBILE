// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import CheckBox from '@react-native-community/checkbox';
// import Icons from 'react-native-vector-icons/Entypo';

// import { fontScale, verticalScale } from '@constants/metrics';
// import { useThemeContext } from '@theme/ThemeProvider';
// import DatePickerModal from './CustomDatePicker';
// import { ageCalculator } from '@utils/ageCalculator';
// import CustomRadioGroup from './CustomRadioGroup';
// import Calender from '@assets/icons/Calender';
// import FloatingLabelInput from './FloatingLabelInput';

// const createEmptyDependent = type => ({
//   fullName: '',
//   dateOfBirth: null,
//   age: '',
//   gender: null,
//   relation: type === 'Kids' ? '' : undefined,
// });

// const formatGender = gender => {
//   if (!gender) return null;
//   return gender === 'male' ? 'Male' : 'Female';
// };

// const getRelationFromGender = gender => {
//   if (!gender) return '';
//   return gender === 'male' ? 'Son' : 'Daughter';
// };

// const CustomDependentOption = ({
//   type,
//   error,
//   showErrorMessage = false,
//   onDependentsChange,
// }) => {
//   const { theme } = useThemeContext();
//   const styles = useMemo(() => createStyles(theme), [theme]);

//   const label = type === 'Kids' ? 'Kids' : 'Spouse';

//   const [focusedField, setFocusedField] = useState(null);
//   const [activeDatePicker, setActiveDatePicker] = useState(null);
//   const [dependents, setDependents] = useState([createEmptyDependent(type)]);

//   useEffect(() => {
//     if (!onDependentsChange) return;

//     const formattedDependents = dependents.map(dep => {
//       const formatted = {
//         fullName: dep.fullName,
//         dateOfBirth: dep.dateOfBirth ? dep.dateOfBirth.toISOString() : null,
//         age: dep.age || 0,
//         gender: formatGender(dep.gender),
//       };

//       if (type === 'Kids') {
//         formatted.relation = dep.relation || getRelationFromGender(dep.gender);
//       }

//       return formatted;
//     });

//     onDependentsChange(formattedDependents);
//   }, [onDependentsChange]);

//   const addDependent = useCallback(() => {
//     setDependents(prev => [...prev, createEmptyDependent(type)]);
//   }, [type]);

//   const removeDependent = useCallback(() => {
//     setDependents(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
//   }, []);

//   const updateField = useCallback(
//     (index, field, newValue) => {
//       setDependents(prev => {
//         const updated = [...prev];
//         updated[index] = { ...updated[index], [field]: newValue };

//         if (field === 'gender' && type === 'Kids') {
//           updated[index].relation = getRelationFromGender(newValue);
//         }

//         return updated;
//       });
//     },
//     [type],
//   );

//   const confirmDate = useCallback((date, index) => {
//     setDependents(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         dateOfBirth: date,
//         age: ageCalculator(date),
//       };
//       return updated;
//     });

//     setActiveDatePicker(null);
//   }, []);

//   const maxDate = useMemo(() => {
//     if (type === 'Kids') return new Date();
//     const date = new Date();
//     date.setFullYear(date.getFullYear() - 18);
//     return date;
//   }, [type]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.label}>{label}</Text>

//         {label === 'Kids' && (
//           <View style={styles.counterContainer}>
//             <TouchableOpacity
//               onPress={removeDependent}
//               style={styles.iconButton}
//               disabled={dependents.length <= 1}
//             >
//               <Icons
//                 name="minus"
//                 size={10}
//                 color={theme.colors.primary}
//                 style={{ opacity: dependents.length > 1 ? 1 : 0.4 }}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={addDependent} style={styles.iconButton}>
//               <Icons name="plus" size={10} color={theme.colors.primary} />
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {dependents.map((dependent, index) => (
//         <View
//           key={index}
//           style={[
//             styles.detailsContainer,
//             dependents.length > 1 &&
//               index < dependents.length - 1 &&
//               styles.divider,
//           ]}
//         >
//           <View style={styles.detailsRow}>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 value={dependent.fullName}
//                 onChangeText={text => updateField(index, 'fullName', text)}
//                 placeholder="Full Name"
//                 placeholderTextColor={theme.colors.textTertiary}
//                 onFocus={() => setFocusedField(`fullName-${index}`)}
//                 onBlur={() => setFocusedField(null)}
//                 style={[
//                   styles.input,
//                   {
//                     borderColor:
//                       focusedField === `fullName-${index}`
//                         ? theme.colors.primary
//                         : showErrorMessage && !dependent.fullName && error
//                         ? theme.colors.red
//                         : theme.colors.border,
//                   },
//                 ]}
//               />

//               {showErrorMessage && !dependent.fullName && error && (
//                 <Text style={styles.errorText}>Full name is required</Text>
//               )}
//             </View>

//             <View style={styles.rowBetween}>
//               <View style={styles.dateContainer}>
//                 <TouchableOpacity
//                   style={[
//                     styles.dobButton,
//                     showErrorMessage &&
//                       !dependent.dateOfBirth &&
//                       error &&
//                       styles.errorBorder,
//                   ]}
//                   onPress={() => setActiveDatePicker(index)}
//                 >
//                   <Text
//                     style={{
//                       color: dependent.dateOfBirth
//                         ? theme.colors.text
//                         : theme.colors.textTertiary,
//                       fontSize: fontScale(16),
//                       fontFamily: 'Lato-Regular',
//                     }}
//                   >
//                     {dependent.dateOfBirth
//                       ? dependent.dateOfBirth.toISOString().split('T')[0]
//                       : 'Date of Birth'}
//                   </Text>
//                   <Calender />
//                 </TouchableOpacity>

//                 <DatePickerModal
//                   visible={activeDatePicker === index}
//                   maxDate={maxDate}
//                   initialDate={dependent.dateOfBirth}
//                   onClose={() => setActiveDatePicker(null)}
//                   onConfirm={date => confirmDate(date, index)}
//                 />

//                 {showErrorMessage && !dependent.dateOfBirth && error && (
//                   <Text style={styles.errorText}>DOB is required</Text>
//                 )}
//               </View>

//               <View style={styles.ageContainer}>
//                 <Text
//                   style={
//                     dependent.age ? styles.ageText : styles.placeholderText
//                   }
//                 >
//                   {dependent.age || 'Age'}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View>
//             <View style={styles.genderRow}>
//               <Text style={styles.genderLabel}>Gender :</Text>
//               <CustomRadioGroup
//                 options={[
//                   { label: 'Male', value: 'male' },
//                   { label: 'Female', value: 'female' },
//                 ]}
//                 selected={dependent.gender}
//                 onChange={val => updateField(index, 'gender', val?.value)}
//               />
//             </View>

//             {showErrorMessage && !dependent.gender && error && (
//               <Text
//                 style={[styles.errorText, { marginTop: verticalScale(-5) }]}
//               >
//                 Gender is required
//               </Text>
//             )}
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// };

// export default React.memo(CustomDependentOption);

// const createStyles = theme =>
//   StyleSheet.create({
//     container: {
//       alignItems: 'flex-start',
//       gap: verticalScale(10),
//     },
//     headerContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: verticalScale(10),
//     },
//     checkbox: {
//       width: 20,
//       height: 20,
//       borderColor: theme.colors.border,
//     },
//     label: {
//       flex: 1,
//       fontSize: fontScale(16),
//       color: theme.colors.text,
//       fontWeight: '600',
//     },
//     counterContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: verticalScale(8),
//     },
//     iconButton: {
//       borderWidth: 1,
//       borderColor: theme.colors.primary,
//       borderRadius: verticalScale(7),
//       padding: verticalScale(4),
//       backgroundColor: theme.colors.backgroundColor,
//     },
//     detailsContainer: {
//       width: '100%',
//       marginTop: verticalScale(10),
//       paddingBottom: verticalScale(10),
//     },
//     divider: {
//       borderBottomWidth: 1,
//       borderBottomColor: theme.colors.border,
//     },
//     detailsRow: {
//       gap: verticalScale(15),
//     },
//     inputContainer: {
//       flex: 1,
//     },
//     input: {
//       fontSize: verticalScale(16),
//       height: verticalScale(50),
//       color: theme.colors.text,
//       fontWeight: '500',
//       backgroundColor: theme.colors.backgroundColor,
//       borderRadius: verticalScale(7),
//       borderWidth: 1,
//       paddingHorizontal: verticalScale(15),
//     },
//     disabledInput: {
//       flex: 1,
//       justifyContent: 'center',
//       borderRadius: verticalScale(7),
//       paddingHorizontal: verticalScale(15),
//       borderWidth: 1,
//       borderColor: theme.colors.border,
//       height: verticalScale(50),
//     },
//     placeholderText: {
//       color: theme.colors.textTertiary,
//       fontSize: verticalScale(16),
//     },
//     rowBetween: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'flex-start',
//       gap: verticalScale(15),
//     },
//     dateContainer: {
//       flex: 1,
//     },
//     dobButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       gap: verticalScale(10),
//       borderWidth: 1,
//       borderRadius: verticalScale(7),
//       paddingVertical: verticalScale(15),
//       paddingHorizontal: verticalScale(15),
//       backgroundColor: theme.colors.backgroundColor,
//       borderColor: theme.colors.border,
//       height: verticalScale(50),
//     },
//     ageContainer: {
//       borderRadius: verticalScale(7),
//       borderWidth: 1,
//       width: '30%',
//       height: verticalScale(50),
//       borderColor: theme.colors.border,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     ageText: {
//       fontSize: fontScale(16),
//       color: theme.colors.text,
//       fontWeight: '500',
//       paddingHorizontal: verticalScale(10),
//     },
//     genderLabel: {
//       fontSize: fontScale(15),
//       color: theme.colors.text,
//       fontWeight: '500',
//     },
//     errorText: {
//       color: theme.colors.red,
//       fontSize: verticalScale(12),
//       marginTop: verticalScale(4),
//     },
//     errorBorder: {
//       borderColor: theme.colors.red,
//     },
//     genderRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: verticalScale(10),
//       paddingTop: verticalScale(8),
//     },
//   });

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icons from 'react-native-vector-icons/Entypo';

import { fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { ageCalculator } from '@utils/ageCalculator';
import FloatingLabelInput from './FloatingLabelInput';
import SegmentedToggle from './SegmentedToggle';
import DobAgePicker from './DobAgePicker';

const createEmptyDependent = type => ({
  fullName: '',
  dateOfBirth: null,
  age: '',
  gender: null,
  relation: type === 'Kids' ? '' : undefined,
});

const formatGender = gender => {
  if (!gender) return null;
  return gender === 'male' ? 'Male' : 'Female';
};

const getRelationFromGender = gender => {
  if (!gender) return '';
  return gender === 'male' ? 'Son' : 'Daughter';
};

const unformatGender = gender => {
  if (!gender) return null;
  return gender.toLowerCase();
};

const unformatDependent = (dep, type) => ({
  fullName: dep.fullName || '',
  dateOfBirth: dep.dateOfBirth ? new Date(dep.dateOfBirth) : null,
  age: dep.age || '',
  gender: unformatGender(dep.gender),
  relation: dep.relation || (type === 'Kids' ? '' : undefined),
});

const CustomDependentOption = ({
  type,
  error,
  initialData,
  showErrorMessage = false,
  onDependentsChange,
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const label = type === 'Kids' ? 'Kids' : 'Spouse';

  const [dependents, setDependents] = useState(() => {
    if (initialData && initialData.length > 0) {
      return initialData.map(dep => unformatDependent(dep, type));
    }
    return [createEmptyDependent(type)];
  });

  // Refs to track previous values and prevent unnecessary updates
  const prevDependentsRef = useRef(
    JSON.stringify(
      initialData && initialData.length > 0
        ? initialData.map(dep => unformatDependent(dep, type))
        : [createEmptyDependent(type)],
    ),
  );
  const isInitialMount = useRef(true);

  // Debounce the effect to prevent rapid updates
  useEffect(() => {
    if (!onDependentsChange) return;

    // Skip the initial mount to prevent immediate callback
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentDependentsString = JSON.stringify(dependents);

    // Only proceed if dependents have actually changed
    if (prevDependentsRef.current === currentDependentsString) {
      return;
    }

    prevDependentsRef.current = currentDependentsString;

    const formattedDependents = dependents.map(dep => {
      const formatted = {
        fullName: dep.fullName.trim(),
        dateOfBirth: dep.dateOfBirth ? dep.dateOfBirth.toISOString() : null,
        age: dep.age || 0,
        gender: formatGender(dep.gender),
      };

      if (type === 'Kids') {
        formatted.relation = dep.relation || getRelationFromGender(dep.gender);
      }

      return formatted;
    });

    // Check if any dependent has actual data before calling onDependentsChange
    const hasValidData = formattedDependents.some(
      dep => dep.fullName || dep.dateOfBirth || dep.gender,
    );

    // Only call onDependentsChange if there's valid data or if it's the first dependent
    if (hasValidData || dependents.length > 1) {
      onDependentsChange(formattedDependents);
    }
  }, [dependents, onDependentsChange, type]);

  const addDependent = useCallback(() => {
    setDependents(prev => [...prev, createEmptyDependent(type)]);
  }, [type]);

  const removeDependentAtIndex = useCallback(
    indexToRemove => {
      if (dependents.length <= 1) return;

      setDependents(prev => {
        const newDependents = prev.filter(
          (_, index) => index !== indexToRemove,
        );

        setTimeout(() => {
          if (onDependentsChange && newDependents.length === 0) {
            onDependentsChange([]);
          }
        }, 0);

        return newDependents;
      });
    },
    [dependents.length, onDependentsChange],
  );

  const updateField = useCallback(
    (index, field, newValue) => {
      setDependents(prev => {
        if (prev[index][field] === newValue) {
          return prev;
        }

        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: newValue };

        if (field === 'gender' && type === 'Kids') {
          const newRelation = getRelationFromGender(newValue);
          if (updated[index].relation !== newRelation) {
            updated[index].relation = newRelation;
          }
        }

        return updated;
      });
    },
    [type],
  );

  const confirmDate = useCallback((date, index) => {
    setDependents(prev => {
      const prevDate = prev[index].dateOfBirth;
      const newAge = ageCalculator(date);

      if (
        prevDate &&
        prevDate.getTime() === date.getTime() &&
        prev[index].age === newAge
      ) {
        return prev;
      }

      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        dateOfBirth: date,
        age: newAge,
      };
      return updated;
    });
  }, []);

  const maxDate = useMemo(() => {
    if (type === 'Kids') return new Date();
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, [type]);

  const handleFullNameChange = useCallback(
    (text, index) => {
      const trimmedText = text;
      updateField(index, 'fullName', trimmedText);
    },
    [updateField],
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerContainer,
          label !== 'Kids' && { marginBottom: verticalScale(14) },
        ]}
      >
        <Text style={styles.label}>{label}</Text>

        {label === 'Kids' && (
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={addDependent} style={styles.iconButton}>
              <Icons name="plus" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View
        style={{
          gap: verticalScale(10),
          flex: 1,
        }}
      >
        {dependents.map((dependent, index) => (
          <View key={`${type}-${index}`} style={[styles.detailsContainer]}>
            <View style={styles.cardHeader}>
              <FloatingLabelInput
                label="Full Name"
                value={dependent.fullName}
                onChangeText={text => handleFullNameChange(text, index)}
                error={
                  showErrorMessage && !dependent.fullName && error
                    ? 'Full name is required'
                    : null
                }
                style={{ flex: 1 }}
              />
              {dependents.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeDependentAtIndex(index)}
                  activeOpacity={0.9}
                  style={{ padding: verticalScale(10) }}
                >
                  <Icons name="trash" size={18} color={theme.colors.red} />
                </TouchableOpacity>
              )}
            </View>

            <DobAgePicker
              value={
                dependent.dateOfBirth
                  ? dependent.dateOfBirth.toISOString()
                  : null
              }
              age={dependent.age || ''}
              onSelectDate={date => confirmDate(date, index)}
              error={
                showErrorMessage && !dependent.dateOfBirth && error
                  ? 'DOB is required'
                  : null
              }
              maxDate={maxDate}
            />

            <SegmentedToggle
              label="Gender"
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]}
              value={dependent.gender}
              onSelect={val => updateField(index, 'gender', val)}
            />
            {showErrorMessage && !dependent.gender && error && (
              <Text style={styles.errorText}>Gender is required</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default React.memo(CustomDependentOption);

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: verticalScale(5),
    },
    label: {
      fontSize: fontScale(16),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(15),
    },
    iconButton: {
      padding: verticalScale(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailsContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(10),
      padding: verticalScale(10),
      borderRadius: verticalScale(15),
    },
    detailsRow: {
      gap: verticalScale(15),
    },
    inputContainer: {
      flex: 1,
      gap: verticalScale(4),
    },
    errorText: {
      color: theme.colors.red,
      fontSize: verticalScale(12),
      marginTop: verticalScale(4),
      paddingLeft: verticalScale(4),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(5),
    },
    cardTitle: {
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      fontSize: verticalScale(14),
    },
  });
