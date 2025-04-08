import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseClient'; // Import Supabase client

// Route plugin function
async function profileRoutes(server: FastifyInstance, options: FastifyPluginOptions) {

  // --- GET /api/v1/profiles ---
  // Publicly lists verified profiles using the view
  server.get('/api/v1/profiles', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('Fetching list of public profiles');

    // Select from the public_profiles view
    // This view automatically filters for is_verified = true and selects only public columns
    const { data, error } = await supabaseAdmin
      .from('public_profiles') // Query the VIEW, not the TABLE
      .select('*')
      .limit(100); // Add a sensible limit

    if (error) {
      request.log.error(
        {
          msg: 'Error fetching public profiles',
          error: error, code: error?.code, details: error?.details, hint: error?.hint, message: error?.message
        },
        'Database select from view failed'
      );
      console.error("Raw error fetching public profiles:", error);
      return reply.status(500).send({ error: 'Failed to fetch profiles', details: error?.message || 'Unknown error' });
    }

    reply.send(data);
  });

  // --- Add GET /api/v1/profiles/:id later ---
  // --- Add GET /api/v1/profiles/me later (requires auth) ---

}

export default profileRoutes; // Export the plugin