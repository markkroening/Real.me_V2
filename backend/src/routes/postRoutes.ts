import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

console.log('[Init] postRoutes loaded');

// Validation schemas
const createPostSchema = z.object({
  community_id: z.string().uuid({ message: "Invalid Community ID format" }),
  title: z.string().min(1).max(300),
  content: z.string().max(10000).optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().max(10000).optional(),
});

const postParamsSchema = z.object({
  postId: z.string().uuid({ message: "Invalid Post ID format" }),
});

const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20), // Default 20 for feed
  offset: z.coerce.number().int().min(0).default(0),
});

type CreatePostInput = z.infer<typeof createPostSchema>;
type UpdatePostInput = z.infer<typeof updatePostSchema>;
type PostParams = z.infer<typeof postParamsSchema>;
type PaginationQuery = z.infer<typeof paginationQuerySchema>;

async function postRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // Create a new post
  server.post<{ Body: CreatePostInput }>('/posts', {
    schema: { body: createPostSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { community_id, title, content } = request.body;
    const userId = request.user.id;

    // First verify the user is a member of the community
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('community_id', community_id)
      .eq('profile_id', userId)
      .single();

    if (membershipError || !membership) {
      return reply.status(403).send({ error: 'You must be a member of this community to post' });
    }

    // Create the post
    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { data, error } = await supabaseUserClient
      .from('posts')
      .insert({
        community_id,
        title,
        content,
        author_id: userId,
      })
      .select()
      .single();

    if (error) {
      request.log.error({ error }, 'Error creating post');
      return reply.status(500).send({ error: 'Failed to create post' });
    }

    reply.status(201).send(data);
  });

  // Get posts for a community
  server.get<{ Params: { communityId: string } }>('/communities/:communityId/posts', {
    schema: { params: z.object({ communityId: z.string().uuid() }) }
  }, async (request, reply) => {
    const { communityId } = request.params;

    request.log.info(`Fetching posts for community: ${communityId}`);

    const { data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          real_name,
          email,
          location
        )
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      request.log.error({
        error,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      }, 'Error fetching posts');
      return reply.status(500).send({ 
        error: 'Failed to fetch posts',
        details: error.message,
        code: error.code
      });
    }

    reply.send(data);
  });

  // Get a specific post
  server.get<{ Params: PostParams }>('/posts/:postId', {
    schema: { params: postParamsSchema }
  }, async (request, reply) => {
    const { postId } = request.params;
    
    request.log.info({ postId }, 'Fetching specific post');

    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          communities:community_id (id, name),
          profiles:author_id (
            id,
            real_name,
            email,
            location
          )
        `)
        .eq('id', postId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          request.log.info({ postId }, 'Post not found');
          return reply.status(404).send({ error: 'Post not found' });
        }
        request.log.error({ error, postId }, 'Error fetching specific post');
        return reply.status(500).send({ error: 'Failed to fetch post' });
      }
      
      if (!data) {
        request.log.error({ postId }, 'Post data was null/undefined despite successful query');
        return reply.status(500).send({ error: 'Failed to retrieve post data' });
      }

      // Format data for frontend to match expected structure
      const formattedPost = {
        id: data.id,
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author_id: data.author_id,
        community_id: data.community_id,
        community: {
          id: data.communities.id,
          name: data.communities.name
        },
        author: {
          id: data.profiles.id,
          real_name: data.profiles.real_name,
          email: data.profiles.email,
          location: data.profiles.location
        }
      };
      
      request.log.info({ postId }, 'Successfully fetched post');
      reply.send(formattedPost);
    } catch (err: any) {
      request.log.error({ err, postId }, 'Unexpected error fetching post');
      reply.status(500).send({ error: 'Internal server error while fetching post' });
    }
  });

  // Update a post (only by the author)
  server.patch<{ Params: PostParams; Body: UpdatePostInput }>('/posts/:postId', {
    schema: { params: postParamsSchema, body: updatePostSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { postId } = request.params;
    const updates = request.body;
    const userId = request.user.id;

    // First verify the user is the author of the post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    if (post.author_id !== userId) {
      return reply.status(403).send({ error: 'You can only edit your own posts' });
    }

    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { data, error } = await supabaseUserClient
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      request.log.error({ error }, 'Error updating post');
      return reply.status(500).send({ error: 'Failed to update post' });
    }

    reply.send(data);
  });

  // Temporary test endpoint
  server.get('/posts/test-table', async (request, reply) => {
    // First check the profiles table structure
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select()
      .limit(1);

    if (profileError) {
      request.log.error({
        error: profileError,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        message: profileError.message
      }, 'Error checking profiles table structure');
      return reply.status(500).send({ 
        error: 'Failed to check profiles table',
        details: profileError.message,
        code: profileError.code
      });
    }

    // Then try to get a sample post with author info
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          real_name,
          email,
          location,
          birth_date,
          is_verified
        )
      `)
      .limit(1);

    if (sampleError) {
      request.log.error({
        error: sampleError,
        code: sampleError.code,
        details: sampleError.details,
        hint: sampleError.hint,
        message: sampleError.message
      }, 'Error getting sample post');
      return reply.status(500).send({ 
        error: 'Failed to get sample post',
        details: sampleError.message,
        code: sampleError.code
      });
    }

    reply.send({
      tableExists: true,
      profilesColumns: profileData?.length ? Object.keys(profileData[0]) : [],
      sampleData,
      postsColumns: sampleData?.length ? Object.keys(sampleData[0]) : []
    });
  });

  // Delete a post (only by the author)
  server.delete<{ Params: PostParams }>('/posts/:postId', {
    schema: { params: postParamsSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { postId } = request.params;
    const userId = request.user.id;

    // First verify the user is the author of the post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    if (post.author_id !== userId) {
      return reply.status(403).send({ error: 'You can only delete your own posts' });
    }

    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { error } = await supabaseUserClient
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      request.log.error({ error }, 'Error deleting post');
      return reply.status(500).send({ error: 'Failed to delete post' });
    }

    reply.status(204).send();
  });

  // --- GET /feed - User's personalized feed ---
  server.get<{ Querystring: PaginationQuery }>('/feed', {
    schema: { querystring: paginationQuerySchema },
  }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { limit, offset } = request.query;

    try {
        // 1. Get IDs of communities the user is a member of
        request.log.info({ userId }, `Fetching memberships for feed...`);
        const { data: membershipData, error: membershipError } = await supabaseAdmin
            .from('memberships')
            .select('community_id')
            .eq('profile_id', userId);

        if (membershipError) {
            request.log.error({ error: membershipError, userId }, 'Failed to fetch memberships for feed');
            throw membershipError;
        }        
        const memberCommunityIds = membershipData?.map(m => m.community_id) || [];
        request.log.info({ userId, count: memberCommunityIds.length }, `User is member of ${memberCommunityIds.length} communities.`);

        if (memberCommunityIds.length === 0) {
            request.log.info({ userId }, 'No memberships found, returning empty feed.');
            return reply.send({ items: [], totalCount: 0 });
        }

        // 2. Fetch posts from those communities
        request.log.info({ userId, limit, offset, memberCommunityIds }, `Fetching posts for feed...`);
        const { data: postsData, error: postsError, count } = await supabaseAdmin
            .from('posts')
            .select(`
                id, 
                title, 
                content, 
                created_at, 
                comment_count,
                community_id, 
                author_id, 
                communities ( name, icon_url ),
                profiles:author_id ( real_name )
            `, { count: 'exact' })
            .in('community_id', memberCommunityIds)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
            
        if (postsError) {
            request.log.error({ error: postsError, userId }, 'Error executing posts query for feed');
            throw postsError;
        }
        request.log.info({ count, returnedCount: postsData?.length ?? 0, userId }, `Feed posts query executed.`);

        // 3. Format data to match PostSummary expected by frontend
        const formattedPosts = postsData?.map(p => ({
            id: p.id,
            title: p.title,
            content_snippet: p.content ? (p.content.length > 100 ? p.content.substring(0, 100) + '...' : p.content) : null,
            author: {
                id: p.author_id,
                real_name: (p.profiles as any)?.real_name ?? 'Unknown Author',
            },
            community: {
                id: p.community_id,
                name: (p.communities as any)?.name ?? 'Unknown Community',
                icon_url: (p.communities as any)?.icon_url ?? null,
            },
            comment_count: p.comment_count ?? 0,
            created_at: p.created_at,
        })) || [];
        request.log.info(`Finished formatting feed posts.`);

        reply.send({ items: formattedPosts, totalCount: count ?? 0 });

    } catch (error) {
        request.log.error({ error, userId }, 'Error fetching user feed');
        return reply.status(500).send({ error: 'Failed to fetch feed' });
    }
  });
}

export default postRoutes;