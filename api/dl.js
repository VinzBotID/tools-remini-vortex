// Vercel Serverless Function: /api/dl
//  GET /api/dl?url=<url_gambar> -> stream file dengan header attachment (langsung download)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';

module.exports = async (req, res) => {
  try {
    const url = (req.query && req.query.url) || '';
    if (!/^https?:\/\//i.test(url)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('URL tidak valid.');
    }

    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Gagal mengambil file: HTTP ' + r.status);
    }

    const type = r.headers.get('content-type') || 'image/jpeg';
    let ext = 'jpg';
    if (/png/i.test(type)) ext = 'png';
    else if (/webp/i.test(contentType)) ext = 'webp';
    else if (/gif/i.test(contentType)) ext = 'gif';

    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', `attachment; filename="Remini-HD.${ext}"`);
    res.setHeader('Cache-Control', 'no-store');

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Length', buf.length);
    res.end(buf);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Error: ' + (e && e.message));
  }
};
