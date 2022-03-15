import axios from "axios";
import {BASE} from "../config";
import StorageController from "../storage";

const API_URL = BASE + 'users/'

class AuthService {
    login(email, password) {
        return axios
            .post(API_URL + "login", {
                email,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    StorageController.saveUser(response.data)
                }
                return response.data;
            });
    }

    logout() {
        StorageController.removeUser()
    }

    register(username, email, password) {
        return axios.post(API_URL + "register", {
            username,
            email,
            password
        }).then(response => {
            if (response.data.accessToken) {
                StorageController.saveUser(response.data)
            }
            return response.data;
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    update(data) {
        StorageController.updateUser(data)
    }
}

export default new AuthService();
