import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
  useYearList,
  useGetBrandList,
  useGetModelList,
  useGetTrimList,
  useGetCarDetails,
  useSaveCarAndGetValuation,
} from '@hooks/motorflow/useMotorFlow';

import { useGetTopBrandList } from '@hooks/motorflow/useMotorFlowTop';
import { useMotorStore } from '@store/MOTOR/motorStore';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';

import InlineSelect from '@components/ui/InlineSelect';
import SegmentedToggle from '@components/ui/SegmentedToggle';
import FloatingButton from '@components/ui/FloatingButton';
import { ScrollView } from 'react-native';

const CarDetails = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const {
    year: storeYear,
    brand: storeBrand,
    model: storeModel,
    trim: storeTrim,
    regionalSpace,
    registeredYear,
    isRenewing,
    isNewCar,
    updateYear,
    updateBrand,
    updateModel,
    updateTrim,
    updateRegionalSpace,
    updateRegisteredYear,
    updateIsRenewing,
    updateIsNewCar,
    updateStep,
    updateSubStep,
  } = useMotorStore();

  const [year, setYear] = useState(storeYear);
  const [brand, setBrand] = useState(storeBrand);
  const [model, setModel] = useState(storeModel);
  const [trim, setTrim] = useState(storeTrim);
  const [brandListData, setBrandListData] = useState([]);
  const [topBrandListData, setTopBrandListData] = useState([]);
  const [modelListData, setModelListData] = useState([]);
  const [trimListData, setTrimListData] = useState([]);
  const [carDetailsData, setCarDetailsData] = useState(null);

  const { data: yearList = [] } = useYearList();
  const { mutate: brandList } = useGetBrandList();
  const { mutate: topBrandList } = useGetTopBrandList();
  const { mutate: modelList } = useGetModelList();
  const { mutate: trimList } = useGetTrimList();
  const { mutate: carDetails } = useGetCarDetails();
  const { mutate: saveCarAndGetValuation } = useSaveCarAndGetValuation();

  // Hydrate lists if store values exist (e.g. navigating back from step 2)
  React.useEffect(() => {
    if (storeYear) {
      brandList(
        { year: storeYear },
        { onSuccess: data => setBrandListData(data?.data?.data) },
      );
      topBrandList(
        { year: storeYear },
        { onSuccess: data => setTopBrandListData(data?.data?.data) },
      );
    }
    if (storeYear && storeBrand) {
      modelList(
        { year: storeYear, make: storeBrand },
        { onSuccess: data => setModelListData(data?.data?.data) },
      );
    }
    if (storeYear && storeBrand && storeModel) {
      trimList(
        { year: storeYear, make: storeBrand, model: storeModel },
        { onSuccess: data => setTrimListData(data?.data?.data) },
      );
    }
    if (storeYear && storeBrand && storeModel && storeTrim) {
      carDetails(
        {
          year: storeYear,
          make: storeBrand,
          model: storeModel,
          trim: storeTrim,
        },
        { onSuccess: data => setCarDetailsData(data?.data?.data) },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yearItems = useMemo(
    () => (yearList || []).map(y => ({ label: y, value: y })),
    [yearList],
  );
  const brandItems = useMemo(
    () => (brandListData || []).map(b => ({ label: b, value: b })),
    [brandListData],
  );
  const modelItems = useMemo(
    () => modelListData.map(m => ({ label: m, value: m })),
    [modelListData],
  );
  const trimItems = useMemo(
    () => trimListData.map(t => ({ label: t, value: t })),
    [trimListData],
  );

  const handleYearSelect = val => {
    updateYear(val);
    setYear(val);
    // Clear subsequent selections
    updateBrand(null);
    setBrand(null);
    updateModel(null);
    setModel(null);
    updateTrim(null);
    setTrim(null);
    setModelListData([]);
    setTrimListData([]);
    setCarDetailsData(null);

    brandList(
      { year: val },
      { onSuccess: data => setBrandListData(data?.data?.data) },
    );
    topBrandList(
      { year: val },
      { onSuccess: data => setTopBrandListData(data?.data?.data) },
    );
  };

  const handleBrandSelect = val => {
    updateBrand(val);
    setBrand(val);
    // Clear subsequent selections
    updateModel(null);
    setModel(null);
    updateTrim(null);
    setTrim(null);
    setTrimListData([]);
    setCarDetailsData(null);

    modelList(
      { year, make: val },
      { onSuccess: data => setModelListData(data?.data?.data) },
    );
  };

  const handleModelSelect = val => {
    updateModel(val);
    setModel(val);
    // Clear subsequent selections
    updateTrim(null);
    setTrim(null);
    setCarDetailsData(null);

    trimList(
      { year, make: brand, model: val },
      { onSuccess: data => setTrimListData(data?.data?.data) },
    );
  };

  const handleTrimSelect = val => {
    updateTrim(val);
    setTrim(val);
    carDetails(
      { year, make: brand, model, trim: val },
      { onSuccess: data => setCarDetailsData(data?.data?.data) },
    );
  };

  const handleSubmit = () => {
    saveCarAndGetValuation({
      bodyType: carDetailsData?.bodyType,
      cylinders: carDetailsData?.cylinders,
      engineSize: carDetailsData?.engineSize,
      make: brand,
      model,
      trim,
      year,
      noOfDoors: carDetailsData?.noOfDoors,
      noOfPassengers: carDetailsData?.noOfPassengers,
      regionalSpec: regionalSpace,
      transmission: carDetailsData?.transmission,
    });
    updateStep(1);
    updateSubStep(1);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Car Details</Text>
          <Text style={styles.subheading}>
            Select your vehicle information to get the best quote
          </Text>
        </View>

        <View style={styles.fieldList}>
          <InlineSelect
            label="Year"
            value={year}
            items={yearItems}
            onSelect={handleYearSelect}
          />

          {brandListData.length > 0 && (
            <InlineSelect
              label="Brand"
              value={brand}
              items={brandItems}
              onSelect={handleBrandSelect}
            />
          )}

          {modelListData.length > 0 && (
            <InlineSelect
              label="Model"
              value={model}
              items={modelItems}
              onSelect={handleModelSelect}
            />
          )}

          {trimListData.length > 0 && (
            <InlineSelect
              label="Trim"
              value={trim}
              items={trimItems}
              onSelect={handleTrimSelect}
            />
          )}

          {carDetailsData != null && (
            <View style={{ gap: verticalScale(10) }}>
              <SegmentedToggle
                label="Vehicle spec"
                options={[
                  { label: 'GCC', value: 'GCC' },
                  { label: 'Non-GCC', value: 'Non-GCC' },
                ]}
                value={regionalSpace}
                onSelect={val => updateRegionalSpace(val)}
              />

              <SegmentedToggle
                label="Renewing?"
                options={[
                  { label: 'Yes', value: true },
                  { label: 'No', value: false },
                ]}
                value={isRenewing}
                onSelect={val => {
                  updateIsRenewing(val);
                  if (val) {
                    updateIsNewCar(true);
                    updateRegisteredYear(null);
                  }
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* {carDetailsData != null && ( */}
      <FloatingButton
        disabled={
          !year ||
          !brand ||
          !model ||
          !trim ||
          !regionalSpace ||
          (isRenewing === false && isNewCar === false && !registeredYear)
        }
        onPress={handleSubmit}
        isShowIcon
      />
      {/* )} */}
    </View>
  );
};

export default CarDetails;

const getStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      gap: verticalScale(15),
      padding: verticalScale(20),
      paddingBottom: verticalScale(90), // Space for circular floating button
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
      color: theme.colors.description,
    },
    fieldList: {
      gap: verticalScale(10),
    },
  });
