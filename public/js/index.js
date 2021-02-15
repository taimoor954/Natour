//INDEX.JS IS MORE FOR GETTTING DATA FROM USER INTERFACE OR FROM WEBSITE AND DELEGATING THE DATA TO USE BY OTHER MODULES LIKE MAPBOX
import '@babel/polyfill'; //help so that old browser can work with new js features
import {
    displayMap
} from './mapbox';
import {
    login, logout
} from './login';

// const locations = JSON.parse(document.getElementById('map').dataset.location); was creating some errros when we were
//runnning mapbox on pages other than tour detail jaha per mapbox ka kaam hai
//TO OVERCOME THOSE ERRORS FOLLWING ARE THE STEPS

// 1 DOM ELMENET
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
console.log(logoutBtn)
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
    })
}

if(logoutBtn)
{
    logoutBtn.addEventListener('click', (e)=> {
        logout()
    })
}



// document.querySelector('.form').addEventListener('submit', (e) => {
//   e.preventDefault();
// //   const email = document.getElementById('email').value;
// //   const password = document.getElementById('password').value;
//   login(email, password);
// });

//theres some issue with mapbox npm therefore we are stuck with mapbox cdn warna jese axios npm install kara haai
//wese maobox npm bhi kartay