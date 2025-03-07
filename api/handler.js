const serverless = require("serverless-http");
const express = require("express");
const bcrypt = require("bcryptjs");
const { createAccount, sendVerificationEmail } = require('./services/account');

const app = express();

// Add JSON body parser middleware
app.use(express.json());

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Hash the password with a minimum cost factor for security
    const SALT_ROUNDS = 12; // Industry standard minimum for security

    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
      if (err) {
        throw err;
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          throw err;
        }

        console.log(hash);
      });
    });
    
    // TODO: Save user to database
    const { verificationCode } = await createAccount(email, password);

    // TODO: Send verification email
    // This is where you would typically send a verification email
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      message: "User registration successful",
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
