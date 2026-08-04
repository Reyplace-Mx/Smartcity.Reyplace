import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (topic) => {
      // Unsubscribe from previous topics to keep it simple
      socket.rooms.forEach(room => {
        if (room !== socket.id) socket.leave(room);
      });
      socket.join(topic);
    });
  });

  // Simulated Ingest Worker logic emitting anomalies
  setInterval(() => {
    // Pick a random sensor anomaly
    const anomalousSensor = {
      id: `c${Math.floor(Math.random() * 10) + 1}`,
      aqi: Math.floor(Math.random() * 200),
      trafficDensity: Math.floor(Math.random() * 100),
      color: [255, 0, 0] // Red for anomaly
    };
    
    // Global admin room
    io.to('all_sensors').emit('sensor_anomaly', anomalousSensor);

    // Emitting to partner-specific rooms (in a real app, this logic checks the sensor ID against DB)
    if (['c4', 'c5', 'c8', 'c10'].includes(anomalousSensor.id)) {
      io.to('traffic').emit('sensor_anomaly', anomalousSensor);
    }
    if (['c1', 'c2', 'c3'].includes(anomalousSensor.id)) {
      io.to('environment').emit('sensor_anomaly', anomalousSensor);
    }
  }, 2000); // Every 2 seconds emit an anomaly for demo

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const { message, tools, mode } = req.body;
      
      let model = "gemini-3.5-flash";
      if (mode === "fast") {
        model = "gemini-3.1-flash-lite";
      } else if (mode === "complex") {
        model = "gemini-3.1-pro-preview";
      }
      
      const config: any = {};
      
      if (tools && tools.includes("googleSearch")) {
        config.tools = [{ googleSearch: {} }];
      } else if (tools && tools.includes("googleMaps")) {
        config.tools = [{ googleMaps: {} }];
      }
      
      const response = await ai.models.generateContent({
        model,
        contents: message,
        config
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/video/start", async (req, res) => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const { prompt, imageBytes, mimeType } = req.body;
      
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      };
      
      if (imageBytes && mimeType) {
        payload.image = { imageBytes, mimeType };
      }
      
      const operation = await ai.models.generateVideos(payload);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/video/status", async (req, res) => {
    try {
      const { GoogleGenAI, GenerateVideosOperation } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const { operationName } = req.body;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done, response: updated.response });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/video/download", async (req, res) => {
    try {
      const { GoogleGenAI, GenerateVideosOperation } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const { operationName } = req.body;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!uri) {
         return res.status(404).json({ error: "Video URI not found" });
      }
      
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      });
      
      res.setHeader('Content-Type', 'video/mp4');
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/image", async (req, res) => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const { prompt, aspectRatio, mode } = req.body;
      let model = 'gemini-3.1-flash-image-preview';
      if (mode === 'complex') {
        model = 'gemini-3-pro-image-preview';
      }
      
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio || '1:1'
        }
      });
      
      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Image) {
        throw new Error("No image generated");
      }
      
      res.json({ imageBase64: base64Image });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
