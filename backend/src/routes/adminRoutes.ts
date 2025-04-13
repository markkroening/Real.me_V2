import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

console.log('[Init] adminRoutes loaded');

// Validation schemas
const verifyProfileSchema = z.object({
  userId: z.string().uuid({ message: "Invalid User ID format" }),
  real_name: z.string().min(1, "Real name is required"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format"),
  location: z.string().min(1, "Location is required"),
  verification_notes: z.string().optional(),
});

type VerifyProfileInput = z.infer<typeof verifyProfileSchema>;

async function adminRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
  try {
    console.log('[Debug] adminRoutes function starting');
    // Verify a user's profile
    server.post<{ Body: VerifyProfileInput }>('/admin/verify-profile', {
      schema: { body: verifyProfileSchema }
    }, async (request, reply) => {
      if (!request.user?.id || !request.token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      // Check if the user is an admin by checking the admins table
      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', request.user.id)
        .single();

      if (adminError || !adminRecord) {
        request.log.warn({ userId: request.user.id }, 'Non-admin user attempted to verify profile');
        return reply.status(403).send({ error: 'Only administrators can verify profiles' });
      }

      const { userId, real_name, birth_date, location, verification_notes } = request.body;

      // Start a transaction using a PostgreSQL function
      const { data, error } = await supabaseAdmin.rpc('verify_user_profile', {
        p_user_id: userId,
        p_real_name: real_name,
        p_birth_date: birth_date,
        p_location: location,
        p_verification_notes: verification_notes,
        p_verified_by: request.user.id
      });

      if (error) {
        request.log.error({ 
          error,
          userId,
          verifiedBy: request.user.id,
          details: error.details,
          hint: error.hint,
          message: error.message
        }, 'Error verifying user profile');
        
        if (error.code === 'PGRST116') {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        return reply.status(500).send({ 
          error: 'Failed to verify user profile',
          details: error.message
        });
      }

      request.log.info({ 
        userId,
        verifiedBy: request.user.id,
        real_name,
        location
      }, 'User profile verified successfully');

      reply.status(200).send(data);
    });

    // Add an admin (only existing admins can add new admins)
    server.post<{ Body: { userId: string, notes?: string } }>('/admin/add-admin', {
      schema: { 
        body: z.object({
          userId: z.string().uuid({ message: "Invalid User ID format" }),
          notes: z.string().optional()
        })
      }
    }, async (request, reply) => {
      if (!request.user?.id || !request.token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      // Check if the user is an admin
      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', request.user.id)
        .single();

      if (adminError || !adminRecord) {
        request.log.warn({ userId: request.user.id }, 'Non-admin user attempted to add admin');
        return reply.status(403).send({ error: 'Only administrators can add new admins' });
      }

      const { userId, notes } = request.body;

      // Check if the user to be added as admin exists
      const { data: userExists, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !userExists) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Check if the user is already an admin
      const { data: existingAdmin, error: existingAdminError } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingAdmin) {
        return reply.status(409).send({ error: 'User is already an admin' });
      }

      // Add the user as an admin
      const { data, error } = await supabaseAdmin
        .from('admins')
        .insert({
          user_id: userId,
          created_by: request.user.id,
          notes
        })
        .select()
        .single();

      if (error) {
        request.log.error({ 
          error,
          userId,
          addedBy: request.user.id
        }, 'Error adding admin');
        
        return reply.status(500).send({ 
          error: 'Failed to add admin',
          details: error.message
        });
      }

      request.log.info({ 
        userId,
        addedBy: request.user.id
      }, 'Admin added successfully');

      reply.status(201).send(data);
    });

    // Remove an admin (only existing admins can remove admins)
    server.delete<{ Params: { userId: string } }>('/admin/remove-admin/:userId', {
      schema: { 
        params: z.object({
          userId: z.string().uuid({ message: "Invalid User ID format" })
        })
      }
    }, async (request, reply) => {
      if (!request.user?.id || !request.token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      // Check if the user is an admin
      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', request.user.id)
        .single();

      if (adminError || !adminRecord) {
        request.log.warn({ userId: request.user.id }, 'Non-admin user attempted to remove admin');
        return reply.status(403).send({ error: 'Only administrators can remove admins' });
      }

      const { userId } = request.params;

      // Prevent removing yourself as admin
      if (userId === request.user.id) {
        return reply.status(400).send({ error: 'You cannot remove yourself as an admin' });
      }

      // Remove the admin
      const { error } = await supabaseAdmin
        .from('admins')
        .delete()
        .eq('user_id', userId);

      if (error) {
        request.log.error({ 
          error,
          userId,
          removedBy: request.user.id
        }, 'Error removing admin');
        
        return reply.status(500).send({ 
          error: 'Failed to remove admin',
          details: error.message
        });
      }

      request.log.info({ 
        userId,
        removedBy: request.user.id
      }, 'Admin removed successfully');

      reply.status(204).send();
    });

    // List all admins (only existing admins can view the list)
    server.get('/admin/list', async (request, reply) => {
      if (!request.user?.id || !request.token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      // Check if the user is an admin
      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', request.user.id)
        .single();

      if (adminError || !adminRecord) {
        request.log.warn({ userId: request.user.id }, 'Non-admin user attempted to list admins');
        return reply.status(403).send({ error: 'Only administrators can view the admin list' });
      }

      // Get all admins with their profile information
      const { data, error } = await supabaseAdmin
        .from('admins')
        .select(`
          id,
          user_id,
          created_at,
          created_by,
          notes,
          profiles:user_id (
            id,
            real_name,
            email,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        request.log.error({ 
          error,
          requestedBy: request.user.id
        }, 'Error listing admins');
        
        return reply.status(500).send({ 
          error: 'Failed to list admins',
          details: error.message
        });
      }

      reply.send(data);
    });
  } catch (err) {
    console.error('[ERROR] Exception in adminRoutes:', err);
    throw err; // Re-throw so Fastify knows it failed
  }
}

export default adminRoutes; 