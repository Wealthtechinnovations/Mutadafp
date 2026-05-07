import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Get all published blog posts
router.get("/blog", async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { firstName: true, lastName: true } }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get single blog post by slug
router.get("/blog/:slug", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { select: { firstName: true, lastName: true } }
      }
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Get all published resources
router.get("/resources", async (req, res) => {
  try {
    const resources = await prisma.blogPost.findMany({
      where: { category: "RESSOURCE", published: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

export default router;
