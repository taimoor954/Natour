// import axios from "axios";
// import { axios } from 'axios';

const login = async (email, password) => {


  try {

    const result = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
      
    });
    if (result.data.status = 'success')
    {
      alert('Logged in succesfully')
      window.setTimeout(()=> {
        location.assign('/')
      }, 1000)
    }
  } catch (error) {
    alert(error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});