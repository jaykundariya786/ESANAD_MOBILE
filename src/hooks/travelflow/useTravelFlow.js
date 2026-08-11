import { useQuery, useMutation } from '@tanstack/react-query';
import TravelService from '@api/services/TravelService';
import { showToast } from '@utils/toastService';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Linking } from 'react-native';
import { env } from '@config/index';

export function useGetDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      try {
        const res = await TravelService.getDestinations();
        // Assuming the destinations array is nested in res.data, return that if possible, or adjust based on actual API payload
        return res.data;
      } catch (error) {
        showToast(error?.message || 'Failed to fetch destinations', 'error');
        throw error;
      }
    },
  });
}

export function useCreateTravelProposal() {
  const navigation = useNavigation();
  return useMutation({
    mutationFn: async data => TravelService.createTravelProposal(data),
    onSuccess: async (res, variables) => {
      console.log('Travel proposal created successfully:', res);
      if (res.data?.success) {
        try {
          const proposalId = res.data?.data?.proposalNo || res.data?.proposalNo;
          const travelInfoId =
            res.data?.data?.travelInfo?._id || res.data?.data?._id;
          const reqId = variables.reqId;

          const quoteRes = await TravelService.getTravelQuoteList({
            proposalId,
            reqId,
            travelInfoId,
          });

          if (quoteRes.data?.success || quoteRes.data?.data) {
            const referenceId =
              quoteRes.data?.data?.internalRef || travelInfoId;
            navigation.navigate(SCREEN_NAMES.TRAVEL_QUOTE_SCREEN, {
              data: {
                referenceId,
                type: 'travel',
                proposalId,
                reqId,
                travelInfoId,
              },
            });
          } else {
            showToast(
              quoteRes.data?.message || 'Failed to fetch quotes',
              'error',
            );
          }
        } catch (error) {
          showToast('Error during quote fetching', 'error');
        }
      } else {
        showToast(res.data?.message || 'Submission failed', 'error');
      }
    },
    onError: error => {
      showToast(error?.message || 'Failed to create travel proposal', 'error');
    },
    meta: { showLoader: true, showError: false },
  });
}

export function useGetTravelQuoteList() {
  return useMutation({
    mutationFn: async params => TravelService.getTravelQuoteList(params),
    onError: error => {
      showToast(error?.message || 'Failed to fetch quote list', 'error');
    },
    meta: { showLoader: true, showError: false },
  });
}

export function useGetFilteredTravelQuotes() {
  return useMutation({
    mutationFn: async ({ internalRef, data }) =>
      TravelService.getFilteredTravelQuotes({ internalRef, data }),
    onError: error => {
      showToast(error?.message || 'Failed to filter quotes', 'error');
    },
  });
}

export function useGetFilterTravelQuotes() {
  return useMutation({
    mutationFn: async ({ refId, data }) =>
      TravelService.getFilterTravelQuotes({ refId, data }),
    onError: error => {
      showToast(error?.message || 'Failed to fetch quotes', 'error');
    },
  });
}

