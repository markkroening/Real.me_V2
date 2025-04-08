import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabaseClient';

console.log('[Init] membershipRoutes loaded');

const communityParamsSchema = z.object({
  communityId: z.string().uuid({ message: "Invalid Community ID format" }),
});

const memberParamsSchema = z.object({
  communityId: z.string().uuid({ message: "Invalid Community ID format" }),
  profileId: z.string().uuid({ message: "Invalid Profile ID format" }),
});

type CommunityParams = z.infer<typeof communityParamsSchema>;
type MemberParams = z.infer<typeof memberParamsSchema>;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

function createSupabaseUserClient(token: string, reqLog: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    reqLog.error("Missing Supabase URL or Anon Key environment variable for user client creation");
    throw new Error('Server configuration error: Missing Supabase credentials.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

async function membershipRoutes(server: FastifyInstance, options: FastifyPluginOptions) {

  server.post<{ Params: CommunityParams }>('/communities/:communityId/members', {
    schema: { params: communityParamsSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    const { communityId } = request.params;
    const userId = request.user.id;
    const userToken = request.token;

    request.log.info({ communityId, userId }, `User ${userId} attempting to join community ${communityId}`);

    try {
      const supabaseUserClient = createSupabaseUserClient(userToken, request.log);
      const { error } = await supabaseUserClient
        .from('memberships')
        .insert({ profile_id: userId, community_id: communityId });

      if (error) {
        request.log.error({ error }, 'Error inserting membership');
        return reply.status(500).send({ error: 'Failed to join community' });
      }

      reply.status(204).send();
    } catch (e: any) {
      request.log.error({ e }, 'Unexpected error joining community');
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.delete<{ Params: CommunityParams }>('/api/v1/communities/:communityId/members/me', {
    schema: { params: communityParamsSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    const { communityId } = request.params;
    const userId = request.user.id;
    const userToken = request.token;

    request.log.info({ communityId, userId }, `User ${userId} attempting to leave community ${communityId}`);

    try {
      const supabaseUserClient = createSupabaseUserClient(userToken, request.log);
      const { error, count } = await supabaseUserClient
        .from('memberships')
        .delete()
        .eq('profile_id', userId)
        .eq('community_id', communityId);

      if (error) {
        request.log.error({ error }, 'Error deleting membership');
        return reply.status(500).send({ error: 'Failed to leave community' });
      }

      if (count === 0) {
        return reply.status(404).send({ error: 'Membership not found' });
      }

      reply.status(204).send();
    } catch (e: any) {
      request.log.error({ e }, 'Unexpected error leaving community');
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.delete<{ Params: MemberParams }>('/api/v1/communities/:communityId/members/:profileId', {
    schema: { params: memberParamsSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    const { communityId, profileId } = request.params;
    const moderatorOrOwnerId = request.user.id;
    const userToken = request.token;

    if (moderatorOrOwnerId === profileId) {
      return reply.status(400).send({ error: 'Bad Request', message: 'You cannot remove yourself with this route.' });
    }

    request.log.info({ communityId, moderatorOrOwnerId, profileId }, `User ${moderatorOrOwnerId} attempting to remove member ${profileId} from community ${communityId}`);

    try {
      const supabaseModClient = createSupabaseUserClient(userToken, request.log);
      const { error, count } = await supabaseModClient
        .from('memberships')
        .delete()
        .eq('profile_id', profileId)
        .eq('community_id', communityId);

      if (error) {
        request.log.error({ error }, 'Error removing member');
        return reply.status(500).send({ error: 'Failed to remove member' });
      }

      if (count === 0) {
        return reply.status(404).send({ error: 'Membership not found' });
      }

      reply.status(204).send();
    } catch (e: any) {
      request.log.error({ e }, 'Unexpected error removing member');
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}

export default membershipRoutes;
