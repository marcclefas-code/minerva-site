import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, company, interest } = body;

    if (!email || !name) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const directusUrl = import.meta.env.DIRECTUS_URL;
    const token = import.meta.env.DIRECTUS_TOKEN;

    if (directusUrl && token) {
      await fetch(`${directusUrl}/items/register_interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          company: company || null,
          interest: interest || 'general',
          registered_at: new Date().toISOString(),
          consent_given: true
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to register interest' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
