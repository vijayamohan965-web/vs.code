require("dotenv").config();

const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Register a student using their manually entered roll number
app.post("/register", async (req, res) => {
  try {
    const { roll_number, name, email, department } = req.body;

    if (
      typeof roll_number !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof department !== "string" ||
      !roll_number.trim() ||
      !name.trim() ||
      !email.trim() ||
      !department.trim()
    ) {
      return res.status(400).json({
        message: "Please fill in all fields, including your college roll number."
      });
    }

    const studentRollNumber = roll_number.trim();
    const studentName = name.trim();
    const studentEmail = email.trim();
    const studentDepartment = department.trim();

    if (studentRollNumber.length > 20) {
      return res.status(400).json({
        message: "Roll number must be 20 characters or fewer."
      });
    }

    const sql = `
      INSERT INTO registration
        (roll_number, name, email, department)
      VALUES (?, ?, ?, ?)
    `;

    await db.execute(sql, [
      studentRollNumber,
      studentName,
      studentEmail,
      studentDepartment
    ]);

    return res.status(201).json({
      message: `Registration successful! Roll number: ${studentRollNumber}`
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This roll number or another unique value is already registered."
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please check the server and database."
    });
  }
});

// View registered students
app.get("/registrations", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT roll_number, name, email, department
      FROM registration
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch error:", error.message);

    res.status(500).json({
      message: "Could not load registrations."
    });
  }
});

// Start only after checking the database connection
async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
}

startServer();