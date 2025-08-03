import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Remove fetch block (not needed in middleware)

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Not authorized token, access denied" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //find the user 
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user; // Attach user to request object
        next(); 

        
    } catch (error) {
        console.log("Authencation error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}
export default protectRoute;