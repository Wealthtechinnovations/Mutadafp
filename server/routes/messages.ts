import express from "express";
import prisma from "../db.js";
import { authenticate, AuthRequest, authorize } from "../middleware/auth.js";

const router = express.Router();

// Send conversation request
router.post("/requests", authenticate, async (req: AuthRequest, res) => {
  const { receiverId, message } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.canMessage && user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à envoyer des messages. Veuillez contacter l'administration." });
    }

    const request = await prisma.conversationRequest.create({
      data: {
        senderId: req.user!.id,
        receiverId,
        message,
      },
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to send request" });
  }
});

// Accept request and create conversation
router.post("/requests/:id/accept", authenticate, async (req: AuthRequest, res) => {
  try {
    const request = await prisma.conversationRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request || request.receiverId !== req.user!.id) {
      return res.status(404).json({ error: "Request not found" });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: request.senderId },
            { userId: request.receiverId },
          ],
        },
      },
    });

    await prisma.conversationRequest.update({
      where: { id: request.id },
      data: { status: "ACCEPTED" },
    });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// Get conversations
router.get("/conversations", authenticate, async (req: AuthRequest, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: req.user!.id } },
      },
      include: {
        participants: { include: { user: { select: { firstName: true, lastName: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
router.get("/conversations/:id/messages", authenticate, async (req: AuthRequest, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        participants: { some: { userId: req.user!.id } },
      },
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { firstName: true, lastName: true, role: true } } },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message in conversation
router.post("/conversations/:id/messages", authenticate, async (req: AuthRequest, res) => {
  const { content } = req.body;
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.id,
        participants: { some: { userId: req.user!.id } },
      },
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user!.id,
        content,
      },
      include: { sender: { select: { firstName: true, lastName: true, role: true } } },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Start or get conversation with Super Admin
router.post("/admin-conversation", authenticate, async (req: AuthRequest, res) => {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" }
    });

    if (!superAdmin) {
      return res.status(404).json({ error: "Super Admin not found" });
    }

    if (superAdmin.id === req.user!.id) {
      return res.status(400).json({ error: "You are the Super Admin" });
    }

    // Find existing 1-on-1 conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: req.user!.id } } },
          { participants: { some: { userId: superAdmin.id } } },
          { participants: { every: { userId: { in: [req.user!.id, superAdmin.id] } } } }
        ]
      },
      include: {
        participants: { include: { user: { select: { firstName: true, lastName: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user!.id },
              { userId: superAdmin.id },
            ]
          }
        },
        include: {
          participants: { include: { user: { select: { firstName: true, lastName: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        }
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to start conversation with admin" });
  }
});

// Start or get conversation with a specific user (for Admin)
router.post("/user-conversation/:userId", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req: AuthRequest, res) => {
  const { userId } = req.params;
  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Find existing 1-on-1 conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: req.user!.id } } },
          { participants: { some: { userId: userId } } },
          { participants: { every: { userId: { in: [req.user!.id, userId] } } } }
        ]
      },
      include: {
        participants: { include: { user: { select: { firstName: true, lastName: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user!.id },
              { userId: userId },
            ]
          }
        },
        include: {
          participants: { include: { user: { select: { firstName: true, lastName: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        }
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to start conversation with user" });
  }
});

export default router;
