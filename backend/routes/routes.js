const router = require('express').Router()
const usersRouter = require('./users')
const postsRouter = require('./posts')
const sectionRouter = require('./sections')
const profilesRouter = require('./profiles')
const commentsRouter = require('./comments')

router.use('/users', usersRouter)

router.use('/posts', postsRouter)

router.use('/sections', sectionRouter)

router.use('/profiles', profilesRouter)

router.use('/posts/comments', commentsRouter)

module.exports = router