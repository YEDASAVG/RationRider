import jwt from "jsonwebtoken";
// Login seller: /api/seller/login

export const SellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("sellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            success: true,
            message: "Logged in successfully"
        });
    } else {
        return res.json({
            success: false,
            message: "Invalid credentials"
        });
    }
    } catch (error) {
        console.error("Login error:", error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// Seller isAuth : /api/seller/is-auth

export const isSellerAuth = async (req, res) => {
    try {
        const { email } = req.body;  
        
        if (email === process.env.SELLER_EMAIL) {
            return res.json({
                success: true,
                seller: { email }
            });
        }

        return res.json({
            success: false,
            message: "Seller not found"
        });
    } catch (error) {
        console.error("Error in isAuth:", error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};


// seller logout  : /api/seller/logout

export const sellerLogout = async (req, res) => {
    try {
        res.clearCookie("sellerToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        console.error("Error in logout:", error);
        return res.json({
            success: false,
            message: error.message
        })
    }
}
