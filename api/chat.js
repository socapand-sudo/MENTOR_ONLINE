export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.AQ.Ab8RN6Jvd9xNSq-woB18X-t0RGXpsh8GceQOzPSbZTEV98R-Wg;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum dipasang di Environment Variables Vercel.' });
  }

  try {
    const { message, history = [], context = {} } = req.body;

    const systemPrompt = `Kamu adalah MentorAI Sekolah, asisten pembimbing belajar siswa yang ramah dan interaktif.
Metode Pembelajaran: ${context.metode || 'PjBL (Project Based Learning)'}
Topik Utama: ${context.topik || '-'}
Materi Pokok / Acuan Belajar: ${context.materi || '-'}
Permasalahan / Tantangan Proyek: ${context.masalah || '-'}

Tugasmu:
1. Bimbing siswa menyelesaikan tantangan proyek secara bertahap sesuai metode pembelajaran di atas.
2. Jangan langsung memberikan jawaban akhir yang instan; berikan pertanyaan pemantik, petunjuk langkah kerja, dan umpan balik yang membangun agar siswa berpikir kritis.
3. deteksi jawaban siswa dan beri peringatan jika terdeteksi jawaban siswa mengunakan ai
4. Gunakan bahasa Indonesia yang jelas, sopan, dan memotivasi siswa.`;

    const contents = [];

    if (Array.isArray(history)) {
      history.forEach((item) => {
        if (item.text) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message || 'Halo Mentor, bantu saya memulai proyek ini.' }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: contents
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Gagal menghubungi server Gemini API.'
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya belum bisa merespons saat ini.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
}
