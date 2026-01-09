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

  /**
   * Handle Stripe client_secret confirmation for both PaymentIntent and SetupIntent.
   * For subscriptions, the backend may return a SetupIntent (seti_) or PaymentIntent (pi_)
   * client secret depending on whether payment is collected immediately or later.
   */
  const handleStripeConfirmation = useCallback(
    async (currentStripe, clientSecret) => {
      if (!clientSecret) {
        return { success: true };
      }

      // Determine if this is a SetupIntent or PaymentIntent based on the client_secret prefix
      const isSetupIntent = clientSecret.startsWith('seti_');

      if (isSetupIntent) {
        // Handle SetupIntent confirmation (used for trial subscriptions or future payments)
        const { setupIntent, error } = await currentStripe.retrieveSetupIntent(
          clientSecret
        );

        if (error) {
          return { success: false, error: error.message };
        }

        if (
          setupIntent.status === 'requires_action' ||
          setupIntent.next_action
        ) {
          const result = await currentStripe.confirmSetup({
            clientSecret,
            redirect: 'if_required',
          });

          if (result.error) {
            return { success: false, error: result.error.message };
          }
        }

        return { success: true };
      }
      // Handle PaymentIntent confirmation (used for immediate payments including subscriptions)
      const { paymentIntent, error } =
        await currentStripe.retrievePaymentIntent(clientSecret);

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent.next_action) {
        const result = await currentStripe.handleNextAction({
          clientSecret,
        });

        if (result.error) {
          return { success: false, error: result.error.message };
        }
      }

      return { success: true };
    },
    []
  );

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

      // If there's a client_secret, handle payment/setup intent confirmation
      // This handles both one-time payments and subscription payments
      if (order.client_secret) {
        const confirmResult = await handleStripeConfirmation(
          currentStripe,
          order.client_secret
        );

        if (!confirmResult.success) {
          setErrorMessage(
            confirmResult.error ||
              __(
                'This transaction could not be finalized. Please select another payment method.'
              )
          );
          return false;
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
    handleStripeConfirmation,
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
