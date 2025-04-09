import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

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

type CreatePostInput = z.infer<typeof createPostSchema>;
type UpdatePostInput = z.infer<typeof updatePostSchema>;
type PostParams = z.infer<typeof postParamsSchema>;

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
      .eq('id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return reply.status(404).send({ error: 'Post not found' });
      }
      return reply.status(500).send({ error: 'Failed to fetch post' });
    }

    reply.send(data);
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
}

export default postRoutes; 