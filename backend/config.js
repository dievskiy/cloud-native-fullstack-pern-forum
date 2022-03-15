const path = require('path');

const envPath =
    process.env.NODE_ENV === "test"
        ? './.env.test'
        : './.env';

require('dotenv').config({
    path: path.resolve(__dirname, envPath),
});

module.exports = {
    DB_URI: process.env.DB_URI,
    appPort: process.env.APP_PORT,
    jwtSecret: process.env.JWT_SECRET,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
    saltLength: 10
};