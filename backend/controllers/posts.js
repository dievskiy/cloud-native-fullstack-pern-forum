const pool = require('../db/db')
const {getPreviewText} = require("../utils/utils");
const {uploadFile} = require("../utils/s3");
const util = require("util");
const fs = require("fs");
const unlinkFile = util.promisify(fs.unlink);


/**
 * Fetch feed. Feed is the same for each user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const feed = async (req, res) => {
    // todo pagination
    const posts = await pool.query(
        `SELECT p.id, title, p.created_at, p.image_url, section, preview_text, author, COUNT(scores.post_id) AS scores, users.username as author_name FROM posts as p LEFT JOIN scores on scores.post_id = p.id INNER JOIN users on users.id = p.author GROUP BY p.id, users.username`
    );
    res.json(posts.rows);
};

/**
 * Create a new post with given title, content and section
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const create = async (req, res) => {
    const client = await pool.connect()
    try {
        const {title, content, section} = req.body

        const sectionQuery = await client.query(`SELECT name FROM sections WHERE name = $1`, [
            section
        ])

        if (!sectionQuery.rowCount) {
            return res.status(400).json({message: 'The section does not exist'})
        }

        let sectionName = sectionQuery.rows[0].name

        const postCreateQuery = await client
            .query(`INSERT INTO posts (title, preview_text, content, author, section) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, section, preview_text`, [
                title, getPreviewText(content), content, req.user.id, sectionName
            ])

        let post = postCreateQuery.rows[0]

        const response = {
            post: {
                id: post.id,
                title: post.title,
                sectionName: post.section,
                previewText: post.preview_text
            }
        }

        return res.status(201).json(response)
    } catch (e) {
        console.log(`Posts:Create ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

/**
 * Update content of the post
 * @param req
 * @param res
 */
