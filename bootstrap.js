const { execSync } = require("child_process");
const fs = require("fs");
const readline = require("readline");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const packages = [
  "express",
  "mongoose",
  "jsonwebtoken",
  "bcrypt",
  "dotenv",
  "cors",
  "nodemon"
];

// ---------- Step 1: Install missing packages ----------
console.log("Checking and installing required packages...");
packages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg} is already installed`);
  } catch (e) {
    console.log(`📦 Installing ${pkg}...`);
    execSync(`npm install ${pkg}`, { stdio: "inherit" });
  }
});

// ---------- Step 2: Create .env if missing ----------
if (!fs.existsSync(".env")) {
  console.log("\nCreating .env file...");
  const envContent = `MONGO_URI=your_atlas_connection_string
JWT_SECRET=some_long_random_secret
ALLOW_ADMIN_SEED=true
`;
  fs.writeFileSync(".env", envContent);
  console.log(".env file created. Please update MONGO_URI and JWT_SECRET before proceeding.");
} else {
  console.log("\n.env file already exists, skipping creation.");
}

// ---------- Step 3: Connect to Mongo ----------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Mongo connection failed. Check MONGO_URI in .env.");
    process.exit(1);
  }
};

// ---------- Step 4: Define Models ----------
const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
  active: { type: Boolean, default: true }
});
const User = mongoose.model("User", UserSchema);

const JobSchema = new mongoose.Schema({
  customerName: String,
  vehicleReg: String,
  complaint: String,
  location: String,
  status: { type: String, default: "new" },
  createdAt: { type: Date, default: Date.now }
});
JobSchema.index({ status: 1, createdAt: -1 });
const Job = mongoose.model("Job", JobSchema);

// ---------- Step 5: Seed admin (if allowed) ----------
const seedAdmin = async () => {
  if (process.env.ALLOW_ADMIN_SEED !== "true") {
    console.log("Admin seeding disabled. Skipping.");
    return;
  }

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists. Skipping seeding.");
    return;
  }

  // Ask for email/password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter admin email: ", email => {
    rl.question("Enter admin password: ", async password => {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await User.create({
        email,
        passwordHash,
        role: "admin",
        active: true
      });
      console.log(`✅ Admin created with ID: ${admin._id}`);
      console.log("⚠️ Seeding route should now be disabled: set ALLOW_ADMIN_SEED=false in .env");

      // ---------- Step 6: Create multiple test jobs ----------
      const testJobs = [
        { customerName: "John Doe", vehicleReg: "AB12 CDE", complaint: "Car won’t start", location: "Snodland" },
        { customerName: "Jane Smith", vehicleReg: "XY34 ZYX", complaint: "Flat tire", location: "Chatham" },
        { customerName: "Mike Brown", vehicleReg: "CD56 EFG", complaint: "Battery dead", location: "Medway" },
        { customerName: "Lucy Green", vehicleReg: "GH78 IJK", complaint: "Brake noise", location: "Snodland" },
        { customerName: "Tom White", vehicleReg: "LM90 NOP", complaint: "Engine overheating", location: "Rochester" },
        { customerName: "Anna Black", vehicleReg: "QR12 STU", complaint: "Aircon not working", location: "Chatham" },
        { customerName: "Peter Gray", vehicleReg: "VW34 XYZ", complaint: "Alternator failure", location: "Snodland" },
        { customerName: "Emma Blue", vehicleReg: "YZ56 ABC", complaint: "Oil leak", location: "Medway" }
      ];

      for (const job of testJobs) {
        const createdJob = await Job.create(job);
        console.log(`🚗 Test job created: ${createdJob.vehicleReg} - ${createdJob.complaint}`);
      }

      console.log("\n🎉 Admin and multiple test jobs are ready. Admin home page will show jobs immediately!");

      rl.close();
      process.exit(0);
    });
  });
};

// ---------- Step 7: Run ----------
connectDB().then(() => seedAdmin());