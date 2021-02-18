// import axios from "axios";
import axios from 'axios';
import {
  showAlert
} from './alerts'
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      // url: 'http://localhost:8000/api/v1/users/login',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });
    if ((result.data.status = 'success')) {
      showAlert('success', 'Logged in succesfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      // url: 'http://localhost:8000/api/v1/users/logout', //FOR DEV PURPOSE BELOW ONE IS THE SAME
      url: '/api/v1/users/logout', //FOR PROD PURPOSE
      withCredentials: true,
    });
    if ((result.data.status = 'success')) location.reload(true)
  } catch (error) {
    console.log(error)
    showAlert('error', 'Error logging out');
  }
};