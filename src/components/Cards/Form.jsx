import React, { useCallback, useEffect } from 'react';

import { PaymentElement } from '@stripe/react-stripe-js';

import useStripeCheckoutFormContext from '../../hooks/useStripeCheckoutFormContext';
import useStripePayments from '../../hooks/useStripePayments';
import ErrorModal from './ErrorModal';

function Form() {
  const { registerPaymentAction } = useStripeCheckoutFormContext();
  const { placeOrder, onboardingError, handleErrorConfirm } =
    useStripePayments();

  const paymentSubmitHandler = useCallback(
    async () => placeOrder(),
    [placeOrder]
  );

  useEffect(() => {
    registerPaymentAction('stripe_payments', paymentSubmitHandler);
  }, [registerPaymentAction, paymentSubmitHandler]);

  return (
    <>
      <PaymentElement />
      <ErrorModal
        isOpen={!!onboardingError}
        errorMessage={onboardingError}
        onConfirm={handleErrorConfirm}
      />
    </>
  );
}

export default Form;
