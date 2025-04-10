import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

const createCommunitySchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().optional(),
});
const updateCommunitySchema = createCommunitySchema.partial();
const communityParamsSchema = z.object({ communityId: z.string() });

// Pagination Schema for GET /communities
const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10), // Default limit 10, max 50
  offset: z.coerce.number().int().min(0).default(0),        // Default offset 0
});

type CommunityParams = z.infer<typeof communityParamsSchema>;
type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
type PaginationQuery = z.infer<typeof paginationQuerySchema>;

async function communityRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // GET /communities - List communities with pagination and recent posts
  server.get<{ Querystring: PaginationQuery }>('/communities', {
    schema: { querystring: paginationQuerySchema }, // Validate query params
  }, async (request: FastifyRequest<{ Querystring: PaginationQuery }>, reply) => {
    const { limit, offset } = request.query;

    try {
      // Fetch paginated communities
      const { data: communitiesData, error: communitiesError, count } = await supabaseAdmin
        .from('communities')
        .select('id, name, description', { count: 'exact' }) // Get total count
        .order('created_at', { ascending: false }) // Order by creation date, newest first
        .range(offset, offset + limit - 1);

      if (communitiesError) throw communitiesError;
      if (!communitiesData) throw new Error('No community data returned');

      // Fetch recent posts for each community
      const communitiesWithPosts = await Promise.all(
        communitiesData.map(async (community) => {
          const { data: postsData, error: postsError } = await supabaseAdmin
            .from('posts')
            .select('id, content, created_at')
            .eq('community_id', community.id)
            .order('created_at', { ascending: false })
            .limit(3);

          if (postsError) {
            request.log.error({ error: postsError, communityId: community.id }, 'Error fetching posts for community');
            // Continue without posts for this community if there's an error
            return { ...community, recentPosts: [] }; 
          }
          return { ...community, recentPosts: postsData || [] };
        })
      );

      // Send response with communities and total count
      reply.send({ 
        items: communitiesWithPosts, 
        totalCount: count ?? 0 
      });

    } catch (error) {
      request.log.error({ error }, 'Error fetching communities or posts');
      return reply.status(500).send({ error: 'Failed to fetch communities' });
    }
  });

  server.post<{ Body: CreateCommunityInput }>(
    '/communities',
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

  server.get<{ Params: CommunityParams }>('/communities/:communityId', {
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

  server.patch<{ Params: CommunityParams; Body: UpdateCommunityInput }>('/communities/:communityId', {
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

  server.delete<{ Params: CommunityParams }>('/communities/:communityId', {
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
