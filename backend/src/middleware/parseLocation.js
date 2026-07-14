export const parseLocationField = (req, res, next) => {
        console.log("SELLER REACHED HERE");
    if (req.body.location && typeof req.body.location === "string") {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch {
            return res.status(400).json({ message: "Invalid location format" });
        }
    }
    next();
};

