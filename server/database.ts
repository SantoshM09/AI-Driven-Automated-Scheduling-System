import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    // Use MongoDB Memory Server for development
    if (process.env.NODE_ENV === 'development') {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'room-scheduler'
          }
        });
      }
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to MongoDB Memory Server');
    } else {
      // Use actual MongoDB URI in production
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/room-scheduler';
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}

// Schedule Schema
const scheduleSchema = new mongoose.Schema({
  college_time: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  break_periods: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  rooms: [{ type: String, required: true }],
  subjects: [{
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    no_of_classes_per_week: { type: Number, required: true },
    faculty: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      availability: [{
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      }]
    }]
  }],
  created_at: { type: Date, default: Date.now }
});

export const ScheduleModel = mongoose.model('Schedule', scheduleSchema);