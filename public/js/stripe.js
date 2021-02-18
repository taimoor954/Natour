import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51ILribAZGLpkmEmRMjc6i82cyU9Y9rHT5r5JAy3XOmSUxP8lOK0KsVbnq1fISOXmQnXurCX8xS9S3nEFisABPYvl00RNy5Am3e'
);
export const bookTour = async (tourId) => {
  try {
    //GET THE SESSION FROM THE SERVER
    // const session = await axios({
    //     method : "GET",
    //     url : "http://localhost:8000/api/v1/booking/checkout-session/${tourId}"
    // })
    const session = await axios.get(
      `/api/v1/booking/checkout-session/${tourId}`
    );
    // console.log(session)

    // USE STRIPE OBJECT TO CREATE CHECKOUT  FORM + CHARGE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    // console.log(error);
    showAlert('error', error);
  }
};
