import React, { useMemo } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Form from './Cards/Form';
import { paymentMethodShape } from '../utility';
import config from './config';
import useStripeCartContext from '../hooks/useStripeCartContext';

const stripePromise = loadStripe(config.apiKey, { locale: config.locale });

function Cards({ method, selected }) {
  const isSelected = method.code === selected.code;
  const { cartAmount } = useStripeCartContext();

  // Use element options from Stripe module configuration
  // This contains the correct mode (payment/subscription/setup) based on cart contents
  const options = useMemo(() => {
    const baseOptions = config.elementOptions || {};
    const mode = baseOptions.mode || 'payment';

    // Build options based on the mode from Stripe module
    const elementsOptions = {
      mode,
      currency: baseOptions.currency || 'eur',
      paymentMethodCreation: 'manual',
      locale: config.locale,
      appearance: baseOptions.appearance || {
        theme: 'stripe',
        variables: {
          colorText: '#32325d',
          fontFamily:
            '"Open Sans","Helvetica Neue", Helvetica, Arial, sans-serif',
        },
      },
    };

    // Only add amount for payment mode, not for subscription or setup modes
    // For subscription mode, Stripe Elements handles the amount differently
    if (mode === 'payment') {
      elementsOptions.amount = Math.floor(cartAmount * 100);
    } else if (mode === 'subscription') {
      // For subscription mode, use the amount from Stripe config if available
      // or calculate from cart. Stripe requires amount for subscription mode too.
      elementsOptions.amount =
        baseOptions.amount || Math.floor(cartAmount * 100);
    }
    // For setup mode, no amount is needed

    // If setupFutureUsage is specified (for saving payment methods), include it
    if (baseOptions.setupFutureUsage) {
      elementsOptions.setupFutureUsage = baseOptions.setupFutureUsage;
    }

    // Copy over paymentMethodTypes if specified
    if (baseOptions.paymentMethodTypes) {
      elementsOptions.paymentMethodTypes = baseOptions.paymentMethodTypes;
    }

    // Copy over paymentMethodConfiguration if specified
    if (baseOptions.paymentMethodConfiguration) {
      elementsOptions.paymentMethodConfiguration =
        baseOptions.paymentMethodConfiguration;
    }

    return elementsOptions;
  }, [cartAmount]);

  return (
    <div
      style={{
        display: isSelected ? 'block' : 'none',
      }}
    >
      <Elements stripe={stripePromise} options={options}>
        <Form />
      </Elements>
    </div>
  );
}

Cards.propTypes = {
  method: paymentMethodShape.isRequired,
  selected: paymentMethodShape.isRequired,
};

export default Cards;
