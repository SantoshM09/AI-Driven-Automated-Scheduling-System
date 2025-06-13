import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScheduleSchema } from "@shared/schema";
import { authenticate, requireAdmin, User, generateToken } from "./auth";
import { AIScheduler } from "./scheduler";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const aiScheduler = new AIScheduler();

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({ username, email, password, role: role || 'user' });
      await user.save();

      const token = generateToken((user._id as any).toString(), user.role);
      
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user._id.toString(), user.role);
      
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // AI Schedule Generation API
  app.post("/api/generate-scheduler", authenticate, requireAdmin, async (req, res) => {
    try {
      const scheduleData = req.body;
      
      // Validate the schedule data structure
      const validation = insertScheduleSchema.safeParse({
        college_time: scheduleData.college_time,
        break_periods: scheduleData.break_,
        rooms: scheduleData.rooms,
        subjects: scheduleData.subjects
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid schedule data format",
          errors: validation.error.errors 
        });
      }

      // Generate optimal schedule using AI
      const result = aiScheduler.generateOptimalSchedule(scheduleData);
      
      if (!result.success) {
        return res.status(400).json({
          message: result.message,
          success: false
        });
      }

      // Save the generated schedule to database
      const savedSchedule = await storage.createSchedule(validation.data);
      
      // Calculate metrics for the generated schedule
      const metrics = aiScheduler.calculateScheduleMetrics(result.schedule);

      res.json({
        message: result.message,
        success: true,
        schedule: result.schedule,
        conflicts: result.conflicts,
        metrics: metrics,
        savedSchedule: savedSchedule
      });
    } catch (error) {
      console.error("Error generating schedule:", error);
      res.status(500).json({ message: "Failed to generate schedule" });
    }
  });

  // GET /api/scheduler - Get current schedule data
  app.get("/api/scheduler", async (req, res) => {
    try {
      const schedule = await storage.getSchedule();
      res.json(schedule || null);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  // POST /api/scheduler/upload - Upload new schedule data
  app.post("/api/scheduler/upload", async (req, res) => {
    try {
      const scheduleData = req.body;
      
      // Validate the schedule data structure
      const validation = insertScheduleSchema.safeParse({
        college_time: scheduleData.college_time,
        break_periods: scheduleData.break_,
        rooms: scheduleData.rooms,
        subjects: scheduleData.subjects
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid schedule data format",
          errors: validation.error.errors 
        });
      }

      const schedule = await storage.createSchedule(validation.data);
      res.json({ 
        message: "Schedule uploaded successfully",
        schedule 
      });
    } catch (error) {
      console.error("Error uploading schedule:", error);
      res.status(500).json({ message: "Failed to upload schedule" });
    }
  });

  // GET /api/scheduler/rooms - Get all rooms
  app.get("/api/scheduler/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  // GET /api/scheduler/rooms/:id - Get specific room schedule
  app.get("/api/scheduler/rooms/:id", async (req, res) => {
    try {
      const roomId = req.params.id;
      const roomSchedule = await storage.getRoomSchedule(roomId);
      
      if (!roomSchedule) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(roomSchedule);
    } catch (error) {
      console.error("Error fetching room schedule:", error);
      res.status(500).json({ message: "Failed to fetch room schedule" });
    }
  });

  // GET /api/scheduler/faculty - Get all faculty
  app.get("/api/scheduler/faculty", async (req, res) => {
    try {
      const faculty = await storage.getAllFaculty();
      res.json(faculty);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  // GET /api/scheduler/faculty/:id - Get specific faculty schedule
  app.get("/api/scheduler/faculty/:id", async (req, res) => {
    try {
      const facultyId = req.params.id;
      const facultySchedule = await storage.getFacultySchedule(facultyId);
      
      if (!facultySchedule) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      
      res.json(facultySchedule);
    } catch (error) {
      console.error("Error fetching faculty schedule:", error);
      res.status(500).json({ message: "Failed to fetch faculty schedule" });
    }
  });

  // GET /api/scheduler/insights - Get AI insights and analytics
  app.get("/api/scheduler/insights", async (req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // GET /api/scheduler/stats - Get dashboard statistics
  app.get("/api/scheduler/stats", async (req, res) => {
    try {
      const schedule = await storage.getSchedule();
      const insights = await storage.getInsights();
      const rooms = await storage.getAllRooms();
      const faculty = await storage.getAllFaculty();
      
      if (!schedule) {
        return res.json({
          totalRooms: 0,
          activeFaculty: 0,
          weeklyClasses: 0,
          avgUtilization: 0
        });
      }

      const scheduleData = schedule.subjects as any;
      const subjects = scheduleData.subjects || [];
      
      // Calculate weekly classes
      const weeklyClasses = subjects.reduce((total: number, subject: any) => {
        return total + (subject.no_of_classes_per_week || 0);
      }, 0);

      res.json({
        totalRooms: rooms.length,
        activeFaculty: faculty.length,
        weeklyClasses,
        avgUtilization: insights.avgUtilization
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
