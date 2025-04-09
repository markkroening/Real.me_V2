import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseClient'; // Import Supabase client
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Validation schemas
const profileParamsSchema = z.object({
  profileId: z.string().uuid({ message: "Invalid Profile ID format" }),
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

type ProfileParams = z.infer<typeof profileParamsSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Route plugin function
async function profileRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // List public profiles
  server.get('/profiles', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('Fetching list of public profiles');

    const { data, error } = await supabaseAdmin
      .from('public_profiles')
      .select('*')
      .limit(100);

    if (error) {
      request.log.error(
        {
          msg: 'Error fetching public profiles',
          error: error, code: error?.code, details: error?.details, hint: error?.hint, message: error?.message
        },
        'Database select from view failed'
      );
      return reply.status(500).send({ error: 'Failed to fetch profiles', details: error?.message || 'Unknown error' });
    }

    reply.send(data);
  });

  // Get a specific profile by ID
  server.get<{ Params: ProfileParams }>('/profiles/:profileId', {
    schema: { params: profileParamsSchema }
  }, async (request, reply) => {
    const { profileId } = request.params;

    const { data, error } = await supabaseAdmin
      .from('public_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return reply.status(404).send({ error: 'Profile not found' });
      }
      return reply.status(500).send({ error: 'Failed to fetch profile' });
    }

    reply.send(data);
  });

  // Get current user's profile (requires auth)
  server.get('/profiles/me', async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')  // Use full profiles table, not the public view
      .select('*')
      .eq('id', request.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return reply.status(404).send({ error: 'Profile not found' });
      }
      return reply.status(500).send({ error: 'Failed to fetch profile' });
    }

    reply.send(data);
  });

  // Update current user's profile (requires auth)
  server.patch<{ Body: UpdateProfileInput }>('/profiles/me', {
    schema: { body: updateProfileSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const updates = request.body;
    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { data, error } = await supabaseUserClient
      .from('profiles')
      .update(updates)
      .eq('id', request.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return reply.status(409).send({ error: 'Username already taken' });
      }
      return reply.status(500).send({ error: 'Failed to update profile' });
    }

    reply.send(data);
  });
}

export default profileRoutes; // Export the plugin