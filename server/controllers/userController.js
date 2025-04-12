// Register user: /api/user/register

import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Register user: /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true, // Prevent javascript access to the cookie
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiration time
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Login user: /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // If no user found, return error
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // If password doesn't match return error
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // If everything is correct then generate token and send response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

// check auth : /api/user/is-auth

export const isAuth = async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error in isAuth:", error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// logout User : /api/user/logout

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
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
