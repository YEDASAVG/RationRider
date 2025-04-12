import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
    const {sellerToken} = req.cookies;
    if(!sellerToken){
        return res.json({
            success: false,
            message: "Unauthorized access"
        });
    }
    try {
            const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
            if(tokenDecode.email === process.env.SELLER_EMAIL){
                // Initialize req.body if it doesn't exist
                if (!req.body) req.body = {};
                req.body.email = tokenDecode.email;
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
}

export default authSeller;