import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// neon-serverless carries queries over WebSockets, which enables interactive
// `db.transaction()` — required for the atomic multi-line insert (orders +
// N×order_items) in the checkout server action (ADR 0009).
//
// In Node.js v21 and earlier there is no global WebSocket, so we supply one.
// Node 22+ ships a global WebSocket, but assigning `ws` here is harmless (the
// driver simply uses what it's given) and keeps us portable across runtimes.
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });

export const db = drizzle(pool, { schema });
