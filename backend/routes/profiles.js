const router = require('express').Router();
const profilesController = require('../controllers/profiles.js');
const {check, validationResult, param, query} = require('express-validator');
const auth = require('../middleware/auth');
const upload = require("../utils/file");


router.put('/profile', auth, [
    check('description')
        .isLength({min: 1, max: 200})
        .withMessage('Description should be in range from 1 to 200 characters')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return profilesController.updateDescription(req, res);
    }
});

router.get('/profile', [
    query('username').exists()
        .withMessage('No username provided')
        .isString()
        .withMessage('Invalid username in query params')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return profilesController.getProfile(req, res);
    }
});


router.post('/image', auth, upload.single("image"), profilesController.uploadImage)

module.exports = router;