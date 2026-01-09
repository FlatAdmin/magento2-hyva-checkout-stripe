import RootElement from '@hyva/react-checkout/utils/rootElement';
import _get from 'lodash.get';

const paymentConfig = RootElement.getPaymentConfig();

export default {
  apiKey: _get(paymentConfig, 'stripe_payments.initParams.apiKey'),
  locale: _get(paymentConfig, 'stripe_payments.initParams.locale'),
  // Element options from Stripe module - contains dynamic mode (payment/subscription/setup)
  elementOptions: _get(paymentConfig, 'stripe_payments.elementOptions', {}),
  // Subscription-related configuration
  hasFutureSubscriptions: _get(
    paymentConfig,
    'stripe_payments.hasFutureSubscriptions',
    false
  ),
  futureSubscriptions: _get(
    paymentConfig,
    'stripe_payments.futureSubscriptions',
    null
  ),
};
