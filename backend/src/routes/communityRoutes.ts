import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

console.log('[Init] communityRoutes loaded');

const createCommunitySchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().optional(),
});
const updateCommunitySchema = createCommunitySchema.partial();
const communityParamsSchema = z.object({ communityId: z.string() });

// Pagination and Search Schema for GET /communities
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(), // Add optional search string
});

type CommunityParams = z.infer<typeof communityParamsSchema>;
type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
type ListQuery = z.infer<typeof listQuerySchema>;

async function communityRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // GET /communities - List communities with pagination, filtering, search, and recent posts
  server.get<{ Querystring: ListQuery }>('/communities', {
    schema: { querystring: listQuerySchema }, // Use updated schema
  }, async (request: FastifyRequest<{ Querystring: ListQuery }>, reply) => {
    const { limit, offset, search } = request.query; // Get search term
    const userId = request.user?.id;

    try {
      let query = supabaseAdmin
        .from('communities')
        // Select fields needed (including description for search)
        .select('id, name, description, created_at', { count: 'exact' });

      // --- Search Filter --- 
      if (search) {
        // Apply search filter on name OR description
        const searchTerm = `%${search}%`; // Prepare pattern for ilike
        query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }
      // --- End Search Filter ---
        
      // --- Ownership/Membership Filtering Logic ---
      if (userId) {
        // Filter out communities where the user is the owner
        query = query.neq('owner_id', userId);
        request.log.info({ userId }, `Applied owner filter.`);

        // Filter out communities where the user is already a member
        const { data: membershipData, error: membershipError } = await supabaseAdmin
            .from('memberships')
            .select('community_id')
            .eq('profile_id', userId);

        if (membershipError) {
            request.log.error({ error: membershipError, userId }, 'Failed to fetch user memberships for filtering');
        } else if (membershipData && membershipData.length > 0) {
            const memberCommunityIds = membershipData.map(m => m.community_id);
            request.log.info({ userId, memberCommunityIds }, `Applying membership filter. User is member of ${memberCommunityIds.length} communities.`);
            query = query.not('id', 'in', `(${memberCommunityIds.join(',')})`);
        } else {
             request.log.info({ userId }, `User is member of 0 communities.`);
        }
      } else {
        request.log.info(`No user ID provided, skipping owner/membership filters.`);
      }
      // --- End Filtering Logic ---

      // Add ordering and pagination AFTER all filtering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Execute the query
      request.log.info({ limit, offset, search, userId }, `Executing communities query...`);
      const { data: communitiesData, error: communitiesError, count } = await query;

      if (communitiesError) {
          request.log.error({ error: communitiesError, userId }, 'Error executing communities query');
          throw communitiesError;
      }
      request.log.info({ count, returnedCount: communitiesData?.length ?? 0, userId }, `Communities query executed.`);

      if (!communitiesData) throw new Error('No community data returned (communitiesData is null/undefined)');

      // Fetch details (posts, member count) for the filtered communities
      request.log.info({ count: communitiesData.length }, `Fetching details for ${communitiesData.length} communities...`);
      const communitiesWithDetails = await Promise.all(
        communitiesData.map(async (community) => {
          // Fetch recent posts
          const { data: postsData, error: postsError } = await supabaseAdmin
            .from('posts')
            .select('id, content, created_at') // Assuming these columns exist in posts
            .eq('community_id', community.id)
            .order('created_at', { ascending: false })
            .limit(3);

          // Fetch member count
          // !! Inefficient - N+1 query problem. Consider RPC or view later !!
          const { count: memberCount, error: countError } = await supabaseAdmin
            .from('memberships')
            .select('profile_id', { count: 'exact', head: true }) // Only need count
            .eq('community_id', community.id);
            
          if (postsError) {
            request.log.error({ error: postsError, communityId: community.id }, 'Error fetching posts for community');
          }
          if (countError) {
             request.log.error({ error: countError, communityId: community.id }, 'Error fetching member count for community');
          }

          return {
             ...community,
             member_count: countError ? 0 : memberCount ?? 0, // Add member count
             recentPosts: postsError ? [] : postsData || [],
             // Remove fields not in DB schema:
             // is_verified_only: false, 
             // is_private: false,
             // icon_url: null 
            };
        })
      );
      request.log.info(`Finished fetching details.`);

      reply.send({ 
        items: communitiesWithDetails,
        totalCount: count ?? 0 
      });

    } catch (error) {
      request.log.error({ error }, 'Error fetching communities or details');
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
