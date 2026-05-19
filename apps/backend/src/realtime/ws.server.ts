import * as WebSocket from 'ws';
import * as Y from 'yjs';
import * as jwt from 'jsonwebtoken';
import type { Server } from 'http';

import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedSocket = WebSocket & {
  userId?: string;
  role?: string;
  documentId?: string;
  workspaceId?: string;
};

export async function createWSServer(prisma: PrismaService, server: Server) {
  const wss = new WebSocket.Server({
    server,
    path: '/ws',
  });

  const docs = new Map<string, Y.Doc>();
  const rooms = new Map<string, Set<AuthenticatedSocket>>();
  const workspaceRooms = new Map<string, Set<AuthenticatedSocket>>();
  const saveTimers = new Map<string, NodeJS.Timeout>();

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

  wss.on('connection', (ws: AuthenticatedSocket, request) => {
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
    } catch {
      ws.close();
      return;
    }

    if (!ws.userId) {
      ws.close();
      return;
    }

    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString()) as {
          type: string;
          data: any;
        };

        const { type, data } = parsed;

        if (type === 'join-workspace') {
          const { workspaceId } = data;

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

          ws.workspaceId = workspaceId;

          if (!workspaceRooms.has(workspaceId)) {
            workspaceRooms.set(workspaceId, new Set());
          }

          workspaceRooms.get(workspaceId)!.add(ws);
        }

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

          ws.role = membership.role;
          ws.documentId = documentId;
          ws.workspaceId = workspaceId;

          if (!rooms.has(documentId)) {
            rooms.set(documentId, new Set());
          }

          rooms.get(documentId)!.add(ws);

          if (!workspaceRooms.has(workspaceId)) {
            workspaceRooms.set(workspaceId, new Set());
          }

          workspaceRooms.get(workspaceId)!.add(ws);

          const ydoc = await loadDocument(documentId);

          const state = Y.encodeStateAsUpdate(ydoc);

          ws.send(
            JSON.stringify({
              type: 'sync',
              documentId,
              update: Array.from(state),
            }),
          );
        }

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

        if (type === 'title-change') {
          const { documentId, title, workspaceId } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'title-change',
            data: {
              workspaceId,
              documentId,
              title,
            },
          });
        }

        if (type === 'document-created') {
          const { workspaceId, document } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'document-created',
            data: document,
          });
        }

        if (type === 'document-deleted') {
          const { workspaceId, documentId } = data;

          broadcastToWorkspace(workspaceId, {
            type: 'document-deleted',
            data: {
              workspaceId,
              documentId,
            },
          });
        }

        if (type === 'doc-update') {
          const { documentId, update } = data;

          if (ws.documentId !== documentId) {
            ws.close();
            return;
          }

          if (ws.role === 'viewer') {
            return;
          }

          const ydoc = getYDoc(documentId);

          const uint8 = new Uint8Array(update);

          Y.applyUpdate(ydoc, uint8);

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
          }, 1500);

          saveTimers.set(documentId, timer);
        }
      } catch (error) {
        console.error('WS Error:', error);
      }
    });

    ws.on('close', () => {
      rooms.forEach((clients, documentId) => {
        clients.delete(ws);

        if (clients.size === 0) {
          rooms.delete(documentId);

          docs.delete(documentId);

          if (saveTimers.has(documentId)) {
            clearTimeout(saveTimers.get(documentId));

            saveTimers.delete(documentId);
          }
        }
      });

      workspaceRooms.forEach((clients, workspaceId) => {
        clients.delete(ws);

        if (clients.size === 0) {
          workspaceRooms.delete(workspaceId);
        }
      });
    });
  });
}
