import { useCallback, useEffect, useRef, useState } from 'react';
import { __ } from '@hyva/react-checkout/i18n';
import _get from 'lodash.get';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import useStripeCartContext from './useStripeCartContext';
import useStripeAppContext from './useStripeAppContext';
import { setPaymentMethodRequest, placeOrderRequest } from '../api';

export default function useStripePayments() {
  const { customerEmail, customerFullName, setOrderInfo } =
    useStripeCartContext();

  const { setMessage, setErrorMessage, appDispatch } = useStripeAppContext();

  const stripe = useStripe();
  const elements = useElements();

  // State for onboarding error modal
  const [onboardingError, setOnboardingError] = useState(null);

  // Use refs to capture current values without making them dependencies
  // This prevents the placeOrder callback from being recreated when stripe/elements change
  const stripeRef = useRef(stripe);
  const elementsRef = useRef(elements);

  useEffect(() => {
    stripeRef.current = stripe;
    elementsRef.current = elements;
  }, [elements, stripe]);

  const placeOrder = useCallback(async () => {
    try {
      const currentStripe = stripeRef.current;
      const currentElements = elementsRef.current;

      if (!currentStripe || !currentElements) {
        setErrorMessage(__('Payment method not ready. Please try again.'));
        return false;
      }

      const { error: submitError } = await currentElements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        return false;
      }

      const paymentMethodResult = await currentStripe.createPaymentMethod({
        elements: currentElements,
        params: {
          billing_details: {
            name: customerFullName,
            email: customerEmail,
          },
        },
      });

      if (paymentMethodResult.error) {
        setErrorMessage(paymentMethodResult.error.message);
        return false;
      }

      const pmId = _get(paymentMethodResult, 'paymentMethod.id', false);

      if (pmId === false) {
        setErrorMessage(
          __('Failed to create payment method. Please try again.')
        );
        return false;
      }

      await setPaymentMethodRequest(appDispatch, pmId);
      const order = await placeOrderRequest(appDispatch);

      if (!order) {
        setErrorMessage(__('Failed to create order. Please try again.'));
        return false;
      }

      // If there's a client_secret, handle payment intent confirmation
      if (order.client_secret) {
        const { paymentIntent } = await currentStripe.retrievePaymentIntent(
          order.client_secret
        );
        if (paymentIntent.next_action) {
          const nextActionResult = await currentStripe.handleNextAction({
            clientSecret: order.client_secret,
          });
          if (nextActionResult.error) {
            console.error(nextActionResult.error);
            setErrorMessage(
              __(
                'This transaction could not be finalized. Please select another payment method.'
              )
            );
            return false;
          }
        }
      }

      setOrderInfo(order);
      return order;
    } catch (e) {
      console.error(e);
      const errorMessage = e?.message || '';

      // Check if this is a backend/onboarding error - show in modal
      const isBackendError =
        errorMessage &&
        (errorMessage.includes('Unable to complete your order') ||
          errorMessage.includes('Det gick inte att slutföra din beställning') ||
          errorMessage.includes('contact support') ||
          errorMessage.includes('kontakta support'));

      if (isBackendError) {
        // Clear any existing error message from the banner first
        setMessage(false);
        // Show the error in a styled modal instead of the standard error message
        setOnboardingError(errorMessage);
      } else {
        setErrorMessage(
          __(
            'This transaction could not be performed. Please select another payment method.'
          )
        );
      }
    }

    return false;
  }, [
    customerFullName,
    customerEmail,
    appDispatch,
    setMessage,
    setErrorMessage,
    setOrderInfo,
  ]);

  // Handler for the error modal
  const handleErrorConfirm = useCallback(() => {
    setOnboardingError(null);
    window.location.href = '/signup';
  }, []);

  return {
    placeOrder,
    onboardingError,
    handleErrorConfirm,
  };
}
