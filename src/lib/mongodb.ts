import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
    lastFailureTime: 0,
  };
}

// 60-second cool-down if connection fails (prevents freezing the server with repeated 30s timeouts)
const FAILURE_COOLDOWN_MS = 60 * 1000;

export function isMongoDbConfigured(): boolean {
  const uri = process.env.MONGODB_URI?.trim();
  return Boolean(uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')));
}

export function resetMongoCooldown(): void {
  if (cached) {
    cached.lastFailureTime = 0;
    cached.promise = null;
  }
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!isMongoDbConfigured()) {
    return null;
  }

  // If already connected, return cached connection immediately
  if (cached?.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If we had a recent failure, avoid waiting and block-retrying on every request
  const now = Date.now();
  if (cached?.lastFailureTime && now - cached.lastFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  const uri = process.env.MONGODB_URI!.trim();

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 2500, // Fast 2.5s timeout instead of hanging 30s
        connectTimeoutMS: 2500,
      })
      .then((m) => {
        cached!.lastFailureTime = 0;
        return m;
      });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (e: unknown) {
    cached!.promise = null;
    cached!.lastFailureTime = Date.now();
    const errMsg = e instanceof Error ? e.message : String(e);
    console.warn(`[MongoDB Notice] Cannot reach Atlas cluster (IP whitelist required). Serving via fast local cache. Error: ${errMsg.slice(0, 120)}...`);
    return null;
  }
}
