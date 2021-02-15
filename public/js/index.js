//INDEX.JS IS MORE FOR GETTTING DATA FROM USER INTERFACE OR FROM WEBSITE AND DELEGATING THE DATA TO USE BY OTHER MODULES LIKE MAPBOX
import '@babel/polyfill'; //help so that old browser can work with new js features
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// import { updateSettings } from './updateSettings';
// const locations = JSON.parse(document.getElementById('map').dataset.location); was creating some errros when we were
//runnning mapbox on pages other than tour detail jaha per mapbox ka kaam hai
//TO OVERCOME THOSE ERRORS FOLLWING ARE THE STEPS

// 1 DOM ELMENET
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserDataAndEmail = document.querySelector('.form-user-data');
const updatePasswordAndConfirmPass = document.querySelector('.form-user-password');

//3 DELEGATION
if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.location);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    logout();
  });
}

if (updateUserDataAndEmail) {
  updateUserDataAndEmail.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    updateSettings({email, name}, 'data');
  });
}
if (updatePasswordAndConfirmPass) {
  updatePasswordAndConfirmPass.addEventListener('submit',async (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
   await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');
   document.getElementById('password-current').value = ""
   document.getElementById('password').value = ""
   document.getElementById('password-confirm').value = ""
   
  });
}

//theres some issue with mapbox npm therefore we are stuck with mapbox cdn warna jese axios npm install kara haai
//wese maobox npm bhi kartay
