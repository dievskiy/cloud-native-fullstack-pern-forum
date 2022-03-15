import axios from "axios";
import {BASE} from "../config";
import {authHeader} from "./Middleware";

const API_URL = BASE + 'profiles/'

class ProfileService {
    async uploadImage(data) {
        return await axios.post(API_URL + 'image', data, {
            headers: {
                ...authHeader(),
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    async getProfileByName(name) {
        return await axios.get(API_URL + 'profile', {
            headers: authHeader(),
            params: {username: name}
        })
    }

    async updateDescription(description) {
        return await axios.put(API_URL + 'profile', {
            description: description
        }, {
            headers: {
                ...authHeader()
            }
        })
    }
}

export default new ProfileService();
