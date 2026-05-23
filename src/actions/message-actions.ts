"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  return prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      task: { select: { id: true, title: true } },
      user1: { select: { id: true, name: true } },
      user2: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Update conversation's updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      conversationId,
    },
    include: { sender: { select: { id: true, name: true } } },
  });
}

export async function findOrCreateConversation(otherUserId: string, taskId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Find existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: userId },
      ],
      ...(taskId ? { taskId } : {}),
    },
  });

  if (existing) return existing;

  // Create new
  return prisma.conversation.create({
    data: {
      user1Id: userId,
      user2Id: otherUserId,
      taskId: taskId || null,
    },
  });
}
