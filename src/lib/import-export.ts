"use client";

import type { Bookmark, Folder } from "./types";

// ===== EXPORT =====

export function exportAsJSON(bookmarks: Bookmark[], folders: Folder[]): string {
  return JSON.stringify({ bookmarks, folders, exportedAt: new Date().toISOString(), version: "1.0" }, null, 2);
}

export function exportAsCSV(bookmarks: Bookmark[]): string {
  const headers = ["Title", "URL", "Description", "Tags", "Folder", "Favorite", "Created", "Notes"];
  const rows = bookmarks.map((b) => [
    `"${b.title.replace(/"/g, '""')}"`,
    b.url,
    `"${b.description.replace(/"/g, '""')}"`,
    `"${b.tags.join(", ")}"`,
    b.folderId || "",
    b.isFavorite ? "Yes" : "No",
    b.createdAt,
    `"${b.notes.replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function exportAsHTML(bookmarks: Bookmark[], folders: Folder[]): string {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file by LinkVault. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>LinkVault Bookmarks</TITLE>
<H1>LinkVault Bookmarks</H1>
<DL><p>\n`;

  const rootBookmarks = bookmarks.filter((b) => !b.folderId);
  const rootFolders = folders.filter((f) => !f.parentId);

  for (const folder of rootFolders) {
    html += renderFolderHTML(folder, folders, bookmarks, 1);
  }

  for (const b of rootBookmarks) {
    html += `    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(new Date(b.createdAt).getTime() / 1000)}">${b.title}</A>\n`;
    if (b.description) html += `    <DD>${b.description}\n`;
  }

  html += `</DL><p>\n`;
  return html;
}

function renderFolderHTML(folder: Folder, allFolders: Folder[], allBookmarks: Bookmark[], indent: number): string {
  const pad = "    ".repeat(indent);
  let html = `${pad}<DT><H3>${folder.name}</H3>\n${pad}<DL><p>\n`;

  const subFolders = allFolders.filter((f) => f.parentId === folder.id);
  for (const sub of subFolders) {
    html += renderFolderHTML(sub, allFolders, allBookmarks, indent + 1);
  }

  const folderBookmarks = allBookmarks.filter((b) => b.folderId === folder.id);
  for (const b of folderBookmarks) {
    html += `${pad}    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(new Date(b.createdAt).getTime() / 1000)}">${b.title}</A>\n`;
  }

  html += `${pad}</DL><p>\n`;
  return html;
}

// ===== IMPORT =====

export function parseHTMLBookmarks(html: string): Partial<Bookmark>[] {
  const bookmarks: Partial<Bookmark>[] = [];
  const linkRegex = /<A[^>]*HREF="([^"]*)"[^>]*>([^<]*)<\/A>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    bookmarks.push({
      url: match[1],
      title: match[2] || match[1],
      description: "",
      favicon: "",
      previewImage: "",
      tags: [],
      folderId: null,
      notes: "",
      isFavorite: false,
      isArchived: false,
    });
  }
  return bookmarks;
}

export function parseJSONBookmarks(json: string): Partial<Bookmark>[] {
  try {
    const data = JSON.parse(json);
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      return data.bookmarks;
    }
    if (Array.isArray(data)) {
      return data;
    }
  } catch {
    // ignore
  }
  return [];
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
