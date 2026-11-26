// Vercel Serverless Function: /api/remini
//  GET /api/remini?url=<url_gambar> -> proxy ke api.nexadev.my.id/api/remini
const REMINI_API = 'https://api.nexadev.my.id/api/remini';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    const url = (req.query && req.query.url) || '';
    if (!/^https?:\/\//i.test(url)) {
      return send(res, 400, { status: false, message: 'Link gambar tidak valid.' });
    }

    const r = await fetch(REMINI_API + '?url=' + encodeURIComponent(url), {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const body = await r.text();
    if (!body) return send(res, 502, { status: false, message: 'API Remini tidak merespons (HTTP ' + r.status + ').' });

    let json;
    try { json = JSON.parse(body); }
    catch (e) { return send(res, 502, { status: false, message: 'Balasan API bukan JSON: ' + body.replace(/<[^>]*>/g, ' ').slice(0, 150) }); }

    return send(res, 200, json);
  } catch (e) {
    return send(res, 500, { status: false, message: 'Error server: ' + (e && e.message) });
  }
};
