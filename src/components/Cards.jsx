import React, { useMemo } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Form from './Cards/Form';
import { paymentMethodShape } from '../utility';
import config from './config';

const stripePromise = loadStripe(config.apiKey, { locale: config.locale });

function Cards({ method, selected }) {
  const isSelected = method.code === selected.code;

  const options = useMemo(
    () => ({
      mode: 'payment',
      amount: 1000,
      currency: 'eur',
      paymentMethodCreation: 'manual',
    }),
    []
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
