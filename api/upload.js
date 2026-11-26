// Vercel Serverless Function: /api/upload
//  POST /api/upload (body = file gambar mentah) -> upload ke uguu.se, balikin URL
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';
const MAX = 4 * 1024 * 1024;

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return send(res, 405, { status: false, message: 'Gunakan POST.' });

    const chunks = [];
    let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > MAX) return send(res, 413, { status: false, message: 'Ukuran foto maksimal 4 MB.' });
      chunks.push(c);
    }
    const buf = Buffer.concat(chunks);
    if (!buf.length) return send(res, 400, { status: false, message: 'File kosong.' });

    const type = (req.headers['content-type'] || 'image/jpeg').split(';')[0];
    if (!type.startsWith('image/')) return send(res, 400, { status: false, message: 'File harus berupa gambar.' });

    const ext = type.split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
    const fd = new FormData();
    fd.append('files[]', new Blob([buf], { type }), 'foto.' + ext);

    const up = await fetch('https://uguu.se/upload', {
      method: 'POST',
      body: fd,
      headers: { 'User-Agent': UA }
    });
    const text = (await up.text()).trim();

    let url = '';
    try { url = JSON.parse(text).files[0].url; }
    catch (e) { if (/^https?:\/\/\S+$/.test(text)) url = text; }

    if (!url) return send(res, 502, { status: false, message: 'uguu.se menolak file: ' + text.slice(0, 150) });

    return send(res, 200, { status: true, url });
  } catch (e) {
    return send(res, 500, { status: false, message: 'Error server: ' + (e && e.message) });
  }
};
