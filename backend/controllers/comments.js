const pool = require('../db/db')

/**
 * Create a new comment for given post. Any authenticated user can create a comment
 * @param req
 * @param res
 */
const add = async (req, res) => {
    const client = await pool.connect()
    try {
        const {postId, comment, relatedTo} = req.body

        const existsQuery = await client.query(`SELECT id FROM posts WHERE posts.id = $1`, [postId])

        if (!existsQuery.rowCount) {
            return res.status(400).json({message: 'Post does not exist'})
        }

        if (relatedTo) {
            // check that related comment is indeed present for this post
            const relatedQuery = await client.query(`SELECT id FROM comments WHERE post_id = $1 AND id = $2`, [postId, relatedTo])

            if (!relatedQuery.rowCount) {
                return res.status(400).json({message: 'Related comment id is not valid'})
            }
        }

        const commentCreateQuery = await client
            .query(`INSERT INTO comments (user_id, post_id, related_to, content) VALUES ($1, $2, $3, $4) RETURNING post_id, related_to, content, created_at, is_edited`,
                [req.user.id, postId, relatedTo, comment]
            )

        const response = {
            comment: {...commentCreateQuery.rows[0]}
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Comment:Add ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Edit created comment
 * @param req
 * @param res
 */
const edit = async (req, res) => {
    const client = await pool.connect()
    try {
        const {commentId, comment} = req.body

        const commentQuery = await client.query(`SELECT id, user_id FROM comments WHERE comments.id = $1`, [commentId])

        if (!commentQuery.rowCount) {
            return res.status(400).json({message: 'Comment does not exist'})
        }

        if (commentQuery.rows[0].user_id !== req.user.id) {
            return res.status(400).json({message: 'You are not author of this comment'})
        }

        const commentEditQuery = await client
            .query(`UPDATE comments SET content = $1, is_edited = true WHERE id = $2 RETURNING post_id, related_to, content, created_at, is_edited`,
                [comment, commentId]
            )

        const response = {
            comment: {...commentEditQuery.rows[0]}
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Comment:Edit ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Delete created comment
 * @param req
 * @param res
 */
const deleteComment = async (req, res) => {
    const client = await pool.connect()
    try {
        const {commentId} = req.body

        const commentQuery = await client.query(`SELECT id, user_id FROM comments WHERE comments.id = $1`, [commentId])

        if (!commentQuery.rowCount) {
            return res.status(400).json({message: 'Comment does not exist'})
        }

        if (commentQuery.rows[0].user_id !== req.user.id) {
            return res.status(400).json({message: 'You are not author of this comment'})
        }

        await client.query(`DELETE FROM comments WHERE id = $1`, [commentId])

        return res.status(200).json({})
    } catch (e) {
        console.log(`Comment:Edit ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

module.exports = {
    add,
    edit,
    deleteComment
}