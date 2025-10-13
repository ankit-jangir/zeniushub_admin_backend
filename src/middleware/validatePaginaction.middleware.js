const validatePagination = (req, res, next) => {
    let { page, limit } = req.body; // Change from query to body

    if (!page || isNaN(Number(page)) || Number(page) < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid 'page' value. It must be a positive integer.",
        });
    }

    if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid 'limit' value. It must be a positive integer.",
        });
    }

    if (Number(limit) > 50) {
        limit = 50;
    }

    req.body.page = Number(page);
    req.body.limit = Number(limit); // Convert to Number properly

    next();
};

module.exports = validatePagination;
