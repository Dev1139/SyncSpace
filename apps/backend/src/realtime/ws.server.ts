import * as WebSocket from 'ws';
import * as Y from 'yjs';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedSocket = WebSocket & {
  userId?: string;
  role?: string;
  documentId?: string;
  workspaceId?: string;
};

export async function createWSServer(prisma: PrismaService) {
  const wss = new WebSocket.Server({
    port: 3001,
  });

  console.log('WebSocket server running on ws://localhost:3001');

  // Active collaborative documents
  const docs = new Map<string, Y.Doc>();

  // Document rooms
  const rooms = new Map<string, Set<AuthenticatedSocket>>();

  // Workspace rooms
  const workspaceRooms = new Map<string, Set<AuthenticatedSocket>>();

  // Debounced save timers
  const saveTimers = new Map<string, NodeJS.Timeout>();

  // =========================
  // HELPERS
  // =========================

  const broadcastToWorkspace = (workspaceId: string, message: unknown) => {
    const clients = workspaceRooms.get(workspaceId);

    if (!clients) return;

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  const getYDoc = (documentId: string): Y.Doc => {
    if (!docs.has(documentId)) {
      docs.set(documentId, new Y.Doc());
    }

    return docs.get(documentId)!;
  };

  const extractPlainText = (ydoc: Y.Doc): string => {
    const fragment = ydoc.getXmlFragment('content');

    return fragment.toString();
  };

  const loadDocument = async (documentId: string): Promise<Y.Doc> => {
    if (docs.has(documentId)) {
      return docs.get(documentId)!;
    }

    const doc = new Y.Doc();

    const dbDoc = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (dbDoc?.content) {
      try {
        Y.applyUpdate(doc, dbDoc.content);
      } catch (error) {
        console.error('Failed to load Yjs state:', error);
      }
    }

    docs.set(documentId, doc);

    return doc;
  };

  // =========================
  // CONNECTION
  // =========================

  wss.on('connection', (ws: AuthenticatedSocket, request) => {
    console.log('Client connected');

    // =========================
    // JWT AUTH
    // =========================

    const url = request.url || '';

    const params = new URLSearchParams(url.split('?')[1]);

    const token = params.get('token');

    if (!token) {
      ws.close();
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
      };

      ws.userId = payload.sub;

      console.log('User connected:', payload.sub);
    } catch {
      console.log('Invalid token');
      ws.close();
      return;
    }

    if (!ws.userId) {
      ws.close();
      return;
    }

    // =========================
    // MESSAGE HANDLER
    // =========================

    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString()) as {
          type: string;
          data: any;
        };

        const { type, data } = parsed;

        // =========================
        // JOIN DOCUMENT
        // =========================

        if (type === 'join-document') {
          const { documentId, workspaceId } = data;

          const document = await prisma.document.findFirst({
            where: {
              id: documentId,

              workspace: {
                members: {
                  some: {
                    userId: ws.userId,
                  },
                },
              },
            },
          });

          if (!document) {
            console.log('Access denied');

            ws.close();
            return;
          }

          const membership = await prisma.workspaceMember.findFirst({
            where: {
              userId: ws.userId,

              workspaceId,
            },
          });

          if (!membership) {
            ws.close();
            return;
          }

          // Attach socket context
          ws.role = membership.role;
          ws.documentId = documentId;
          ws.workspaceId = workspaceId;

          // Document room
          if (!rooms.has(documentId)) {
            rooms.set(documentId, new Set());
          }

          rooms.get(documentId)!.add(ws);

          // Workspace room
          if (!workspaceRooms.has(workspaceId)) {
            workspaceRooms.set(workspaceId, new Set());
          }

          workspaceRooms.get(workspaceId)!.add(ws);

          // Load Yjs doc
          const ydoc = await loadDocument(documentId);

          const state = Y.encodeStateAsUpdate(ydoc);

          ws.send(
            JSON.stringify({
              type: 'sync',
              documentId,
              update: Array.from(state),
            }),
          );

          console.log(`Joined document: ${documentId}`);
        }

        // =========================
        // AWARENESS UPDATE
        // =========================

        if (type === 'awareness-update') {
          const { documentId, update } = data;

          const clients = rooms.get(documentId);

          if (!clients) return;

          clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'awareness-update',
                  documentId,
                  update,
                }),
              );
            }
          });
        }

        // =========================
        // TITLE CHANGE
        // =========================

        if (type === 'title-change') {
          const { documentId, title, workspaceId } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'title-change',
            data: {
              documentId,
              title,
            },
          });
        }

        // =========================
        // DOCUMENT CREATED
        // =========================

        if (type === 'document-created') {
          const { workspaceId, document } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'document-created',
            data: document,
          });
        }

        // =========================
        // DOCUMENT DELETED
        // =========================

        if (type === 'document-deleted') {
          const { workspaceId, documentId } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'document-deleted',
            data: {
              documentId,
            },
          });
        }

        // =========================
        // DOCUMENT UPDATE
        // =========================

        if (type === 'doc-update') {
          const { documentId, update } = data;

          // Ensure same document
          if (ws.documentId !== documentId) {
            ws.close();
            return;
          }

          // Prevent viewers editing
          if (ws.role === 'viewer') {
            console.log('Viewer tried to edit');

            return;
          }

          const ydoc = getYDoc(documentId);

          const uint8 = new Uint8Array(update);

          // Apply update
          Y.applyUpdate(ydoc, uint8);

          // Broadcast to others
          const clients = rooms.get(documentId);

          if (clients) {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: 'doc-update',
                    documentId,
                    update,
                  }),
                );
              }
            });
          }

          // =========================
          // DEBOUNCED SAVE
          // =========================

          if (saveTimers.has(documentId)) {
            clearTimeout(saveTimers.get(documentId));
          }

          const timer = setTimeout(async () => {
            const state = Y.encodeStateAsUpdate(ydoc);

            const buffer = new Uint8Array(state);

            const plainText = extractPlainText(ydoc);

            await prisma.document.update({
              where: {
                id: documentId,
              },

              data: {
                content: buffer,

                plainText,
              },
            });

            console.log(`Saved document: ${documentId}`);
          }, 1500);

          saveTimers.set(documentId, timer);
        }
      } catch (error) {
        console.error('WS Error:', error);
      }
    });

    // =========================
    // DISCONNECT
    // =========================

    ws.on('close', () => {
      console.log('Client disconnected');

      // Remove from document rooms
      rooms.forEach((clients, documentId) => {
        clients.delete(ws);

        // Cleanup empty room
        if (clients.size === 0) {
          rooms.delete(documentId);

          docs.delete(documentId);

          if (saveTimers.has(documentId)) {
            clearTimeout(saveTimers.get(documentId));

            saveTimers.delete(documentId);
          }
        }
      });

      // Remove from workspace rooms
      workspaceRooms.forEach((clients, workspaceId) => {
        clients.delete(ws);

        if (clients.size === 0) {
          workspaceRooms.delete(workspaceId);
        }
      });
    });
  });
}
