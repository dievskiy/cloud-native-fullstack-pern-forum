const pool = require('../db/db')
const {jwtSecret, saltLength} = require("../config")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/**
 * Route to query information about current user
 * @param req
 * @param res
 */
const me = async (req, res) => {
    const client = await pool.connect()
    try {

        const userProfileQuery = await client
            .query(`SELECT username, created_at, email, is_admin, description, image_url from users INNER JOIN profiles on users.profile_id = profiles.id WHERE users.id = $1`,
                [req.user.id])

        if (!userProfileQuery.rowCount) {
            return res.status(404).json({message: 'Profile not found'})
        }

        const response = {
            profile: {...userProfileQuery.rows[0]}
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
 * Register a new user
 * @param req
 * @param res
 */
const register = async (req, res) => {
    const client = await pool.connect()
    try {
        const {username, email, password} = req.body

        const usernameQuery = await client.query('SELECT id FROM users WHERE username = $1 or email = $2', [
            username, email
        ])
        if (usernameQuery.rowCount > 0) {
            return res
                .status(400)
                .json({message: 'The username or email is already in use.'})
        }

        const hashedPassword = await bcrypt.hash(password, saltLength)

        // creating profile and user should be inside the same transaction
        await client.query('BEGIN')
        const profileQuery = await client.query(
            `INSERT INTO profiles (description, image_url) VALUES ('', '') RETURNING id`
        )

        const userQuery = await client.query(
            'INSERT INTO USERS (username, email, password, profile_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email, hashedPassword, profileQuery.rows[0].id]
        )
        await client.query('COMMIT')

        const resp = {
            accessToken: '',
            user: {
                id: userQuery.rows[0].id,
                username: username,
                email: email
            }
        }
        resp.accessToken = jwt.sign({user: userQuery.rows[0].id}, jwtSecret, {
            expiresIn: '2 days'
        })
        return res.status(200).json(resp)
    } catch (e) {
        console.log(`Users:Register ${e}`)
        await client.query('ROLLBACK')
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Login with username and password
 * @param req
 * @param res
 */
const login = async (req, res) => {
    const client = await pool.connect()

    try {
        const {email, password} = req.body

        const userQuery = await client.query(
            'SELECT id, username, password, email FROM users WHERE email = $1',
            [email]
        )

        if (!userQuery.rowCount) {
            return res.status(404).json({message: 'User not found. Please register first.'})
        }
        const checkPass = await bcrypt.compare(password, userQuery.rows[0].password)
        if (!checkPass) {
            return res
                .status(400)
                .json({message: 'Invalid password'})
        }

        const resp = {
            accessToken: '',
            user: {
                id: userQuery.rows[0].id,
                username: userQuery.rows[0].username,
                email: userQuery.rows[0].email,
            }
        }
        resp.accessToken = jwt.sign({user: userQuery.rows[0].id}, jwtSecret, {
            expiresIn: '2 days'
        })

        return res.status(200).json(resp)
    } catch (e) {
        console.log(`Users:Login ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}


module.exports = {
    me,
    register,
    login
};