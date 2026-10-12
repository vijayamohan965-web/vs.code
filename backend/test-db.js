
const db = require("./db");

async function testConnection() {
  try {
    const [rows] = await db.query("SELECT * FROM registration");

    console.log("MySQL connected successfully!");
    console.log("Registration records:", rows);
  } catch (error) {
    console.error("Connection error:", error.message);
  } finally {
    await db.end();
  }
}

testConnection();
