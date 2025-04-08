import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

const createCommunitySchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().optional(),
});
const updateCommunitySchema = createCommunitySchema.partial();
const communityParamsSchema = z.object({ communityId: z.string() });

type CommunityParams = z.infer<typeof communityParamsSchema>;
type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;

async function communityRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  server.get('/api/v1/communities', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('*')
      .limit(100);

    if (error) {
      request.log.error({ error }, 'Error fetching communities');
      return reply.status(500).send({ error: 'Failed to fetch communities' });
    }
    reply.send(data);
  });

  server.post<{ Body: CreateCommunityInput }>(
    '/api/v1/communities',
    { schema: { body: createCommunitySchema } },
    async (request, reply) => {
      if (!request.user?.id || !request.token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const { name, description } = request.body;
      const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
        global: { headers: { Authorization: `Bearer ${request.token}` } },
      });
      const { data, error } = await supabaseUserClient
        .from('communities')
        .insert({ name, description, owner_id: request.user.id })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return reply.status(409).send({ error: 'Community name already exists.' });
        }
        if (error.code === '42501') {
          return reply.status(403).send({ error: 'Permission denied' });
        }
        return reply.status(500).send({ error: 'Failed to create community' });
      }
      reply.status(201).send(data);
    }
  );

  server.get<{ Params: CommunityParams }>('/api/v1/communities/:communityId', {
    schema: { params: communityParamsSchema },
  }, async (request, reply) => {
    const { communityId } = request.params;
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return reply.status(404).send({ error: 'Community not found.' });
      }
      return reply.status(500).send({ error: 'Failed to fetch community' });
    }
    reply.send(data);
  });

  server.patch<{ Params: CommunityParams; Body: UpdateCommunityInput }>('/api/v1/communities/:communityId', {
    schema: { params: communityParamsSchema, body: updateCommunitySchema },
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { communityId } = request.params;
    const updates = request.body;
    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });
    const { data, error } = await supabaseUserClient
      .from('communities')
      .update(updates)
      .eq('id', communityId)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        return reply.status(403).send({ error: 'Permission denied' });
      }
      if (error.code === 'PGRST116') {
        return reply.status(404).send({ error: 'Not found or no access' });
      }
      return reply.status(500).send({ error: 'Failed to update community' });
    }
    reply.send(data);
  });

  server.delete<{ Params: CommunityParams }>('/api/v1/communities/:communityId', {
    schema: { params: communityParamsSchema },
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { communityId } = request.params;
    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });
    const { error, count } = await supabaseUserClient
      .from('communities')
      .delete()
      .eq('id', communityId);

    if (error) {
      if (error.code === '42501') {
        return reply.status(403).send({ error: 'Permission denied' });
      }
      if (error.code === '23503') {
        return reply.status(409).send({ error: 'Related data exists' });
      }
      return reply.status(500).send({ error: 'Failed to delete community' });
    }
    if (count === 0) {
      return reply.status(404).send({ error: 'Community not found or not deleted' });
    }
    reply.status(204).send();
  });
}

export default communityRoutes;
