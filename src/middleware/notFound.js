const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Resource Not Found'
    })
}

module.exports = {notFound}