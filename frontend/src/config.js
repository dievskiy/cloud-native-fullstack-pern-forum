require('dotenv').config();
const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8000'
const BASE = BASE_URL + '/api/'
const REDIRECT_DELAY = 1000
const PLACEHOLDER_IMAGE = 'http://via.placeholder.com/400x200.png'

module.exports = {
    BASE,
    REDIRECT_DELAY,
    PLACEHOLDER_IMAGE
}