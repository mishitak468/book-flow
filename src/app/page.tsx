"use client";
import { useState, useEffect, useRef } from 'react';
import { Book, BookStatus, UserStats } from '@/types/book';
import BookCard from '@/components/BookCard';
import { Search, Loader2, Plus, BookText, Trophy, Flame, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<BookStatus>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ streak: 0, lastDate: null });
  const [showMilestone, setShowMilestone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Streak & Persistence Logic
  useEffect(() => {
    const savedBooks = localStorage.getItem('book-flow-pro');
    const savedStats = localStorage.getItem('book-flow-stats');
    if (savedBooks) setBooks(JSON.parse(savedBooks));

    const today = new Date().toDateString();
    if (savedStats) {
      const stats: UserStats = JSON.parse(savedStats);
      const last = stats.lastDate ? new Date(stats.lastDate).toDateString() : null;

      if (last !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (last === yesterday.toDateString()) {
          const newStats = { streak: stats.streak + 1, lastDate: today };
          setUserStats(newStats);
          localStorage.setItem('book-flow-stats', JSON.stringify(newStats));
        } else {
          setUserStats({ streak: 1, lastDate: today });
          localStorage.setItem('book-flow-stats', JSON.stringify({ streak: 1, lastDate: today }));
        }
      } else {
        setUserStats(stats);
      }
    } else {
      const initialStats = { streak: 1, lastDate: today };
      setUserStats(initialStats);
      localStorage.setItem('book-flow-stats', JSON.stringify(initialStats));
    }
  }, []);

  // 2. Confetti Milestone
  useEffect(() => {
    if (userStats.streak > 0 && userStats.streak % 7 === 0) {
      setShowMilestone(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#fbbf24']
      });
      setTimeout(() => setShowMilestone(false), 5000);
    }
  }, [userStats.streak]);

  useEffect(() => {
    localStorage.setItem('book-flow-pro', JSON.stringify(books));
  }, [books]);

  const searchBooks = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_KEY;

    // Changed maxResults=5 to maxResults=20
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      setApiResults(data.items?.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
        status: 'to-read',
        thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
        progress: 0
      })) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const addToLibrary = (book: Book) => {
    if (books.some(b => b.id === book.id)) {
      alert("Already in your library!");
      return;
    }
    setBooks(prev => [...prev, book]);
    setApiResults([]);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 min-h-screen text-slate-100 selection:bg-sky-500/40">

      {/* Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-8xl font-black tracking-tighter bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            BookFlow
          </h1>
          <p className="text-slate-500 font-semibold text-xl mt-4 tracking-tight opacity-80">
            Precision cataloging for the modern enthusiast.
          </p>
        </motion.div>

        <div className="flex gap-6">
          <StatBox icon={<Flame size={28} className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />} value={userStats.streak} label="Day Streak" />
          <StatBox icon={<BookText size={28} className="text-sky-400" />} value={books.filter(b => b.status === 'reading').length} label="Reading" />
          <StatBox icon={<Trophy size={28} className="text-yellow-500" />} value={books.filter(b => b.status === 'finished').length} label="Achieved" />
        </div>
      </header>

      {/* Massive Sophisticated Search Bar */}
      <section className="mb-32 max-w-5xl mx-auto relative z-[100]">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative bg-slate-900 border border-slate-700/50 rounded-[3.5rem] p-4 flex items-center shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
            <Search className="ml-10 text-slate-500" size={40} />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search your next masterpiece..."
              className="bg-transparent w-full px-10 py-12 text-white text-5xl outline-none placeholder-slate-800 font-extralight border-none focus:ring-0 caret-sky-400"
              style={{ color: 'white' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
            />

            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setSearchQuery(''); setApiResults([]); inputRef.current?.focus(); }}
                  className="p-4 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={32} />
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={searchBooks}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-16 py-10 rounded-[2.5rem] font-black text-2xl transition-all mr-3 shadow-2xl active:scale-95 whitespace-nowrap"
            >
              {isLoading ? <Loader2 className="animate-spin" size={40} /> : 'DISCOVER'}
            </button>
          </div>

          {/* Results Tray */}
          <AnimatePresence>
            {apiResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                // Added h-[600px] and overflow-y-auto
                className="absolute w-full mt-6 bg-slate-900/95 backdrop-blur-3xl border border-slate-700 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[110] overflow-y-auto max-h-[600px] custom-scrollbar"
              >
                {apiResults.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-12 hover:bg-slate-800/50 border-b border-slate-800 last:border-0 transition-colors group/item">
                    <div className="flex items-center gap-12">
                      <img src={book.thumbnail} className="w-24 h-36 object-cover rounded-3xl shadow-2xl border border-white/5 transition-transform group-hover/item:scale-105" alt="" />
                      <div>
                        <p className="font-bold text-white text-4xl tracking-tight">{book.title}</p>
                        <p className="text-slate-500 text-2xl mt-2 font-medium">{book.author}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToLibrary(book)}
                      className="p-8 bg-sky-500 text-slate-950 rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(56,189,248,0.4)] active:scale-90"
                    >
                      <Plus size={44} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Tabs System */}
      <div className="flex justify-center mb-24 relative z-10">
        <nav className="bg-slate-950/50 border border-slate-800 p-3 rounded-[2.5rem] flex gap-4 backdrop-blur-xl shadow-inner">
          {(['to-read', 'reading', 'finished'] as BookStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-16 py-6 rounded-[2rem] text-sm font-black tracking-[0.5em] transition-all duration-300 ${activeTab === tab
                ? 'bg-white text-slate-950 shadow-[0_15px_40px_rgba(255,255,255,0.2)] scale-105'
                : 'text-slate-600 hover:text-slate-300'
                }`}
            >
              {tab.toUpperCase().replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 relative z-10">
        <AnimatePresence mode="popLayout">
          {books.filter(b => b.status === activeTab).map(book => (
            <BookCard
              key={book.id}
              book={book}
              onStatusChange={(id, status) => setBooks(books.map(b => b.id === id ? { ...b, status } : b))}
              onDelete={(id) => setBooks(books.filter(b => b.id !== id))}
              onProgressChange={(id, progress) => setBooks(books.map(b => b.id === id ? { ...b, progress } : b))}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Milestone Notification */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 100 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-orange-500 to-yellow-500 p-[3px] rounded-[2.5rem] shadow-[0_0_100px_rgba(249,115,22,0.6)]"
          >
            <div className="bg-slate-950 px-12 py-8 rounded-[2.4rem] flex items-center gap-8">
              <Flame size={50} className="text-orange-500 animate-pulse" />
              <div>
                <h4 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">Legendary Flow</h4>
                <p className="text-slate-500 text-xs font-black tracking-[0.4em] mt-2">{userStats.streak} DAYS OF EXCELLENCE</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ icon, value, label }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800/50 px-12 py-10 rounded-[3rem] flex flex-col items-center min-w-[200px] shadow-2xl backdrop-blur-2xl group hover:border-sky-500/40 transition-all duration-500">
      <div className="flex items-center gap-5 mb-3">
        {icon}
        <span className="text-6xl font-black text-white italic tracking-tighter group-hover:scale-110 transition-transform">{value}</span>
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 group-hover:text-slate-400 transition-colors">{label}</p>
    </div>
  );
}