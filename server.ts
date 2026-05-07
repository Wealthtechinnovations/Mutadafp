import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  // Immediate health check for Cloud Run
  app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });

  // Middleware
  app.use(express.json());
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));
  app.use(morgan("dev"));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Collectif Victimes API is running" });
  });

  app.use("/api/auth", (await import("./server/routes/auth.js")).default);
  app.use("/api/dossiers", (await import("./server/routes/dossiers.js")).default);
  app.use("/api/documents", (await import("./server/routes/documents.js")).default);
  app.use("/api/admin", (await import("./server/routes/admin.js")).default);
  app.use("/api/messages", (await import("./server/routes/messages.js")).default);
  app.use("/api/notifications", (await import("./server/routes/notifications.js")).default);
  app.use("/api/public", (await import("./server/routes/public.js")).default);


  // SEO Routes
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tableau-de-bord/");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${process.env.APP_URL || 'http://localhost:3000'}/</loc><priority>1.0</priority></url>
  <url><loc>${process.env.APP_URL || 'http://localhost:3000'}/a-propos</loc><priority>0.8</priority></url>
  <url><loc>${process.env.APP_URL || 'http://localhost:3000'}/historique</loc><priority>0.8</priority></url>
  <url><loc>${process.env.APP_URL || 'http://localhost:3000'}/ressources</loc><priority>0.8</priority></url>
</urlset>`);
  });



  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
