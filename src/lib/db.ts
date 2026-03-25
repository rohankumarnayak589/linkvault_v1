"use server";

import { db } from "@/db";
import { bookmarks, folders, tags, bookmarkTags, users } from "@/db/schema";
import { eq, and, desc, asc, ilike } from "drizzle-orm";
import { auth } from "@/auth";
import type { Bookmark, Folder, SearchFilters } from "./types";
import { getCollectionIcon, getCollectionColor } from "./icon-mapper";

// Require Auth
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// Generate unique IDs
export async function generateId(): Promise<string> {
  return crypto.randomUUID();
}

// ===== BOOKMARK OPERATIONS =====

export async function getAllBookmarks(): Promise<Bookmark[]> {
  const userId = await requireAuth();
  
  // Fetch bookmarks
  const dbBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.createdAt)],
    with: {
      tags: {
        with: { tag: true },
      },
    },
  });

  // Map to frontend type
  return dbBookmarks.map((b: any) => ({
    id: b.id,
    url: b.url,
    title: b.title,
    description: b.description || "",
    favicon: b.favicon || "",
    previewImage: b.previewImage || "",
    notes: b.notes || "",
    folderId: b.folderId,
    isFavorite: b.isFavorite,
    isPinned: b.isPinned,
    isArchived: b.isArchived,
    isDeleted: b.isDeleted,
    deletedAt: b.deletedAt ? b.deletedAt.toISOString() : null,
    visitCount: b.visitCount,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    lastVisitedAt: b.lastVisitedAt ? b.lastVisitedAt.toISOString() : null,
    tags: b.tags.map((t: any) => t.tag.name),
  }));
}

export async function getBookmark(id: string): Promise<Bookmark | undefined> {
  const all = await getAllBookmarks();
  return all.find((b) => b.id === id);
}

export async function addBookmark(data: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt">): Promise<Bookmark> {
  const userId = await requireAuth();
  const newId = await generateId();

  await db.insert(bookmarks).values({
    id: newId,
    userId,
    url: data.url,
    title: data.title,
    description: data.description,
    favicon: data.favicon,
    previewImage: data.previewImage,
    notes: data.notes,
    folderId: data.folderId,
    isFavorite: data.isFavorite,
    isPinned: data.isPinned || false,
    isArchived: data.isArchived || false,
    isDeleted: false,
  });

  // Handle Tags
  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      // Find or create tag
      let tagRecord = await db.query.tags.findFirst({
        where: and(eq(tags.userId, userId), eq(tags.name, tagName)),
      });
      if (!tagRecord) {
        const tagId = await generateId();
        await db.insert(tags).values({ id: tagId, userId, name: tagName });
        tagRecord = { id: tagId, userId, name: tagName };
      }
      // Link bookmark to tag
      await db.insert(bookmarkTags).values({
        bookmarkId: newId,
        tagId: tagRecord.id,
      }).onConflictDoNothing();
    }
  }

  const result = await getBookmark(newId);
  if (!result) throw new Error("Failed to insert bookmark");
  return result;
}

export async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark | undefined> {
  const userId = await requireAuth();
  
  const updateData: any = { ...updates, updatedAt: new Date() };
  delete updateData.id;
  delete updateData.tags; // tags handled separately
  
  if (updates.deletedAt !== undefined) {
    updateData.deletedAt = updates.deletedAt ? new Date(updates.deletedAt) : null;
  }
  if (updates.lastVisitedAt !== undefined) {
    updateData.lastVisitedAt = updates.lastVisitedAt ? new Date(updates.lastVisitedAt) : null;
  }

  await db.update(bookmarks)
    .set(updateData)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));

  // Update Tags if provided
  if (updates.tags) {
    // Delete old links
    await db.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, id));
    // Insert new links
    for (const tagName of updates.tags) {
      let tagRecord = await db.query.tags.findFirst({
        where: and(eq(tags.userId, userId), eq(tags.name, tagName)),
      });
      if (!tagRecord) {
        const tagId = await generateId();
        await db.insert(tags).values({ id: tagId, userId, name: tagName });
        tagRecord = { id: tagId, userId, name: tagName };
      }
      await db.insert(bookmarkTags).values({
        bookmarkId: id,
        tagId: tagRecord.id,
      }).onConflictDoNothing();
    }
  }

  return getBookmark(id);
}

