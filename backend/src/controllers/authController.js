import bcrypt from "bcrypt";
import User from "../models/userModel.js";

export const signIn = async (req, res) => {
try {
        //lay username va password tu request body
        const { username, password } = req.body;
            if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        //lay hashed password tu database input
        const user = await User.findOne({ username });
            if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        //kiem tra password tu request body voi hashed password tu database
        const passwordCorrect = await bcrypt.compare(password, user.password);
            if (!passwordCorrect) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        //neu username va password dung, tra ve thong tin user
        return res.status(200).json({ message: "Login successful", user });


} catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }   