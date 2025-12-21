import express from "express";
import cors from "cors";
import pool from "./db.js"; 

const app = express();

//  Middleware
app.use(cors());
app.use(express.json());

// Test DB Connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.log("DB Connection Error:", err);
    } else {
        console.log("DB Connected:", res.rows);
    }
});

//  Basic server test 
app.get("/", (req, res) => {
    res.send("Server is ready...");
});

//  Test DB route 
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ time: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection error" });
    }
});

//  CRUD Routes for users_data 

// CREATE a new user
app.post("/users", async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await pool.query(
            "INSERT INTO users_data (name, email) VALUES ($1, $2) RETURNING *",
            [name, email]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// READ all users
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users_data ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// READ a single user
app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM users_data WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// UPDATE a user
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const result = await pool.query(
            "UPDATE users_data SET name = $1, email = $2 WHERE id = $3 RETURNING *",
            [name, email, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE a user
app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM users_data WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

//  Start Server 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});