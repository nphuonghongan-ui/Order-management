import mongoose from 'mongoose';

import { setServers } from "node:dns/promises";

// A known issue discussed on stack overflow: https://stackoverflow.com/questions/55499175/how-to-fix-error-querysrv-erefused-when-connecting-to-mongodb-atlas
// And based on suggestion of alexbevi from: https://alexbevi.com/blog/2023/11/13/querysrv-errors-when-connecting-to-mongodb-atlas/
const switchingDns = () => {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

export const connectDB = async () => {
  try {
    switchingDns();

    const conn = await mongoose.connect("mongodb+srv://hongan_db_user:w9suCwO9lN62xk8L@cluster0.mewuycn.mongodb.net/order-management?appName=Cluster0");
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};
