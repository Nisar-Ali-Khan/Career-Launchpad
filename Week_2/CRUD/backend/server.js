import express from "express";
import cors from "cors";
import pool from "./db.js";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For generating tokens
import dotenv from "dotenv"; // For managing environment variables

// Load variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// ==========================================
// AUTHENTICATION ROUTES (Login & Register)
// ==========================================

// 1. REGISTER USER
// This route accepts name, email, and password.
// It hashes the password before saving it to the database.
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Step 1: Generate a "salt" to make the password hash unique
        const salt = await bcrypt.genSalt(10);
        
        // Step 2: Hash the password (encrypt it)
        const hashedPassword = await bcrypt.hash(password, salt);

        // Step 3: Insert the new user into the database
        const result = await pool.query(
            "INSERT INTO users_data (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );

        res.status(201).json({ 
            message: "User registered successfully", 
            user: result.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Registration failed or Email already exists" });
    }
});

// 2. LOGIN USER
// This route checks credentials and returns a JWT token if valid.
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Check if the user exists in the database
        const users = await pool.query("SELECT * FROM users_data WHERE email = $1", [email]);
        
        if (users.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        // Step 2: Compare the provided password with the stored hashed password
        const validPassword = await bcrypt.compare(password, users.rows[0].password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Step 3: Generate a JWT Token
        // This token will be used for session management.
        const token = jwt.sign(
            { id: users.rows[0].id, email: users.rows[0].email }, // Payload
            process.env.JWT_SECRET, // Secret key from .env file
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        res.json({ message: "Login Successful", token: token });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// ==========================================
// MIDDLEWARE FOR AUTHORIZATION
// ==========================================

// This function checks if the request has a valid token.
const authenticateToken = (req, res, next) => {
    // Get the token from the header (Format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or Expired Token" });
        }
        // If valid, attach the user info to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route
    });
};

// ==========================================
// PROTECTED ROUTES (Requires Login)
// ==========================================

// Example of a protected route using the middleware
app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ 
        message: "Welcome to the private dashboard!", 
        user: req.user // This data comes from the decoded JWT
    });
});

// ==========================================
// PUBLIC CRUD ROUTES (Existing)
// ==========================================

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email FROM users_data");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- HOME ROUTE (To fix "Cannot GET /" error) ---
app.get("/", (req, res) => {
    res.send("Server is running! You can now test APIs in the console.");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running! Click here to open: http://localhost:${PORT}`);
});