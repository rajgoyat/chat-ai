const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const KEY = process.env.KEY;
const { authenticatetoken } = require("./userAuth");

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body);

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Check password length
        if (password.length <= 5) {
            return res.status(400).json({ message: "Password length should be greater than 5" });
        }

        // Hash the password
        const hashPass = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashPass });
        await newUser.save();
        console.log("User saved:", newUser);

        return res.status(200).json({ message: "Registered Successfully" });

    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Sign-in Route
router.post("/signin", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate JWT Token
        const authClaim = [
            { name: existingUser.username },
            { role: existingUser.role }
        ];
        const token = jwt.sign({ authClaim }, KEY, { expiresIn: "7d" });

        return res.status(200).json({ id: existingUser._id, role: existingUser.role, token });

    } catch (err) {
        console.error("Signin Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get User Information
router.get("/get-user-information", authenticatetoken, async (req, res) => {
    try {
        const { id } = req.headers;
        if (!id) {
            return res.status(400).json({ message: "User ID is required in headers" });
        }

        const data = await User.findById(id).select("-password");
        if (!data) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("Error fetching user data:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
