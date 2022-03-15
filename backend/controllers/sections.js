const pool = require('../db/db')

/**
 * Create a new section with given name. Any authenticated user can create a section
 * @param req
 * @param res
 */
const create = async (req, res) => {
    const client = await pool.connect()
    try {
        const {name} = req.body

        const existsQuery = await client.query(`SELECT name FROM sections WHERE name = $1`, [name])

        if (existsQuery.rowCount) {
            return res.status(400).json({message: 'Section already exists'})
        }

        const sectionCreateQuery = await client
            .query(`INSERT INTO sections (name) VALUES ($1) RETURNING name`, [name])

        const response = {
            section: {...sectionCreateQuery.rows[0]}
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Section:Create ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

/**
 * Fetch all sections
 * @param req
 * @param res
 */
const get = async (req, res) => {
    const client = await pool.connect()
    try {
        const sectionsFetchQuery = await client.query(`SELECT * FROM sections`)

        const response = {
            sections: [...sectionsFetchQuery.rows.map((it) => it.name)]
        }

        return res.status(200).json(response)
    } catch (e) {
        console.log(`Section:Get ${e}`)
        return res.status(500).json({message: 'Server error'})
    } finally {
        client.release()
    }
}

module.exports = {
    create,
    get
}