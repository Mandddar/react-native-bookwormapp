import express from "express";
import User from "../models/User.js"; // Add .js if using ES modules
import jwt from "jsonwebtoken"; // Assuming you are using JWT for authentication
const router = express.Router();
const generateToken = (userId) => {

  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '30d'});
  
}
// Change GET to POST for registration
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username should not be less than 3 characters long" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Fix: Use correct field name 'username' (not 'Username')
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    // TODO: Hash password before saving (recommended for production)
    const user = new User({
      email,
      username,
      password,
      profileImage,
    });
    await user.save();
    const token=generateToken(user._id); // Assuming you have a function to generate JWT token
    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,}
     });
  } catch (error) {
    console.log("Error in register route:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change GET to POST for login
router.post("/login", async (req, res) => {
   try {
    const {email,password}= req.body;
    if(!email || !password){
      return res.status(400).json({message:"All fileds are required"})
    }
    //check if user exists
    const user= await User.findOne({email});
    if(!user) return res.status(400).json({message:"User dont exist"});
    
    const isPasswordCorrect= await user.comparePassword(password);
    if(!isPasswordCorrect) return res.status(400).json({meesage:"Invalid credentials"});

    const token=generateToken(user._id);
    res.status(200).json({
      token,
      user:{
        id:user._id,
        username:user.username,
        email:user.email,
        profileImage:user.profileImage,
      },
    })
   } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({messgae:"Internal server error"});
    
   }
});

export default router;
