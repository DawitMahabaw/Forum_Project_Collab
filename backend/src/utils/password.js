// Import bcrypt.
//
// bcrypt is a password-hashing library.
//
// We NEVER store a user's original password in our database.
// Instead, bcrypt transforms the password into a secure hash
// that can be stored safely.
import bcrypt from "bcrypt";

// ------------------------------------------------------------
// BCRYPT CONFIGURATION
// ------------------------------------------------------------
//
// "Salt rounds" controls how much computational work bcrypt
// performs when creating a password hash.
//
// A higher number makes password hashing more expensive,
// which makes brute-force attacks more difficult.
//
// 10 is a reasonable starting value for this project.
const SALT_ROUNDS = 10;

// ------------------------------------------------------------
// HASH PASSWORD
// ------------------------------------------------------------
//
// This function receives the user's original password and
// creates a bcrypt hash.
//
// Example:
//
// Input:
// "MyPassword123"
//
// Output:
// "$2b$10$................................................"
//
// The original password should never be returned or stored.
const hashPassword = async (password) => {
  // bcrypt.hash() automatically generates a random salt
  // and combines it with the password before producing
  // the final password hash.
  //
  // We use await because hashing is an asynchronous operation.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Return the generated hash to the caller.
  //
  // The authentication service will eventually pass this
  // hash to the User model for database storage.
  return passwordHash;
};

// ------------------------------------------------------------
// COMPARE PASSWORD
// ------------------------------------------------------------
//
// This function is used during LOGIN.
//
// It compares:
//
// 1. The password the user entered
// 2. The bcrypt hash stored in the database
//
// bcrypt handles the comparison safely for us.
//
// It returns:
//
// true  → passwords match
// false → passwords do not match
const comparePassword = async (password, passwordHash) => {
  // bcrypt.compare() takes the plain password entered by
  // the user and compares it against the stored bcrypt hash.
  //
  // We do NOT decrypt the hash.
  //
  // Password hashes are designed to be one-way.
  const isMatch = await bcrypt.compare(password, passwordHash);

  // Return the result of the comparison.
  return isMatch;
};

// Export both functions.
//
// Other parts of our backend can now import only the
// password operations they need.
//
// Example:
//
// import {
//   hashPassword,
//   comparePassword,
// } from "../utils/password.js";
export { hashPassword, comparePassword };
