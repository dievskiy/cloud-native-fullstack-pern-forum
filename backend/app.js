const cors = require('cors');
const config = require('./config');
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');
const errorMiddleware = require('./middleware/errors.js');
const app = express();

app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());
app.use('/api', routes);
app.use(errorMiddleware);

if (process.env.JEST_WORKER_ID !== "1") {
    app.listen(config.appPort, () => console.log(`Server started on port ${config.appPort}`));
}

module.exports = app;
