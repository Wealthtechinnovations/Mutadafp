import express from "express";
import prisma from "../db.js";
import { authenticate, AuthRequest, logAudit } from "../middleware/auth.js";

const router = express.Router();

// Get current user's dossier
router.get("/my-dossier", authenticate, async (req: AuthRequest, res) => {
  try {
    const dossier = await prisma.dossier.findUnique({
      where: { userId: req.user!.id },
      include: {
        timelineEvents: true,
        documents: true,
        statusHistory: true,
      },
    });

    if (!dossier) {
      // Create a draft if it doesn't exist
      const newDossier = await prisma.dossier.create({
        data: { userId: req.user!.id },
        include: { timelineEvents: true, documents: true, statusHistory: true },
      });
      return res.json(newDossier);
    }

    res.json(dossier);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dossier" });
  }
});

// Update dossier facts
router.patch("/update-facts", authenticate, async (req: AuthRequest, res) => {
  const { facts, totalAmount } = req.body;
  try {
    const dossier = await prisma.dossier.findUnique({ 
      where: { userId: req.user!.id },
      include: { documents: true }
    });
    if (!dossier) return res.status(404).json({ error: "Dossier not found" });

    let score = 0;
    if (facts) score += 30;
    if (dossier.documents.length > 0) score += 30;
    if (totalAmount > 0) score += 10;

    const updatedDossier = await prisma.dossier.update({
      where: { userId: req.user!.id },
      data: { facts, totalAmount, completenessScore: score },
    });
    res.json(updatedDossier);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Add timeline event
router.post("/timeline", authenticate, async (req: AuthRequest, res) => {
  const { date, type, description, amount } = req.body;
  try {
    const dossier = await prisma.dossier.findUnique({ where: { userId: req.user!.id } });
    if (!dossier) return res.status(404).json({ error: "Dossier not found" });

    const event = await prisma.timelineEvent.create({
      data: {
        dossierId: dossier.id,
        date: new Date(date),
        type,
        description,
        amount,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to add event" });
  }
});

// Submit dossier
router.post("/submit", authenticate, async (req: AuthRequest, res) => {
  try {
    const dossier = await prisma.dossier.findUnique({ where: { userId: req.user!.id } });
    if (!dossier) return res.status(404).json({ error: "Dossier not found" });

    const updatedDossier = await prisma.dossier.update({
      where: { id: dossier.id },
      data: {
        status: "SOUMIS",
        submittedAt: new Date(),
        completenessScore: 80,
      },
    });

    await prisma.statusHistory.create({
      data: {
        dossierId: dossier.id,
        oldStatus: "BROUILLON",
        newStatus: "SOUMIS",
        changedById: req.user!.id,
      },
    });

    await logAudit(req.user!.id, "DOSSIER_SUBMITTED", `Dossier ${dossier.id} submitted`);

    // Send automated message from Super Admin
    try {
      const fullUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
      const superAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" }
      });

      if (superAdmin && fullUser) {
        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              { participants: { some: { userId: fullUser.id } } },
              { participants: { some: { userId: superAdmin.id } } }
            ]
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              participants: {
                create: [
                  { userId: fullUser.id },
                  { userId: superAdmin.id }
                ]
              }
            }
          });
        }

        // Send acknowledgment message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: superAdmin.id,
            content: `Bonjour ${fullUser.firstName}, nous avons bien reçu votre dossier de déclaration de victime. Nos administrateurs vont l'étudier dans les plus brefs délais. Vous recevrez une notification dès qu'une mise à jour sera effectuée. Vous pouvez répondre à ce message si vous avez des questions complémentaires.`
          }
        });

        // Also send a notification
        await prisma.notification.create({
          data: {
            userId: fullUser.id,
            title: "Dossier reçu",
            message: "Votre dossier a été soumis avec succès. Un message de confirmation vous a été envoyé.",
            type: "SUCCESS"
          }
        });
      }
    } catch (msgError) {
      console.error("Failed to send automated message:", msgError);
      // Don't fail the whole submission if message fails
    }

    res.json(updatedDossier);
  } catch (error) {
    res.status(500).json({ error: "Submission failed" });
  }
});

export default router;
