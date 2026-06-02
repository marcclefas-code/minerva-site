import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { accepted, visitorId } = body;

    const directusUrl = import.meta.env.DIRECTUS_URL;
    const token = import.meta.env.DIRECTUS_TOKEN;

    if (directusUrl && token) {
      await fetch(`${directusUrl}/items/gdpr_consents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          visitor_id: visitorId || crypto.randomUUID(),
          accepted,
          timestamp: new Date().toISOString(),
          ip_hash: 'hashed-server-side'
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to log consent' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
