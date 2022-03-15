const errorHandler = async (err, req, res, next) => {
    console.log(`Error: ${err}`)
    if (err.type === 'time-out')
        res.status(408).send({message: 'Timeout error'})
    else
        res.status(500).send({message: 'Error on the server'})
};

module.exports = errorHandler;