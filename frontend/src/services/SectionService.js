import axios from "axios";
import {BASE} from "../config";

const API_URL = BASE + 'sections/'

class SectionService {
    async getSections() {
        return await axios.get(API_URL)
    }
}

export default new SectionService();