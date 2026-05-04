import React, { useState, useEffect } from 'react';
import { Heart, Home, Image as ImageIcon, Video, Film, Music, Gamepad2, Grid3X3, X, ChevronLeft, ChevronRight, Lock, Plus, Trash2, Edit2, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  folder: string;
  caption: string;
  url: string;
  page: 'Carousel' | 'Foto' | 'Video' | 'Shorts' | 'Galeri' | 'Home Grid';
}

interface Song {
  title: string;
  artist: string;
  url: string;
  emoji: string;
}

// --- Helpers ---
const getDisplayUrl = (url: string) => {
  if (!url) return '';
  // Google Drive Image Fix
  if (url.includes('drive.google.com')) {
    let id = '';
    const match = url.match(/[\/:=]([a-zA-Z0-9_-]{33,})[\/?&]?/);
    if (match) id = match[1];
    
    if (id) return `https://drive.google.com/uc?id=${id}&export=download`;
  }
  return url;
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  // Google Drive Video Fix
  if (url.includes('drive.google.com')) {
    let id = '';
    const match = url.match(/[\/:=]([a-zA-Z0-9_-]{33,})[\/?&]?/);
    if (match) id = match[1];
    
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
  }
  // YouTube Fix
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let id = '';
    if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('embed/')) id = url.split('embed/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  // Spotify Fix
  if (url.includes('spotify.com')) {
    const parts = url.split('/');
    const id = parts[parts.length - 1].split('?')[0];
    const type = url.includes('/track/') ? 'track' : url.includes('/playlist/') ? 'playlist' : 'album';
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  return url;
};

const FallingHeart = () => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    setStyle({
      left: `${Math.random() * 100}vw`,
      animationDuration: `${5 + Math.random() * 5}s`,
      fontSize: `${1 + Math.random() * 1.5}rem`,
      opacity: 0.4 + Math.random() * 0.4
    });
  }, []);
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: '110vh', opacity: 1 }}
      transition={{ duration: 7, ease: 'linear', repeat: Infinity }}
      className="fixed pointer-events-none z-0 text-pink-400"
      style={style}
    >❤️</motion.div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [adminPass, setAdminPass] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const [media, setMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('romantic_media');
    return saved ? JSON.parse(saved) : [];
  });
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('romantic_songs');
    return saved ? JSON.parse(saved) : [
      { title: 'Lagu Cinta', artist: 'Della & Azmi', url: 'https://open.spotify.com/track/11dFghVXANMlrBjiuQEW5Y', emoji: '❤️' }
    ];
  });
  const [siteText, setSiteText] = useState(() => {
    const saved = localStorage.getItem('site_text');
    return saved ? JSON.parse(saved) : {
      welcome: 'Selamat datang di website kenangan romantis kami! Sini kamu bisa lihat momen-momen indah yang pernah kita lewati bersama...',
      romantic: 'Setiap detik bersamamu adalah anugerah terindah yang pernah kutulis.',
      homeFooter: '❤️ Teruslah bersama sejauh apa pun kita melangkah.',
      photosFooter: '📸 Setiap foto punya cerita, dan cerita kita adalah favoritku.',
      videosFooter: '🎬 Menonton kembali setiap tawa kita yang terekam.',
      shortsFooter: '📹 Momen singkat yang bermakna selamanya.',
      songsFooter: '🎵 Musik adalah bahasa saat kata-kata tak cukup mengungkapkan rasa.',
      galleryFooter: '📁 Gudang kenangan yang takkan pernah usang.'
    };
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editSongIndex, setEditSongIndex] = useState<number | null>(null);
  const [mediaForm, setMediaForm] = useState({ page: 'Foto', folder: '', caption: '', url: '' });
  const [songForm, setSongForm] = useState({ title: '', artist: '', url: '', emoji: '🎵' });

  useEffect(() => {
    localStorage.setItem('romantic_media', JSON.stringify(media));
    localStorage.setItem('romantic_songs', JSON.stringify(songs));
    localStorage.setItem('site_text', JSON.stringify(siteText));
  }, [media, songs, siteText]);

  const handleMediaSubmit = () => {
    if (!mediaForm.folder || !mediaForm.caption || !mediaForm.url) return;
    if (editId) {
      setMedia(media.map(m => m.id === editId ? { ...m, ...mediaForm as any, type: (mediaForm.page === 'Video' || mediaForm.page === 'Shorts') ? 'video' : 'photo' } : m));
      setEditId(null);
    } else {
      const newItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: (mediaForm.page === 'Video' || mediaForm.page === 'Shorts') ? 'video' : 'photo',
        ...mediaForm as any
      };
      setMedia([...media, newItem]);
    }
    setMediaForm({ ...mediaForm, caption: '', url: '' });
  };

  const handleSongSubmit = () => {
    if (!songForm.title || !songForm.url) return;
    if (editSongIndex !== null) {
      const newSongs = [...songs];
      newSongs[editSongIndex] = songForm;
      setSongs(newSongs);
      setEditSongIndex(null);
    } else {
      setSongs([...songs, songForm]);
    }
    setSongForm({ title: '', artist: '', url: '', emoji: '🎵' });
  };

  const carouselItems = media.filter(m => m.page === 'Carousel');
  const homeGridItems = media.filter(m => m.page === 'Home Grid');
  
  const filteredMedia = media.filter(m => {
    const pageMap: { [key: string]: string } = {
      photos: 'Foto',
      videos: 'Video',
      shorts: 'Shorts',
      gallery: 'Galeri'
    };
    return m.page === pageMap[currentPage];
  });
  const folders = Array.from(new Set(filteredMedia.map(m => m.folder)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-gray-800 font-sans selection:bg-pink-200 overflow-x-hidden">
      {[...Array(12)].map((_, i) => <FallingHeart key={i} />)}

      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-pink-100 p-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Heart className="fill-pink-500 text-pink-500" size={28} /> Della & Azmi
          </h1>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'photos', icon: ImageIcon, label: 'Foto' },
              { id: 'videos', icon: Video, label: 'Video' },
              { id: 'shorts', icon: Film, label: 'Shorts' },
              { id: 'songs', icon: Music, label: 'Lagu' },
              { id: 'gallery', icon: Grid3X3, label: 'Galeri' }
            ].map(nav => (
              <button
                key={nav.id}
                onClick={() => { setCurrentPage(nav.id); setSelectedFolder(null); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-all text-sm ${currentPage === nav.id ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:bg-pink-50'}`}
              >
                <nav.icon size={16} /> <span className="hidden sm:inline">{nav.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 relative z-10">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <header className="text-center space-y-4">
                <h2 className="text-4xl sm:text-6xl font-black text-pink-600 tracking-tight">Memory Cinta ❤️</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">{siteText.romantic}</p>
              </header>

              <div className="relative aspect-video max-w-4xl mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                {carouselItems.length > 0 ? (
                  <>
                    <img src={getDisplayUrl(carouselItems[carouselIndex].url)} className="w-full h-full object-cover transition-opacity duration-500" alt="Memory" />
                    <button onClick={() => setCarouselIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md"><ChevronLeft /></button>
                    <button onClick={() => setCarouselIndex(prev => (prev + 1) % carouselItems.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md"><ChevronRight /></button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white"><p className="text-xl font-bold">{carouselItems[carouselIndex].caption}</p></div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center bg-pink-50 text-pink-300"><ImageIcon size={64} /></div>
                )}
              </div>

              {/* Home Photo Grid */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-center text-pink-500">Koleksi Momen ✨</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {homeGridItems.map(item => (
                    <div key={item.id} className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-pink-50">
                      <img src={getDisplayUrl(item.url)} className="w-full h-full object-cover" alt={item.caption} />
                    </div>
                  ))}
                  {homeGridItems.length === 0 && <p className="col-span-full text-center text-gray-400 py-4">Belum ada foto grid. Tambahkan lewat Admin!</p>}
                </div>
              </div>

              <div className="bg-white/50 p-8 rounded-[2.5rem] text-center border-2 border-pink-100 italic text-gray-600">
                {siteText.homeFooter}
              </div>
            </motion.div>
          )}

          {['photos', 'videos', 'shorts', 'gallery'].includes(currentPage) && (
            <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {selectedFolder ? (
                <div className="space-y-6">
                  <button onClick={() => setSelectedFolder(null)} className="flex items-center gap-2 text-pink-600 font-bold hover:underline mb-4"><ArrowLeft size={18} /> Kembali ke Folder</button>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Isi Folder: {selectedFolder}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredMedia.filter(m => m.folder === selectedFolder).map(item => (
                      <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-50 flex flex-col">
                        <div className={`w-full overflow-hidden ${currentPage === 'shorts' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                          {item.type === 'photo' ? (
                            <img src={getDisplayUrl(item.url)} className="w-full h-full object-cover" alt={item.caption} />
                          ) : (
                            <iframe src={getEmbedUrl(item.url)} className="w-full h-full" frameBorder="0" allowFullScreen />
                          )}
                        </div>
                        <div className="p-4 flex-grow flex items-center justify-center">
                          <p className="font-semibold text-center text-gray-700">{item.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {folders.map(folder => (
                    <button key={folder} onClick={() => setSelectedFolder(folder)} className="group bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-pink-300 hover:shadow-xl transition-all text-center">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                      <h4 className="font-bold text-gray-800 truncate">{folder}</h4>
                      <p className="text-xs text-gray-400 mt-2">{filteredMedia.filter(m => m.folder === folder).length} File</p>
                    </button>
                  ))}
                  {folders.length === 0 && <p className="col-span-full text-center text-gray-400 py-12">Belum ada data di sini. Tambahkan lewat Admin!</p>}
                </div>
              )}
              
              <div className="bg-white/50 p-8 rounded-[2.5rem] text-center border-2 border-pink-100 italic text-gray-600">
                {currentPage === 'photos' ? siteText.photosFooter : 
                 currentPage === 'videos' ? siteText.videosFooter : 
                 currentPage === 'shorts' ? siteText.shortsFooter : siteText.galleryFooter}
              </div>
            </motion.div>
          )}

          {currentPage === 'songs' && (
            <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8">
                {songs.map((song, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-lg border border-pink-100 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{song.emoji}</div>
                      <div><h4 className="font-bold text-pink-600 text-lg">{song.title}</h4><p className="text-gray-500">{song.artist}</p></div>
                    </div>
                    <div className="rounded-2xl overflow-hidden bg-pink-50"><iframe src={getEmbedUrl(song.url)} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /></div>
                  </div>
                ))}
              </div>
              <div className="bg-white/50 p-8 rounded-[2.5rem] text-center border-2 border-pink-100 italic text-gray-600">
                {siteText.songsFooter}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)} className="fixed bottom-8 right-8 p-5 bg-white shadow-2xl rounded-full text-pink-600 border border-pink-100 z-[100] hover:scale-110 transition-transform"><Lock size={24} /></button>

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border-8 border-pink-50">
              <div className="text-7xl mb-6">🧸</div>
              <h2 className="text-3xl font-black text-pink-600 mb-4">Momen Kita!</h2>
              <p className="text-gray-600 leading-relaxed mb-10">{siteText.welcome}</p>
              <button onClick={() => setShowWelcome(false)} className="w-full py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-3xl shadow-xl hover:shadow-pink-200 transition-all">Mulai ❤️</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-xs text-center text-pink-600 font-bold border-4 border-pink-50">
            <h3 className="text-2xl mb-6">Admin Login</h3>
            <input type="password" placeholder="Password..." className="w-full p-4 border-2 border-pink-50 rounded-2xl mb-4 outline-none" onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && (adminPass === 'azmidella23' ? (setIsAdmin(true), setShowAdminLogin(false)) : alert('Salah!'))} />
            <button onClick={() => adminPass === 'azmidella23' ? (setIsAdmin(true), setShowAdminLogin(false)) : alert('Salah!')} className="w-full bg-pink-600 text-white py-4 rounded-2xl hover:bg-pink-700">Confirm</button>
          </div>
        </div>
      )}

      {isAdmin && (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="fixed inset-0 z-[150] bg-white overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex justify-between items-center bg-pink-50 p-8 rounded-[2.5rem]"><h2 className="text-4xl font-black text-pink-600">Admin ⚙️</h2><button onClick={() => setIsAdmin(false)} className="p-4 hover:bg-white rounded-full"><X size={32} /></button></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="font-bold text-gray-600 block">Pesan Welcome</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.welcome} onChange={e => setSiteText({...siteText, welcome: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Home</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.homeFooter} onChange={e => setSiteText({...siteText, homeFooter: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Foto</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.photosFooter} onChange={e => setSiteText({...siteText, photosFooter: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Video</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.videosFooter} onChange={e => setSiteText({...siteText, videosFooter: e.target.value})} />
              </div>
              <div className="space-y-4">
                <label className="font-bold text-gray-600 block">Pesan Romantis</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.romantic} onChange={e => setSiteText({...siteText, romantic: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Galeri</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.galleryFooter} onChange={e => setSiteText({...siteText, galleryFooter: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Shorts</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.shortsFooter} onChange={e => setSiteText({...siteText, shortsFooter: e.target.value})} />
                
                <label className="font-bold text-gray-600 block">Footer Lagu</label>
                <textarea className="w-full p-4 bg-pink-50 rounded-2xl min-h-[80px]" value={siteText.songsFooter} onChange={e => setSiteText({...siteText, songsFooter: e.target.value})} />
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-2xl font-bold">{editId ? 'Edit Media ✏️' : 'Tambah Media Baru 📸'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-4 rounded-2xl border-none ring-2 ring-gray-100" value={mediaForm.page} onChange={e => setMediaForm({...mediaForm, page: e.target.value as any})}>
                  {['Carousel', 'Foto', 'Video', 'Shorts', 'Galeri', 'Home Grid'].map(o => <option key={o}>{o}</option>)}
                </select>
                <input placeholder="Nama Folder" className="p-4 rounded-2xl ring-2 ring-gray-100" value={mediaForm.folder} onChange={e => setMediaForm({...mediaForm, folder: e.target.value})} />
              </div>
              <input placeholder="Caption" className="w-full p-4 rounded-2xl ring-2 ring-gray-100" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
              <input placeholder="Link GDrive/YT" className="w-full p-4 rounded-2xl ring-2 ring-gray-100" value={mediaForm.url} onChange={e => setMediaForm({...mediaForm, url: e.target.value})} />
              <button onClick={handleMediaSubmit} className="w-full py-5 bg-pink-600 text-white font-black rounded-2xl shadow-xl">{editId ? 'Update Media' : 'Publish Media'}</button>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-2xl font-bold">{editSongIndex !== null ? 'Edit Lagu 🎵' : 'Tambah Lagu Baru 🎵'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Judul Lagu" className="p-4 rounded-2xl ring-2 ring-gray-100" value={songForm.title} onChange={e => setSongForm({...songForm, title: e.target.value})} />
                <input placeholder="Penyanyi" className="p-4 rounded-2xl ring-2 ring-gray-100" value={songForm.artist} onChange={e => setSongForm({...songForm, artist: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <input placeholder="Emoji" className="p-4 rounded-2xl ring-2 ring-gray-100 text-center" value={songForm.emoji} onChange={e => setSongForm({...songForm, emoji: e.target.value})} />
                <input placeholder="Link Spotify" className="col-span-3 p-4 rounded-2xl ring-2 ring-gray-100" value={songForm.url} onChange={e => setSongForm({...songForm, url: e.target.value})} />
              </div>
              <button onClick={handleSongSubmit} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl">{editSongIndex !== null ? 'Update Lagu' : 'Publish Lagu'}</button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-400">Daftar Media ({media.length})</h3>
                <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {media.map(m => (
                    <div key={m.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">{m.type === 'photo' ? <img src={getDisplayUrl(m.url)} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><Video size={20} /></div>}</div>
                      <div className="flex-1 truncate"><p className="font-bold">{m.folder}: {m.caption}</p><p className="text-xs text-gray-400 capitalize">{m.page}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(m.id); setMediaForm({ page: m.page, folder: m.folder, caption: m.caption, url: m.url }); }} className="p-2 text-blue-500"><Edit2 size={18} /></button>
                        <button onClick={() => setMedia(media.filter(x => x.id !== m.id))} className="p-2 text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-400">Daftar Lagu ({songs.length})</h3>
                <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {songs.map((s, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">{s.emoji}</div>
                      <div className="flex-1 truncate"><p className="font-bold">{s.title}</p><p className="text-xs text-gray-400">{s.artist}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditSongIndex(index); setSongForm(s); }} className="p-2 text-blue-500"><Edit2 size={18} /></button>
                        <button onClick={() => setSongs(songs.filter((_, i) => i !== index))} className="p-2 text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
