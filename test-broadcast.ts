import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) return console.log("No admin");
  
  const users = await prisma.user.findMany({ where: { id: { not: admin.id } } });
  console.log(`Found ${users.length} users`);
  
  try {
    const notifications = users.map(user => ({
      userId: user.id,
      title: "Test",
      message: "Test message",
      type: "MESSAGE",
    }));
    await prisma.notification.createMany({ data: notifications });
    console.log("Notifications created");
    
    for (const user of users) {
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: admin.id } } },
            { participants: { some: { userId: user.id } } },
            { participants: { every: { userId: { in: [admin.id, user.id] } } } }
          ]
        }
      });
      
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: admin.id },
                { userId: user.id },
              ]
            }
          }
        });
      }
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: admin.id,
          content: `[DIFFUSION: Test]\n\nTest message`,
        }
      });
    }
    console.log("Messages created");
  } catch (e) {
    console.error(e);
  }
}

test();
