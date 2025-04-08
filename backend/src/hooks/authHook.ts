import { FastifyRequest, FastifyReply, onRequestHookHandler } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseClient'; // Import the admin client

// Define the structure of the user object we expect from Supabase getUser
// Adjust based on the actual structure returned by supabaseAdmin.auth.getUser()
interface SupabaseUser {
    id: string;
    aud: string;
    role: string;
    email?: string;
    // Add other fields returned by getUser if needed
}

// Augment the FastifyRequest interface to include our custom 'user' property
// This tells TypeScript that request.user might exist
declare module 'fastify' {
    interface FastifyRequest {
      user?: SupabaseUser | null; // User is optional
      token?: string | null;      // <-- ADDED: Store the raw token
    }
  }

  export const authenticate: onRequestHookHandler = async (request, reply) => {
    // Initialize request properties
    request.user = null;
    request.token = null; // <-- ADDED initialization

  // Check for Authorization header
  if (!request.headers.authorization) {
    // No token provided, proceed without setting user (route can decide if auth is required)
    request.log.info('No Authorization header found.');
    return;
  }

  // Attempt to parse the token
  const authHeaderParts = request.headers.authorization.split(' ');
  let token: string | null = null;

  if (authHeaderParts.length === 2 && authHeaderParts[0].toLowerCase() === 'bearer') {
    token = authHeaderParts[1];
  }

  if (!token) {
    // Header present but malformed or not Bearer token
    request.log.warn('Authorization header present but malformed or not Bearer.');
    // Optionally send 401 error *if* all routes require auth,
    // or let routes decide if request.user is null.
    // For flexibility, we'll proceed for now.
    return;
  }

  try {
    // Validate the token using Supabase admin client
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      // Token is invalid or expired
      request.log.warn(`Auth error: ${error.message}`);
      // Optionally send 401 error
      // reply.code(401).send({ error: 'Unauthorized', message: error.message });
      // return; // Stop processing if invalid token should always block
      return; // Proceed without user for now
    }

    if (data?.user) {
      // Token is valid, user retrieved successfully
      request.log.info(`Authenticated user: ${data.user.id}`);
      // Attach user info to the request object
      request.user = data.user as SupabaseUser; // Cast to our defined interface
      request.token = token; // <-- ADDED: Attach token to request
    } else {
        request.log.warn('Token processed but no user data returned.');
    }

  } catch (err) {
    request.log.error('Error during authentication hook:', err);
    // Potentially send 500 error
    // reply.code(500).send({ error: 'Internal Server Error during authentication' });
    // return;
  }
};