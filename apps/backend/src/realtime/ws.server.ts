import * as WebSocket from 'ws';
import * as Y from 'yjs';
import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/require-await
export async function createWSServer(prisma: PrismaService) {
  const wss = new WebSocket.Server({ port: 3001 });

  console.log('WebSocket server running on ws://localhost:3001');

  const docs = new Map<string, Y.Doc>();
  const rooms = new Map<string, Set<WebSocket>>();
  const saveTimers = new Map<string, NodeJS.Timeout>();

  // get or create doc
  const getYDoc = (documentId: string): Y.Doc => {
    if (!docs.has(documentId)) {
      docs.set(documentId, new Y.Doc());
    }
    return docs.get(documentId)!;
  };

  //  extract plain text
  const extractPlainText = (ydoc: Y.Doc): string => {
    const fragment = ydoc.getXmlFragment('content');

    // convert XML → string
    return fragment.toString();
  };

  // load from DB
  const loadDocument = async (documentId: string): Promise<Y.Doc> => {
    if (docs.has(documentId)) return docs.get(documentId)!;

    const doc = new Y.Doc();

    const dbDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (dbDoc?.content) {
      try {
        Y.applyUpdate(doc, dbDoc.content);
      } catch (e) {
        console.error('Failed to load Yjs state:', e);
      }
    }

    docs.set(documentId, doc);
    return doc;
  };

  //  CONNECTION
  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        const { type, data } = parsed;

        // JOIN DOCUMENT
        if (type === 'join-document') {
          const documentId = data;

          if (!rooms.has(documentId)) {
            rooms.set(documentId, new Set());
          }

          rooms.get(documentId)!.add(ws);

          const ydoc = await loadDocument(documentId);

          const state = Y.encodeStateAsUpdate(ydoc);

          ws.send(
            JSON.stringify({
              type: 'sync',
              update: Array.from(state),
            }),
          );

          console.log(`Joined document: ${documentId}`);
        }

        // AWARENESS UPDATE
        if (type === 'awareness-update') {
          const { documentId, update } = data;

          const clients = rooms.get(documentId);

          if (clients) {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: 'awareness-update',
                    update,
                  }),
                );
              }
            });
          }
        }
        // 🔥 TITLE CHANGE (FIXED)
        if (type === 'title-change') {
          const { documentId, title } = data;

          console.log('TITLE UPDATE RECEIVED:', title);

          const clients = rooms.get(documentId);

          if (clients) {
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: 'title-change',
                    data: {
                      documentId,
                      title,
                    },
                  }),
                );
              }
            });
          }
        }
        //  DOCUMENT UPDATE
        if (type === 'doc-update') {
          console.log('UPDATE RECEIVED:', data);
          const { documentId, update } = data;

          const ydoc = getYDoc(documentId);

          const uint8 = new Uint8Array(update);

          // apply update
          Y.applyUpdate(ydoc, uint8);

          // broadcast to others
          const clients = rooms.get(documentId);
          if (clients) {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: 'doc-update',
                    update,
                  }),
                );
              }
            });
          }

          // DEBOUNCED SAVE
          if (saveTimers.has(documentId)) {
            clearTimeout(saveTimers.get(documentId)!);
          }

          const timer = setTimeout(async () => {
            const state = Y.encodeStateAsUpdate(ydoc);
            const buffer = new Uint8Array(state);

            const plainText = extractPlainText(ydoc);

            await prisma.document.update({
              where: { id: documentId },
              data: {
                content: buffer,
                plainText,
              },
            });

            console.log(`Saved document: ${documentId}`);
          }, 1500);

          saveTimers.set(documentId, timer);
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');

      rooms.forEach((clients) => {
        clients.delete(ws);
      });
    });
  });
}
