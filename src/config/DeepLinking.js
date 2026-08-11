import { SCREEN_NAMES } from '@constants/screenNames';

const linking = {
  prefixes: [
    'esanad://',
    'https://dev.esanad.com',
    'https://esanad.com',
    'https://*.esanad.com',
  ],
  config: {
    screens: {
      [SCREEN_NAMES.BOTTOM_TABS]: {
        path: 'app',
        screens: {
          [SCREEN_NAMES.HOME_SCREEN]: 'home',
          [SCREEN_NAMES.MY_POLICIES]: 'my-policies',
          [SCREEN_NAMES.PROFILE_SCREEN]: 'profile',
          [SCREEN_NAMES.ESANASD_CLUB]: 'club',
        },
      },
      [SCREEN_NAMES.LOGIN_SCREEN]: 'login',
      [SCREEN_NAMES.TRAVEL_BUY_POLICY]: 'travel/buy/:travelId/:referenceId',
      [SCREEN_NAMES.TRAVEL_QUOTE_SCREEN]: 'travel/quotes/:travelId',
      [SCREEN_NAMES.CAR_INSURANCE_SCREEN]: 'motor/insurance',
      [SCREEN_NAMES.MOTOR_FLOW_SCREEN]: 'motor/flow',
      [SCREEN_NAMES.HEALTH_FLOW_SCREEN]: 'health/flow',
      [SCREEN_NAMES.THANKYOU_SCREEN]: 'thank-you',
      [SCREEN_NAMES.NOTIFICATION_SCREEN]: 'notifications',
      [SCREEN_NAMES.VOUCHER_SCREEN]: 'vouchers',
      [SCREEN_NAMES.VOUCHER_DETAILS]: 'vouchers/:voucherId',
      [SCREEN_NAMES.QUOTATION_SCREEN]: 'quotations',
      [SCREEN_NAMES.LOYALTY_POINTS]: 'loyalty',
      [SCREEN_NAMES.REFER]: 'refer',
      [SCREEN_NAMES.TRAVEL_INSURANCE_DETAIL]: 'policies/travel/:policyId',
      [SCREEN_NAMES.MOTOR_INSURANCE_DETAIL]: 'policies/motor/:policyId',
      [SCREEN_NAMES.HEALTH_INSURANCE_DETAIL]: 'policies/health/:policyId',
    },
  },
};

export default linking;
