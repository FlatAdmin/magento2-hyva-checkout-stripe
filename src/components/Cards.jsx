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

  const options = useMemo(
    () => ({
      mode: 'payment',
      amount: Math.floor(cartAmount * 100),
      currency: 'eur',
      paymentMethodCreation: 'manual',
    }),
    [cartAmount]
  );

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
