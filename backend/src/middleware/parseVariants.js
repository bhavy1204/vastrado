export const parseVariants = (req, res, next) => {
    if (typeof req.body.variants === "string") {
        try {
            req.body.variants = JSON.parse(req.body.variants);
        } catch {
            return res.status(400).json({
                message: "Invalid variants format",
            });
        }
    }

    next();
};