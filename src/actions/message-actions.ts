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

export async function hasUnreadMessages() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: {
      id: true,
      updatedAt: true,
      user1Id: true,
      user2Id: true,
      user1ReadAt: true,
      user2ReadAt: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { senderId: true, createdAt: true } },
    },
  });

  return conversations.some((c) => {
    const isUser1 = c.user1Id === userId;
    const readAt = isUser1 ? c.user1ReadAt : c.user2ReadAt;
    const lastMsgTime = c.messages[0]?.createdAt;
    if (!lastMsgTime) return false;
    if (!readAt) return c.messages[0]?.senderId !== userId; // Never read, unread if last msg from other
    return new Date(lastMsgTime) > new Date(readAt);
  });
}

export async function markAsRead(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!convo) return;

  const isUser1 = convo.user1Id === userId;
  await prisma.conversation.update({
    where: { id: conversationId },
    data: isUser1 ? { user1ReadAt: new Date() } : { user2ReadAt: new Date() },
  });
}

export async function createConversationByName(otherName: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const other = await prisma.user.findFirst({ where: { name: otherName } });
  if (!other || other.id === userId) return null;

  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: userId, user2Id: other.id },
        { user1Id: other.id, user2Id: userId },
      ],
    },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { user1Id: userId, user2Id: other.id },
  });
}

export async function findOrCreateConversation(otherUserId: string, taskId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

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

  return prisma.conversation.create({
    data: {
      user1Id: userId,
      user2Id: otherUserId,
      taskId: taskId || null,
    },
  });
}
