require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/students', require('./routes/adminStudents'));
app.use('/api/admin/subjects', require('./routes/adminSubjects'));
app.use('/api/admin/notes', require('./routes/adminNotes'));
app.use('/api/student', require('./routes/student'));

app.listen(PORT, () => console.log(`✅  Eklavya backend running on http://localhost:${PORT}`));
