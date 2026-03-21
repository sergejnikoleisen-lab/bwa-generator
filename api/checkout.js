export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe key nicht konfiguriert' });
  }

  const { priceId, mode = 'payment' } = req.body;
  const finalPriceId = priceId || 'price_1TCT6dDzSxUnxOnbCbsa6CKk';

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': finalPriceId,
        'line_items[0][quantity]': '1',
        'mode': mode,
        'success_url': `${req.headers.origin}/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.origin}/?paid=false`,
        'locale': 'de',
      }).toString()
    });

    const session = await stripeRes.json();

    if (session.error) {
      return res.status(400).json({ error: session.error.message });
    }

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
