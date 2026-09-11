import User from "../models/User.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

import { generateToken } from "../utils/jwt.js";

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}) => {


  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists.",
    );

    error.statusCode = 409;

    throw error;
  }



  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
  });


  const token = generateToken(user.userId);

  return {
    user,
    token,
  };
};



const loginUser = async ({
  email,
  password,
}) => {

  const user = await User.findByEmail(email);

 

  if (!user) {
    const error = new Error(
      "Invalid email or password.",
    );

    error.statusCode = 401;

    throw error;
  }


  const isPasswordValid = await comparePassword(
    password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    const error = new Error(
      "Invalid email or password.",
    );

    error.statusCode = 401;

    throw error;
  }



  const token = generateToken(user.user_id);


  return {
    user: {
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    },

    token,
  };
};



const getCurrentUser = async (userId) => {

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error(
      "User not found.",
    );

    error.statusCode = 404;

    throw error;
  }


  return {
    userId: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
};



export {
  registerUser,
  loginUser,
  getCurrentUser,
};

