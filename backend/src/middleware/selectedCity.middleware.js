export const attachSelectedCity = (req, res, next) => {
    req.cityId = req.header("X-City-Id") || null;
    next();
};

