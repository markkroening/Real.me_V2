import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseClient';

// Augment the FastifyRequest interface to include our custom properties
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      aud?: string;
      role?: string;
    } | null;
    token?: string | null;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  // Initialize request properties
  request.user = null;
  request.token = null;

  // Check for Authorization header
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    request.log.info('No Authorization header found');
    return;
  }

  // Parse Bearer token
  const [scheme, token] = authHeader.split(' ');
  if (scheme.toLowerCase() !== 'bearer' || !token) {
    request.log.warn('Invalid Authorization header format');
    return;
  }

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      request.log.error({ error }, 'Error verifying JWT token');
      return;
    }

    if (!user) {
      request.log.warn('No user found for token');
      return;
    }

    // Set the user and token in the request object
    request.user = {
      id: user.id,
      email: user.email || undefined,
      aud: user.aud || undefined,
      role: user.role || undefined
    };
    request.token = token;

    request.log.info({ userId: user.id }, 'User authenticated successfully');
  } catch (err) {
    request.log.error({ err }, 'Unexpected error during authentication');
  }
};