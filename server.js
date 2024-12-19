require('dotenv').config(); 
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const Joi = require("joi");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: process.env.DB_HOST,       
    user: process.env.DB_USER,       
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME    
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database connected");
});


const employeeSchema = Joi.object({
    name: Joi.string().required(),
    employeeId: Joi.string().alphanum().max(10).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    department: Joi.string().required(),
    dateOfJoining: Joi.date().max("now").required(),
    role: Joi.string().required(),
});

app.post("/add-employee", (req, res) => {
    const { error, value } = employeeSchema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const { name, employeeId, email, phone, department, dateOfJoining, role } = value;

    const query = `INSERT INTO employees (name, employeeId, email, phone, department, dateOfJoining, role)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, employeeId, email, phone, department, dateOfJoining, role], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).send({ message: "Employee ID or Email already exists" });
            }
            return res.status(500).send({ message: "Database error" });
        }
        res.send({ message: "Employee added successfully" });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
