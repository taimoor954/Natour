import axios from 'axios';
import { showAlert } from './alerts';

//data contains name email pass confirm pass,
//type contain whether updating password or name/email
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:8000/api/v1/users/updatepassword'
        : 'http://localhost:8000/api/v1/users/updateme';
    const result = await axios({
      method: 'PATCH',
      url,
      data,
      // withCredentials: true,
    });
    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated succesfully!!!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
