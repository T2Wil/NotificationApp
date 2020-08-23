import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const initializeAdmin = () => {
  const admin = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    isAdmin: true,
  };
  const newUser = new User(admin);
  newUser.save();
};

export default initializeAdmin;
