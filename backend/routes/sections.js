const router = require('express').Router();
const sectionController = require('../controllers/sections.js');
const {check, validationResult} = require('express-validator');
const auth = require('../middleware/auth');

router.post('/create', auth, [
    check('name')
        .isLength({
            min: 3,
            max: 50
        })
        .withMessage('Section name length should be in range from 3 to 50 characters')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return sectionController.create(req, res);
    }
});

router.get('/', async (req, res, next) => {
    return sectionController.get(req, res);
});

module.exports = router;