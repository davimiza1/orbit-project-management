import 'dotenv/config';
import { z } from 'zod';
const schema=z.object({PORT:z.coerce.number().default(5000),MONGODB_URI:z.string().default('mongodb://127.0.0.1:27017/orbit'),JWT_SECRET:z.string().default('development-only-secret-change-me'),CLIENT_URL:z.string().default('http://localhost:5173')});
export const config=schema.parse(process.env);
