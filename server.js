const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// origin: 'http://localhost:3000',
app.use(cors({
  origin: 'https://butterflyclient.onrender.com',
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Define a Mongoose schema for storing form submissions
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log('Received request:', req.body); // Log the request
  
  try {
    // Save form submission to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    // Send email using Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.EMAIL_USER, // Receiver address (can be your email)
      phone: `New Message from ${name}: ${phone}`, // Email phone
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`, // Email body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).send('Failed to save form submission');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});