import fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { z } from 'zod'; // Import Zod itself if not already there
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from './hooks/authHook'; // <-- Import the hook
import communityRoutes from './routes/communityRoutes';
import profileRoutes from './routes/profileRoutes';
import membershipRoutes from './routes/membershipRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment variables from .env file
dotenv.config();

// Create a Fastify instance
const server = fastify({
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

// **** ADD SCHEMA COMPILERS (Recommended) ****
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
// ******************************************

// Register CORS plugin
server.register(cors, {
  origin: true,
  credentials: true,
});

// Register Auth Hook
server.addHook('preHandler', authenticate);

// *** REGISTER API ROUTES ***
server.register(communityRoutes, { prefix: '/api/v1' });
server.register(profileRoutes, { prefix: '/api/v1' });
server.register(membershipRoutes, { prefix: '/api/v1' });
server.register(postRoutes, { prefix: '/api/v1' });
server.register(commentRoutes, { prefix: '/api/v1' });
server.register(adminRoutes, { prefix: '/api/v1' });
// ***************************

// --- Your Routes Will Go Here Later ---
server.get('/', async (request, reply) => {
    // Example of accessing user info (will be null if no valid token)
    const userId = request.user?.id;
    server.log.info(`Root route called by user: ${userId || 'Guest'}`);
  return { message: 'Hello from Real.me Backend!', user: userId || 'Guest' };
});
// ------------------------------------


// Define a function to start the server
const start = async () => {
  // Import Supabase client *here* to ensure it initializes when server starts
  // (This will trigger the console.log inside supabaseClient.ts)
  try {
    await import('./lib/supabaseClient');
  } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      process.exit(1);
  }

  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await server.listen({ port: port, host: '0.0.0.0' });
    // server.log.info removed as Fastify logger already prints listen messages
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();