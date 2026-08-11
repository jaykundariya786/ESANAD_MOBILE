import axiosInstance from '@api/axiosInstance';

const TravelService = {
  getDestinations: () => axiosInstance.get('api/travelinfo/getdestinations'),

  createTravelProposal: data =>
    axiosInstance.post('api/traveller/createtravelproposal', data),

  getTravelQuoteList: ({ travelInfoId, reqId, proposalId }) =>
    axiosInstance.post(
      `api/travelquotelist/${travelInfoId}/gettravelquotelist?reqId=${reqId}&proposalId=${proposalId}`,
      {}
    ),

  getTravelQuoteDetails: ({ travelId }) =>
    axiosInstance.get(`api/travelquote/${travelId}/gettravelquote`),

  getNationalities: () => axiosInstance.get('api/cars/getnationalities'),

  // Correct endpoint: matches web's travelFilterService.js → /api/travelquote/${internalRef}/filtertravelquotes
  getFilteredTravelQuotes: ({ internalRef, data }) =>
    axiosInstance.post(`api/travelquote/${internalRef}/filtertravelquotes`, data),

  getFilterTravelQuotes: ({ refId, data }) =>
    axiosInstance.post(`api/travelquote/${refId}/filterquotes`, data),

  // Correct endpoint: matches web's travelFilterService.js → /api/travelquote/getPlansAndCoverage
  getTravelInsuranceFilters: () =>
    axiosInstance.get('api/travelquote/getPlansAndCoverage'),

  // Correct endpoint: matches web's travelFilterService.js → /api/travelquote/${refId}/getinsurerlist
  getTravelInsuranceCompanyList: ({ refId }) =>
    axiosInstance.get(`api/travelquote/${refId}/getinsurerlist`),

  getTravelComparePlans: ({ refId, companyIds }) =>
    axiosInstance.post(`api/travelquote/${refId}/comparetravelquotes`, {
      companyIds,
    }),

  downloadTravelQuote: ({ travelId }) =>
    axiosInstance.get(`api/traveller/${travelId}/downloadtravelquote`),

  sendEmail: ({ reqId, proposalId, toEmail }) =>
    axiosInstance.post(`api/travelquote/${reqId}/${proposalId}/emailquotes`, {
      toEmail,
    }),

  sendSMS: ({ reqId, proposalId, toMobileNumber }) =>
    axiosInstance.post(`api/travelquote/${reqId}/${proposalId}/smsquotes`, {
      toMobileNumber,
    }),

  getTravelUserDetails: ({ id }) =>
    axiosInstance.get(`api/traveller/reviewtravellers/${id}`),

  initiateTravelPayment: ({ quoteId }) =>
    axiosInstance.post(`api/travelquote/${quoteId}/initiatepayment`, {}),

  generatePaymentLink: ({ quoteId, redirectUri }) =>
    axiosInstance.post(`api/travelquote/${quoteId}/generate-payment-link`, {
      redirectUri,
    }),

  checkoutTravelPayment: ({ id, redirectUri }) =>
    axiosInstance.post(`api/generatepaymentlink/${id}/generate-payment-link`, {
      redirectUri,
    }),

  payByTamara: ({ id, redirectUri, paidBy }) =>
    axiosInstance.post(`api/travelquote/${id}/tamarapayment`, {
      redirectUri,
      paidBy,
    }),

  applyVoucher: ({ quoteId, voucherCode }) =>
    axiosInstance.post(`api/travelquote/${quoteId}/updatevouchers`, {
      voucherCode,
    }),

  removeVoucher: ({ quoteId }) =>
    axiosInstance.put(`api/travelquote/${quoteId}/deleteVouchers`, {}),

  updateTravelers: ({ id, data }) =>
    axiosInstance.put(`api/travelinfo/${id}/updatetravelinsurance`, data),

  getTapPaymentDetails: ({ quoteId }) =>
    axiosInstance.get(`api/quotes/travel/payment/tap/${quoteId}/quote-details`),

  processTapPayment: ({ quoteId, data }) =>
    axiosInstance.post(`api/quotes/travel/payment/tap/${quoteId}`, data),
};

export default TravelService;
