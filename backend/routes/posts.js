const router = require('express').Router();
const postController = require('../controllers/posts.js');
const {check, validationResult, param} = require('express-validator');
const auth = require('../middleware/auth');
const {MAX_INT_ID} = require("../utils/utils");
const upload = require("../utils/file");

router.get('/feed', postController.feed);

router.post('/create', auth, [
    check('content')
        .isLength({
            min: 30,
            max: 15000
        })
        .withMessage('Content length should be in range from 30 to 15000 characters'),
    check('title')
        .isLength({
            min: 5,
            max: 200
        }).withMessage('Title length should be in range from 5 to 200 characters'),
    check('section')
        .isString()
        .withMessage('Please provide a valid section')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return postController.create(req, res);
    }
});

router.put('/update', auth, [
    check('content')
        .isLength({
            min: 30,
            max: 15000
        })
        .withMessage('Content length should be in range from 30 to 15000 characters'),
    check('postId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid post id')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return postController.update(req, res);
    }
});

router.put('/image/:id', auth, [
        param('id').exists().withMessage('Post id not passed').isInt().withMessage('Invalid post id')
    ],
    upload.single("image"), postController.updateImage)

router.get('/:id', [
    param('id').isInt({min: 0, max: MAX_INT_ID}).withMessage('Invalid post id')
], postController.getPost)

router.get('/:id/comments', [
    param('id').exists().withMessage('Post id not passed').isInt({
        min: 0,
        max: MAX_INT_ID
    }).toInt().withMessage('Invalid post id')
], postController.getCommentsForPost)

router.delete('/delete', auth, [
    check('postId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid post id')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return postController.deletePost(req, res);
    }
});

router.post('/scoreUp', auth, [
    check('postId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid post id')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return postController.scoreUp(req, res);
    }
});

router.post('/scoreDown', auth, [
    check('postId')
        .isInt({min: 0, max: MAX_INT_ID})
        .withMessage('Please provide a valid post id')
], async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: errors.errors[0].msg})
    } else {
        return postController.scoreDown(req, res);
    }
});

module.exports = router;