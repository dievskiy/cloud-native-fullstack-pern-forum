const router = require('express').Router();
const commentsController = require('../controllers/comments.js');
const {check, validationResult} = require('express-validator');
const auth = require('../middleware/auth');
const {MAX_INT_ID} = require("../utils/utils");

router.post('/add', auth, [
    check('postId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid post id'),
    check('relatedTo')
        .optional()
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Invalid related message'),
    check('comment')
        .isLength({
            min: 1,
            max: 400
        })
        .withMessage(`Comment's length should be from 1 to 400 characters`)
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return commentsController.add(req, res);
    }
});

router.put('/edit', auth, [
    check('commentId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid comment id'),
    check('comment')
        .isLength({
            min: 1,
            max: 400
        })
        .withMessage(`Comment's length should be from 1 to 400 characters`)
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return commentsController.edit(req, res);
    }
});

router.delete('/delete', auth, [
    check('commentId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid comment id')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return commentsController.deleteComment(req, res);
    }
});

module.exports = router;