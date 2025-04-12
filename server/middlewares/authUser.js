import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.json({
            success: false,
            message: "Unauthorized access"
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode.id){
            // Initialize req.body if it doesn't exist
            if (!req.body) req.body = {};
            req.body.userId = tokenDecode.id;
            return next();
        } else {
            return res.json({
                success: false,
                message: "Unauthorized access"
            });
        }
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export default authUser;
