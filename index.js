let express = require("express");
let path = require("path");
let app = express();
const { Pool } = require("pg");
require("dotenv").config();
const cors = require("cors");
app.use(cors());

// Create the database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/db-check", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
});
app.get("/recipes", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM recipes");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.get("/recipes/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM recipes WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Recipe not found",
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.post("/recipes", async (req, res) => {
    const { name, ingredients, author, category, instructions } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO recipes (name, ingredients, author, category, instructions) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, ingredients, author, category, instructions]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.post("/users", async (req, res) => {
    const { username, email } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
            [username, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.get("/categories", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
