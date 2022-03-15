const {Pool} = require('pg');
const config = require('../config');

const connectionString = config.DB_URI

const pool = new Pool({connectionString});

module.exports = pool;