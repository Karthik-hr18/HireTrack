import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGO_URI or MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'hiretrack'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}, Database: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};
