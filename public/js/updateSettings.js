import axios from 'axios'
import {
    showAlert
} from './alerts'

//type is either password or username/email
export const updateNameAndEmail = async (data, type) => {
    try {
        const result = await axios({
            method: 'PATCH',
            url: 'http://localhost:8000/api/v1/users/updateme',
            data: {
                name,
                email,
            },
            // withCredentials: true,
        });
        if ((result.data.status == 'success')) {
            showAlert('success', 'Updated succesfully');
            // window.setTimeout(() => {
            //     location.assign('/me');
            // }, 1000);
        }
    } catch (error) {
        console.log(error)
        showAlert('error', error.response.data.message);
    }
};