export async function deleteBookmark(id: string): Promise<void> {
  await updateBookmark(id, { isDeleted: true, deletedAt: new Date().toISOString() });
}

export async function restoreBookmark(id: string): Promise<void> {
  await updateBookmark(id, { isDeleted: false, deletedAt: null });
}

export async function permanentlyDeleteBookmark(id: string): Promise<void> {
  const userId = await requireAuth();
  await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));
}

// ===== FOLDER OPERATIONS =====

export async function getAllFolders(): Promise<Folder[]> {
  const userId = await requireAuth();
  const dbFolders = await db.query.folders.findMany({
    where: eq(folders.userId, userId),
    orderBy: [asc(folders.order)],
  });

  return dbFolders.map((f: any) => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    icon: f.icon,
    color: f.color,
    createdAt: f.createdAt.toISOString(),
    order: f.order,
  }));
}

export async function addFolder(
  name: string,
  parentId: string | null = null,
  icon?: string,
  color?: string
): Promise<Folder> {
  const userId = await requireAuth();
  const allF = await getAllFolders();
  const newId = await generateId();
  
  const folderData = {
    id: newId,
    userId,
    name,
    parentId,
    icon: icon || getCollectionIcon(name),
    color: color || getCollectionColor(name, allF.length),
    order: allF.length,
  };

  await db.insert(folders).values(folderData);
  
  return {
    ...folderData,
    createdAt: new Date().toISOString(),
  };
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | undefined> {
  const userId = await requireAuth();
  const updateData: any = { ...updates };
  delete updateData.id;
  delete updateData.createdAt;

  if (updates.name && !updates.icon) {
    updateData.icon = getCollectionIcon(updates.name);
  }

  await db.update(folders)
    .set(updateData)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)));

  const allF = await getAllFolders();
  return allF.find(f => f.id === id);
}

export async function deleteFolder(id: string): Promise<void> {
  const userId = await requireAuth();
  
  // Postgres foreign key `onDelete: "set null"` automatically unlinks bookmarks
  // BUT we need to delete child folders recursively. Since we don't have deep nesting right now, 1 level is fine:
  const subFolders = await db.query.folders.findMany({
    where: and(eq(folders.parentId, id), eq(folders.userId, userId))
  });
  
  for (const sub of subFolders) {
    await db.delete(folders).where(eq(folders.id, sub.id));
  }
  
  await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
}

// ===== BULK OPERATIONS =====

export async function seedSampleData(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  
  const existing = await getAllBookmarks();
  if (existing.length > 0) return;

  const devFolder = await addFolder("Development", null, "💻", "#DBEAFE");
  const designFolder = await addFolder("Design Resources", null, "🎨", "#FCE7F3");
  const frontendFolder = await addFolder("Frontend", devFolder.id, "⚛️", "#CCFBF1");

  const sampleBookmarks: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt">[] = [
    { url: "https://github.com", title: "GitHub", description: "Where the world builds software.", favicon: "https://github.githubassets.com/favicons/favicon.svg", previewImage: "", tags: ["development", "git"], folderId: devFolder.id, notes: "", isFavorite: true, isPinned: false, isArchived: false, isDeleted: false, deletedAt: null },
    { url: "https://react.dev", title: "React", description: "The library for web and native user interfaces.", favicon: "https://react.dev/favicon-32x32.png", previewImage: "", tags: ["react", "javascript"], folderId: frontendFolder.id, notes: "", isFavorite: true, isPinned: false, isArchived: false, isDeleted: false, deletedAt: null },
    { url: "https://dribbble.com", title: "Dribbble", description: "Discover the World's Top Designers.", favicon: "https://cdn.dribbble.com/assets/favicon.ico", previewImage: "", tags: ["design", "ui"], folderId: designFolder.id, notes: "", isFavorite: false, isPinned: false, isArchived: false, isDeleted: false, deletedAt: null },
  ];

  for (const b of sampleBookmarks) {
    await addBookmark(b);
  }
}
