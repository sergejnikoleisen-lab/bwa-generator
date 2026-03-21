export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY fehlt in Environment Variables' });
  }

  const { priceId, mode = 'payment' } = req.body || {};
  const finalPriceId = priceId || 'price_1TDZD4D0HqBbjmyliXljmdkY';
  const origin = req.headers.origin || 'https://bwa-generator.de';

  try {
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price]', finalPriceId);
    params.append('line_items[0][quantity]', '1');
    params.append('mode', mode);
    params.append('success_url', `${origin}/?paid=true&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/?paid=false`);
    params.append('locale', 'de');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok || session.error) {
      const msg = session.error?.message || JSON.stringify(session);
      return res.status(400).json({ error: `Stripe Fehler: ${msg}` });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: `Server Fehler: ${err.message}` });
  }
}
