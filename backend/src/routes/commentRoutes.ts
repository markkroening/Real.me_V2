import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

console.log('[Init] commentRoutes loaded');

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  post_id: z.string().uuid({ message: "Invalid Post ID format" }),
  parent_comment_id: z.string().uuid({ message: "Invalid Parent Comment ID format" }).optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

const commentParamsSchema = z.object({
  commentId: z.string().uuid({ message: "Invalid Comment ID format" }),
});

type CreateCommentInput = z.infer<typeof createCommentSchema>;
type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
type CommentParams = z.infer<typeof commentParamsSchema>;

async function commentRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // Create a new comment
  server.post<{ Body: CreateCommentInput }>('/comments', {
    schema: { body: createCommentSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { content, post_id, parent_comment_id } = request.body;
    const userId = request.user.id;

    // First verify the post exists and get its community_id
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('community_id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    // Verify the user is a member of the community
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('community_id', post.community_id)
      .eq('profile_id', userId)
      .single();

    if (membershipError || !membership) {
      return reply.status(403).send({ error: 'You must be a member of this community to comment' });
    }

    // If parent_comment_id is provided, verify it exists and belongs to the same post
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabaseAdmin
        .from('comments')
        .select('post_id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError || !parentComment || parentComment.post_id !== post_id) {
        return reply.status(400).send({ error: 'Invalid parent comment' });
      }
    }

    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { data, error } = await supabaseUserClient
      .from('comments')
      .insert({
        content,
        post_id,
        parent_comment_id,
        author_id: userId,
      })
      .select(`
        *,
        profiles:author_id (
          id,
          real_name,
          email,
          location
        )
      `)
      .single();

    if (error) {
      request.log.error({ 
        error,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
        post_id,
        parent_comment_id,
        userId
      }, 'Error creating comment');
      
      if (error.code === '23503') {
        return reply.status(400).send({ 
          error: 'Failed to create comment',
          details: 'Foreign key constraint violation. Please check if post_id and parent_comment_id exist.'
        });
      }
      
      return reply.status(500).send({ 
        error: 'Failed to create comment',
        details: error.message,
        code: error.code
      });
    }

    reply.status(201).send(data);
  });

  // Get comments for a post
  server.get<{ Params: { postId: string } }>('/posts/:postId/comments', {
    schema: { params: z.object({ postId: z.string().uuid() }) }
  }, async (request, reply) => {
    const { postId } = request.params;

    const { data, error } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        profiles:author_id (
          id,
          real_name,
          email,
          location
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      request.log.error({ error }, 'Error fetching comments');
      return reply.status(500).send({ error: 'Failed to fetch comments' });
    }

    reply.send(data);
  });

  // Update a comment (only by the author)
  server.patch<{ Params: CommentParams; Body: UpdateCommentInput }>('/comments/:commentId', {
    schema: { params: commentParamsSchema, body: updateCommentSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { commentId } = request.params;
    const updates = request.body;
    const userId = request.user.id;

    // First verify the user is the author of the comment
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return reply.status(404).send({ error: 'Comment not found' });
    }

    if (comment.author_id !== userId) {
      return reply.status(403).send({ error: 'You can only edit your own comments' });
    }

    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { data, error } = await supabaseUserClient
      .from('comments')
      .update(updates)
      .eq('id', commentId)
      .select(`
        *,
        profiles:author_id (
          id,
          real_name,
          email,
          location
        )
      `)
      .single();

    if (error) {
      request.log.error({ error }, 'Error updating comment');
      return reply.status(500).send({ error: 'Failed to update comment' });
    }

    reply.send(data);
  });

  // Delete a comment (only by the author)
  server.delete<{ Params: CommentParams }>('/comments/:commentId', {
    schema: { params: commentParamsSchema }
  }, async (request, reply) => {
    if (!request.user?.id || !request.token) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { commentId } = request.params;
    const userId = request.user.id;

    // First verify the user is the author of the comment
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return reply.status(404).send({ error: 'Comment not found' });
    }

    if (comment.author_id !== userId) {
      return reply.status(403).send({ error: 'You can only delete your own comments' });
    }

    const supabaseUserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${request.token}` } },
    });

    const { error } = await supabaseUserClient
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      request.log.error({ error }, 'Error deleting comment');
      return reply.status(500).send({ error: 'Failed to delete comment' });
    }

    reply.status(204).send();
  });
}

export default commentRoutes; 