const update = async (req, res) => {
    const client = await pool.connect()
    try {
        const {postId, content} = req.body

        const postQuery = await client.query(`SELECT author FROM posts WHERE posts.id = $1`, [
            postId
        ])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        if (postQuery.rows[0].author !== req.user.id) {
            return res.status(401).json({message: 'You are not author of this post'})
        }

        const postUpdateQuery = await client
            .query(`UPDATE posts SET content = $1, preview_text = $2 WHERE id = $3 RETURNING id, title, section, preview_text`, [
                content, getPreviewText(content), postId
            ])

        let post = postUpdateQuery.rows[0];

        const response = {
            post: {
                id: post.id,
                title: post.title,
                sectionName: post.section,
                previewText: post.preview_text
            }
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Posts:Update ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

const updateImage = async (req, res) => {
    let client

    try {
        const location = (await uploadFile(req.file)).Location;
        await unlinkFile(req.file.path);

        if (location) {
            client = await pool.connect()

            const isAuthorQuery = await client.query(`SELECT author from posts where id = $1`, [req.params.id])

            if (!isAuthorQuery.rows) {
                return res.status(404).json({message: 'Post not found'})
            }

            if (isAuthorQuery.rows[0].author !== req.user.id) {
                return res.status(403).json({message: 'You are not author of this post'})
            }

            await client.query(`UPDATE posts SET image_url = $1 WHERE id = $2`,
                [location, req.params.id]
            )

            return res.status(200).json({})
        } else {
            return res.status(400).json({message: 'Not successful'})
        }
    } catch (e) {
        console.log(`Profiles: UploadImage ${e}`)
        return res.status(400).json({message: 'Not successful'})
    } finally {
        if (client) {
            client.release()
        }
    }
}

/**
 * Vote for the post. Voting for own posts is allowed.
 * @param req
 * @param res
 */
const scoreUp = async (req, res) => {
    const client = await pool.connect()
    try {
        const {postId} = req.body

        const postQuery = await client.query(`SELECT author FROM posts WHERE posts.id = $1`, [
            postId
        ])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        const scoreQuery = await client
            .query(`SELECT post_id, user_id FROM scores WHERE scores.post_id = $1 AND scores.user_id = $2`, [
                postId, req.user.id
            ])

        if (scoreQuery.rowCount) {
            return res.status(400).json({message: 'You have already scored this post'})
        }

        await pool.query(`INSERT INTO scores (user_id, post_id) VALUES ($1, $2)`, [req.user.id, postId])

        const post = await pool.query(
            `SELECT id, title, created_at, preview_text, author, COUNT(scores.post_id) AS scores FROM posts as p LEFT JOIN scores on scores.post_id = p.id WHERE p.id = $1 GROUP BY p.id`,
            [postId]);

        return res.status(200).json({post: {...post.rows[0]}});
    } catch (e) {
        console.log(`Posts:ScoreUp ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

/**
 * Remove vote from the post
 * @param req
 * @param res
 */
const scoreDown = async (req, res) => {
    const client = await pool.connect()
    try {
        const {postId} = req.body

        const postQuery = await client.query(`SELECT author FROM posts WHERE posts.id = $1`, [
            postId
        ])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        const scoreQuery = await client
            .query(`SELECT post_id, user_id FROM scores WHERE scores.post_id = $1 AND scores.user_id = $2`, [
                postId, req.user.id
            ])

        if (!scoreQuery.rowCount) {
            return res.status(400).json({message: `You didn't scored this post`})
        }

        await pool.query(`DELETE FROM scores WHERE user_id = $1 AND post_id = $2`, [req.user.id, postId])

        const post = await pool.query(
            `SELECT id, title, created_at, preview_text, author, COUNT(scores.post_id) AS scores FROM posts as p LEFT JOIN scores on scores.post_id = p.id WHERE p.id = $1 GROUP BY p.id`,
            [postId]);

        return res.status(200).json({post: {...post.rows[0]}});
    } catch (e) {
        console.log(`Posts:ScoreDown ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

/**
 * Delete post with given id
 * @param req
 * @param res
 */
const deletePost = async (req, res) => {
    const client = await pool.connect()
    try {
        const {postId} = req.body

        const postQuery = await client.query(`SELECT author FROM posts WHERE posts.id = $1`, [
            postId
        ])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        if (postQuery.rows[0].author !== req.user.id) {
            return res.status(401).json({message: 'You are not author of this post'})
        }

        await client.query(`DELETE FROM posts WHERE id = $1`, [postId])

        return res.status(200).json({})
    } catch (e) {
        console.log(`Posts:Delete ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

/**
 * Get post with specified id in params
 * @param req
 * @param res
 */
const getPost = async (req, res) => {
    const client = await pool.connect()
    try {
        const postId = req.params.id

        const postQuery = await client.query(`SELECT p.id, title, section, p.created_at, p.image_url, content, author, COUNT(scores.post_id) AS scores, users.username as author_name FROM posts as p LEFT JOIN scores on scores.post_id = p.id INNER JOIN users on users.id = p.author WHERE p.id = $1 GROUP BY p.id, users.id`, [
            postId
        ])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        return res.status(200).json({...postQuery.rows[0]})
    } catch (e) {
        console.log(`Posts:Get ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

/**
 * Get comments for post with id specified in path params in ordered by time (newest first)
 * @param req
 * @param res
 */
const getCommentsForPost = async (req, res) => {
    const client = await pool.connect()
    try {
        const postId = req.params.id

        const postQuery = await client.query(`SELECT posts.id FROM posts WHERE posts.id = $1`, [postId])

        if (!postQuery.rowCount) {
            return res.status(404).json({message: 'This post does not exist'})
        }

        const commentsQuery = await client.query(`select comments.user_id as author_id, comments.post_id, comments.is_edited, comments.created_at, comments.related_to, comments.content, users.username as author_name from comments inner join users on users.id = comments.user_id where post_id = $1 ORDER BY comments.created_at desc`, [
            postId
        ])

        return res.status(200).json([...commentsQuery.rows])
    } catch (e) {
        console.log(`Comments:GetCommentsForPost ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
    return res.status(200).json({message: 'Success'})
}

module.exports = {
    feed,
    create,
    update,
    deletePost,
    scoreUp,
    scoreDown,
    updateImage,
    getPost,
    getCommentsForPost
}