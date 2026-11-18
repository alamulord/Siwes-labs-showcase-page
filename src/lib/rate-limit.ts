import "server-only";
import { db } from "./db";
export async function rateLimit(key: string, limit: number, seconds: number) {
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const row = await db.rateLimit.upsert({ where: { key: `${key}:${bucket}` }, create: { key: `${key}:${bucket}`, count: 1, expiresAt: new Date((bucket + 1) * seconds * 1000) }, update: { count: { increment: 1 } } });
  if (row.count > limit) throw new Error("RATE_LIMITED");
}
