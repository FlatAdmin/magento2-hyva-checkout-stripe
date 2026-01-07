import { useContext } from 'react';

import AppContext from '@hyva/react-checkout/context/App/AppContext';

export default function useStripeAppContext() {
  const [
    { isLoggedIn, checkoutAgreements },
    { setPageLoader, setMessage, setErrorMessage, dispatch: appDispatch },
  ] = useContext(AppContext);

  return {
    setPageLoader,
    setMessage,
    setErrorMessage,
    appDispatch,
    checkoutAgreements,
    isLoggedIn,
  };
}
