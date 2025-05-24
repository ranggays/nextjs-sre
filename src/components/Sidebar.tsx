'use client';

export default function Sidebar({ setOpened }: { setOpened: (o: boolean) => void }) {
  return (
    <div>
      <div style={{ fontWeight: 'bold' }}>Riwayat</div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setOpened(false)}>Buat Obrolan Baru</button>
      </div>
      {/* Tambahkan daftar obrolan di sini */}
    </div>
  );
}
