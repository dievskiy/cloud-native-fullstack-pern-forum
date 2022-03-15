const pool = require('../db/db')
const {uploadFile} = require("../utils/s3");
const util = require("util");
const fs = require("fs");
const unlinkFile = util.promisify(fs.unlink);

/**
 * Set a new description for current user
 * @param req
 * @param res
 */
const updateDescription = async (req, res) => {
    const client = await pool.connect()
    try {
        const {description} = req.body

        await client.query(`UPDATE profiles SET description = $1 WHERE id = (SELECT profile_id FROM users WHERE users.id = $2)`,
            [description, req.user.id]
        )

        const userProfileQuery = await client
            .query(`SELECT username, created_at, email, is_admin, description, image_url from users INNER JOIN profiles on users.profile_id = profiles.id WHERE users.id = $1`,
                [req.user.id])

        const response = {
            profile: {...userProfileQuery.rows[0]}
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Profiles:UpdateDescription ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Set a new description for current user
 * @param req
 * @param res
 */
const getProfile = async (req, res) => {
    const client = await pool.connect()
    try {
        const {username} = req.query

        const userProfileQuery = await client
            .query(`SELECT users.id, username, created_at, email, is_admin, description, image_url from users INNER JOIN profiles on users.profile_id = profiles.id WHERE users.username = $1`,
                [username])

        if (!userProfileQuery.rowCount) {
            return res.status(404).json({message: 'Profile not found'})
        }

        const statistics = await client
            .query(`SELECT (SELECT COUNT(*) FROM posts WHERE author = $1) AS posts_created, (SELECT COUNT(*) FROM comments WHERE user_id = $1) AS comments_added, (SELECT COUNT(*) FROM scores WHERE user_id = $1) AS posts_upvoted, (SELECT COUNT(*) FROM comments where user_id = $1 and related_to IS NOT NULL) AS replies`,
                [userProfileQuery.rows[0].id])

        const response = {
            profile: {...userProfileQuery.rows[0]},
            statistics: {...statistics.rows[0]}
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Profiles:GetProfile ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Upload an image to the profile of current user to S3 and save the link in database
 * @param req
 * @param res
 */
const uploadImage = async (req, res) => {
    const client = await pool.connect()

    try {
        const location = (await uploadFile(req.file)).Location;
        await unlinkFile(req.file.path);

        if (location) {

            await client.query(`UPDATE profiles SET image_url = $1 WHERE id = $2`,
                [location, req.user.id]
            )
            const userProfileQuery = await client
                .query(`SELECT username, created_at, email, is_admin, description, image_url from users INNER JOIN profiles on users.profile_id = profiles.id WHERE users.id = $1`,
                    [req.user.id])

            const response = {
                profile: {...userProfileQuery.rows[0]}
            }

            return res.status(200).json(response)
        } else {
            return res.status(400).json({message: 'Not successful'})
        }
    } catch (e) {
        console.log(`Profiles: UploadImage ${e}`)
        return res.status(400).json({message: 'Not successful'})
    } finally {
        client.release()
    }
}

module.exports = {
    updateDescription,
    uploadImage,
    getProfile
}