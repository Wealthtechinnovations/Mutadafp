import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../db.js";
import { authenticate, AuthRequest, logAudit } from "../middleware/auth.js";

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload document
router.post("/upload", authenticate, upload.single("file"), async (req: AuthRequest, res) => {
  const { category } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const dossier = await prisma.dossier.findUnique({ where: { userId: req.user!.id } });
    if (!dossier) return res.status(404).json({ error: "Dossier not found" });

    const document = await prisma.document.create({
      data: {
        dossierId: dossier.id,
        category,
        fileName: file.originalname,
        fileUrl: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    // Update score
    let score = dossier.completenessScore;
    if (score < 60) score = 60; // Set to 60 if facts + documents are present

    await prisma.dossier.update({
      where: { id: dossier.id },
      data: { completenessScore: score }
    });

    await logAudit(req.user!.id, "DOCUMENT_UPLOADED", `Document ${document.id} uploaded`);

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Download document (Protected)
router.get("/download/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { dossier: true },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });

    // Check permissions: Owner or Admin
    const isOwner = document.dossier.userId === req.user!.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await logAudit(req.user!.id, "DOCUMENT_DOWNLOADED", `Document ${document.id} downloaded`);

    res.download(document.fileUrl, document.fileName);
  } catch (error) {
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
