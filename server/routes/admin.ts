import express from "express";
import prisma from "../db.js";
import { authenticate, AuthRequest, authorize, logAudit } from "../middleware/auth.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const totalDossiers = await prisma.dossier.count();
    const pendingDossiers = await prisma.dossier.count({ where: { status: "SOUMIS" } });
    const validatedDossiers = await prisma.dossier.count({ where: { status: "COMPLET" } });
    const incompleteDossiers = await prisma.dossier.count({ where: { status: "PIECES_MANQUANTES" } });
    const totalUsers = await prisma.user.count();
    const totalDocuments = await prisma.document.count();
    const totalLogs = await prisma.auditLog.count();

    res.json({ 
      totalDossiers, 
      pendingDossiers, 
      validatedDossiers,
      incompleteDossiers,
      totalUsers, 
      totalDocuments, 
      totalLogs 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// List all dossiers
router.get("/dossiers", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const dossiers = await prisma.dossier.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, country: true },
        },
        documents: true,
        timelineEvents: true,
      },
    });
    res.json(dossiers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dossiers" });
  }
});

// Update dossier status
router.patch("/dossiers/:id/status", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  const { status, comment } = req.body;
  try {
    const oldDossier = await prisma.dossier.findUnique({ where: { id: req.params.id } });
    if (!oldDossier) return res.status(404).json({ error: "Dossier not found" });

    let completenessScore = oldDossier.completenessScore;
    if (status === "COMPLET") completenessScore = 100;
    if (status === "SOUMIS") completenessScore = 80;
    if (status === "PIECES_MANQUANTES") completenessScore = 50;
    if (status === "EN_REVUE") completenessScore = 90;

    const dossier = await prisma.dossier.update({
      where: { id: req.params.id },
      data: { status, completenessScore },
      include: { user: true }
    });

    await prisma.statusHistory.create({
      data: {
        dossierId: dossier.id,
        oldStatus: oldDossier.status,
        newStatus: status,
        comment,
        changedById: req.user!.id,
      },
    });

    // Send internal message to user about status update
    try {
      const adminId = req.user!.id;
      const userId = dossier.userId;

      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: adminId } } },
            { participants: { some: { userId: userId } } },
            { participants: { every: { userId: { in: [adminId, userId] } } } }
          ]
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: adminId },
                { userId: userId },
              ]
            }
          }
        });
      }

      const statusLabels: Record<string, string> = {
        "BROUILLON": "Brouillon",
        "SOUMIS": "Soumis",
        "EN_REVUE": "En cours de revue",
        "PIECES_MANQUANTES": "Pièces manquantes",
        "COMPLET": "Complet / Validé",
        "TRANSMIS_AU_COLLECTIF": "Transmis au collectif",
        "ARCHIVE": "Archivé"
      };

      const messageContent = `[SYSTEME: MISE À JOUR DE DOSSIER]\n\nVotre dossier a changé de statut : **${statusLabels[oldDossier.status] || oldDossier.status}** ➔ **${statusLabels[status] || status}**.\n\n${comment ? `Commentaire de l'administrateur : "${comment}"` : "Aucun commentaire supplémentaire."}\n\nVous pouvez consulter les détails dans votre tableau de bord.`;

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: adminId,
          content: messageContent,
        }
      });

      // Also send a notification
      await prisma.notification.create({
        data: {
          userId: userId,
          title: "Mise à jour de votre dossier",
          message: `Le statut de votre dossier est passé à "${statusLabels[status] || status}".`,
          type: status === "COMPLET" ? "SUCCESS" : (status === "PIECES_MANQUANTES" ? "WARNING" : "INFO")
        }
      });
    } catch (msgError) {
      console.error("Failed to send status update message:", msgError);
    }

    res.json(dossier);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// List all users
router.get("/users", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        dossier: {
          include: {
            documents: true,
            timelineEvents: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Block/Unblock user
router.patch("/users/:id/toggle-block", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isBlocked: !user.isBlocked },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: updatedUser.isBlocked ? "Compte suspendu" : "Compte réactivé",
        message: updatedUser.isBlocked 
          ? "Votre compte a été suspendu par l'administration. Veuillez contacter le support pour plus d'informations."
          : "Votre compte a été réactivé. Vous pouvez à nouveau accéder à toutes les fonctionnalités.",
        type: updatedUser.isBlocked ? "WARNING" : "SUCCESS"
      }
    });

    await logAudit(req.user!.id, updatedUser.isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED", `User ${user.email} status changed`);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Toggle messaging permission
router.patch("/users/:id/toggle-messaging", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { canMessage: !user.canMessage },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: updatedUser.canMessage ? "Messagerie activée" : "Messagerie désactivée",
        message: updatedUser.canMessage 
          ? "L'administration a activé vos droits de messagerie. Vous pouvez maintenant envoyer des messages."
          : "Vos droits de messagerie ont été suspendus par l'administration.",
        type: updatedUser.canMessage ? "SUCCESS" : "WARNING"
      }
    });

    await logAudit(req.user!.id, updatedUser.canMessage ? "MESSAGING_ENABLED" : "MESSAGING_DISABLED", `User ${user.email} messaging permission changed`);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update messaging permission" });
  }
});

// Broadcast message to all users
router.post("/broadcast", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  const { title, message } = req.body;
  const adminId = req.user!.id;
  try {
    // Get all users except the sender
    const users = await prisma.user.findMany({ 
      where: { 
        id: { not: adminId } 
      } 
    });
    
    if (users.length === 0) {
      return res.json({ message: "No users to broadcast to" });
    }

    // 1. Create Notifications
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type: "MESSAGE",
    }));
    await prisma.notification.createMany({ data: notifications });

    // 2. Create/Find Conversations and Send Messages
    for (const user of users) {
      // Find a 1-on-1 conversation between admin and user
      // We look for a conversation that has EXACTLY these two participants
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: adminId } } },
            { participants: { some: { userId: user.id } } },
            { participants: { every: { userId: { in: [adminId, user.id] } } } }
          ]
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: adminId },
                { userId: user.id },
              ]
            }
          }
        });
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: adminId,
          content: `[DIFFUSION: ${title}]\n\n${message}`,
        }
      });
    }

    await logAudit(adminId, "BROADCAST_SENT", `Broadcast: ${title} sent to ${users.length} users`);
    res.json({ message: `Broadcast sent successfully to ${users.length} users` });
  } catch (error) {
    console.error("Broadcast Error:", error);
    res.status(500).json({ error: "Failed to send broadcast", details: error instanceof Error ? error.message : String(error) });
  }
});

// Manage Blog Posts
router.post("/blog", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  const { title, content, excerpt, category, published, sourceUrl } = req.body;
  const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt,
        category,
        published,
        sourceUrl,
        slug,
        authorId: req.user!.id,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.get("/blog", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.delete("/blog/:id", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// Manage Resources (ContentPage)
router.post("/resources", authenticate, authorize(["SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  const { title, content, slug } = req.body;
  try {
    const page = await prisma.contentPage.upsert({
      where: { slug },
      update: { title, content },
      create: { title, content, slug },
    });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resource" });
  }
});

// Get all documents
router.get("/documents", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        dossier: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Audit logs
router.get("/audit-logs", authenticate, authorize(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
