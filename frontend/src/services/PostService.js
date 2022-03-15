import axios from "axios";
import {BASE} from "../config";
import {authHeader} from "./Middleware";

const API_URL = BASE + 'posts/'

class PostService {
    async create(post) {
        return await axios.post(API_URL + 'create', post, {
            headers: {
                ...authHeader(),
                'Content-Type': 'application/json'
            }
        })
    }

    async uploadImage(formData, postId) {
        return await axios.put(API_URL + `image/${postId}`, formData, {
            headers: {
                ...authHeader(),
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    async getFeed() {
        return await axios.get(API_URL + 'feed')
    }

    async getById(id) {
        return await axios.get(API_URL + id)
    }

    async getComments(id) {
        return await axios.get(API_URL + `${id}/comments`)
    }

    async createComment(comment, postId) {
        return await axios.post(API_URL + 'comments/add', {comment: comment, postId: postId}, {
            headers: {
                ...authHeader(),
                'Content-Type': 'application/json'
            }
        })
    }
}

export default new PostService();