export function useGetTravelInsuranceFilters() {
  return useQuery({
    queryKey: ['travelInsuranceFilters'],
    queryFn: async () => {
      try {
        const res = await TravelService.getTravelInsuranceFilters();
        return res.data?.data || res.data;
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useGetTravelInsuranceCompanyList(refId) {
  return useQuery({
    queryKey: ['travelInsuranceCompanies'],
    queryFn: async () => {
      try {
        const res = await TravelService.getTravelInsuranceCompanyList({
          refId,
        });
        return res?.data?.data;
      } catch (error) {
        showToast(error?.response?.data?.message, 'error');
      }
    },
    meta: { showLoader: true, showError: false, showLottieLoader: false },
  });
}

export function useGetTravelComparePlans() {
  return useMutation({
    mutationFn: async ({ refId, companyIds }) =>
      TravelService.getTravelComparePlans({ refId, companyIds }),
    onError: error => {
      showToast(
        error?.message || 'Failed to fetch comparison details',
        'error',
      );
    },
  });
}

export function useDownloadTravelQuote() {
  return useMutation({
    mutationFn: async ({ travelId }) =>
      TravelService.downloadTravelQuote({ travelId }),
    onSuccess: res => {
      const { data, message, success } = res.data;

      if (data?.link) {
        const url = env.API_BASE_URL + data?.link;
        Linking.openURL(url).catch(err => {
          showToast('Failed to open quote', 'error');
        });
      }
    },
    onError: error => {
      showToast(error?.message || 'Failed to download quote', 'error');
    },
    meta: { showLoader: true, showError: false, showToast: false },
  });
}

export function useSendEmailQuote() {
  return useMutation({
    mutationFn: async ({ reqId, proposalId, toEmail }) =>
      TravelService.sendEmail({ reqId, proposalId, toEmail }),
    onSuccess: () => {
      showToast('Quote sent successfully to email', 'success');
    },
    onError: error => {
      showToast(error?.message || 'Failed to send email', 'error');
    },
  });
}

export function useSendSMSQuote() {
  return useMutation({
    mutationFn: async ({ reqId, proposalId, toMobileNumber }) =>
      TravelService.sendSMS({ reqId, proposalId, toMobileNumber }),
    onSuccess: () => {
      showToast('Quote sent successfully to mobile', 'success');
    },
    onError: error => {
      showToast(error?.message || 'Failed to send SMS', 'error');
    },
  });
}

export function useGetTravelQuoteDetails(travelId) {
  return useQuery({
    queryKey: ['travelQuoteDetails', travelId],
    queryFn: async () => {
      try {
        const res = await TravelService.getTravelQuoteDetails({ travelId });
        return res.data;
      } catch (error) {
        showToast(error?.message || 'Failed to fetch quote details', 'error');
        throw error;
      }
    },
    enabled: !!travelId,
  });
}

export function useGetTravelNationalities() {
  return useQuery({
    queryKey: ['travelNationalities'],
    queryFn: async () => {
      try {
        const res = await TravelService.getNationalities();
        return res.data;
      } catch (error) {
        showToast(error?.message || 'Failed to fetch nationalities', 'error');
        throw error;
      }
    },
  });
}

export function useGetTravelUserDetails(id) {
  return useQuery({
    queryKey: ['travelUserDetails', id],
    queryFn: async () => {
      try {
        const res = await TravelService.getTravelUserDetails({ id });
        return res.data?.data || res.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useInitiateTravelPayment() {
  return useMutation({
    mutationFn: async ({ quoteId }) =>
      TravelService.initiateTravelPayment({ quoteId }),
    onError: error => {
      showToast(error?.message || 'Failed to initiate payment', 'error');
    },
  });
}

export function useGeneratePaymentLink() {
  return useMutation({
    mutationFn: async ({ quoteId, redirectUri }) =>
      TravelService.generatePaymentLink({ quoteId, redirectUri }),
    onError: error => {
      showToast(error?.message || 'Failed to generate payment link', 'error');
    },
  });
}

export function useApplyVoucher() {
  return useMutation({
    mutationFn: async ({ quoteId, voucherCode }) =>
      TravelService.applyVoucher({ quoteId, voucherCode }),
    onSuccess: res => {
      showToast(res.data?.message || 'Voucher applied successfully', 'success');
    },
    onError: error => {
      showToast(error?.message || 'Failed to apply voucher', 'error');
    },
  });
}

export function useRemoveVoucher() {
  return useMutation({
    mutationFn: async ({ quoteId }) => TravelService.removeVoucher({ quoteId }),
    onSuccess: res => {
      showToast(res.data?.message || 'Voucher removed successfully', 'success');
    },
    onError: error => {
      showToast(error?.message || 'Failed to remove voucher', 'error');
    },
  });
}

export function usePayByTamara() {
  return useMutation({
    mutationFn: async ({ id, redirectUri, paidBy }) =>
      TravelService.payByTamara({ id, redirectUri, paidBy }),
    onError: error => {
      showToast(error?.message || 'Failed to initiate Tamara payment', 'error');
    },
  });
}

export function useCheckoutPayment() {
  return useMutation({
    mutationFn: async ({ id, redirectUri }) =>
      TravelService.checkoutTravelPayment({ id, redirectUri }),
    onError: error => {
      showToast(error?.message || 'Failed to checkout payment', 'error');
    },
  });
}

export function useUpdateTravelers() {
  return useMutation({
    mutationFn: async ({ id, data }) =>
      TravelService.updateTravelers({ id, data }),
    onSuccess: () => {
      showToast('Travellers updated successfully', 'success');
    },
    onError: error => {
      showToast(error?.message || 'Failed to update travellers', 'error');
    },
  });
}

export function useGetTapPaymentDetails(quoteId) {
  return useQuery({
    queryKey: ['tapPaymentDetails', quoteId],
    queryFn: async () => {
      try {
        const res = await TravelService.getTapPaymentDetails({ quoteId });
        return res.data;
      } catch (error) {
        showToast(
          error?.message || 'Failed to fetch tap payment details',
          'error',
        );
        throw error;
      }
    },
    enabled: !!quoteId,
  });
}

export function useProcessTapPayment() {
  return useMutation({
    mutationFn: async ({ quoteId, data }) =>
      TravelService.processTapPayment({ quoteId, data }),
    onError: error => {
      showToast(error?.message || 'Tap payment processing failed', 'error');
    },
  });
}
