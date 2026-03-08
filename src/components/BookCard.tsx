"use client";
import { Book, BookStatus } from '@/types/book';
import { motion } from 'framer-motion';
import { Trash2, BookOpen, CheckCircle, Bookmark } from 'lucide-react';

interface Props {
  book: Book;
  onStatusChange: (id: string, status: BookStatus) => void;
  onDelete: (id: string) => void;
  onProgressChange: (id: string, progress: number) => void;
}

export default function BookCard({ book, onStatusChange, onDelete, onProgressChange }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-800 hover:border-sky-500/50 transition-all group"
    >
      <div className="flex gap-4">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-20 h-28 object-cover rounded-lg shadow-lg border border-slate-700"
          />
        ) : (
          <div className="w-20 h-28 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
            <Bookmark className="text-slate-600" />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <h3 className="text-slate-100 font-bold text-xl leading-tight mb-1 group-hover:text-sky-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-4">{book.author}</p>

          <div className="flex gap-2 mt-auto">
            <StatusButton
              active={book.status === 'to-read'}
              onClick={() => onStatusChange(book.id, 'to-read')}
              icon={<Bookmark size={16} />}
              color="hover:text-blue-400"
            />
            <StatusButton
              active={book.status === 'reading'}
              onClick={() => onStatusChange(book.id, 'reading')}
              icon={<BookOpen size={16} />}
              color="hover:text-orange-400"
            />
            <StatusButton
              active={book.status === 'finished'}
              onClick={() => onStatusChange(book.id, 'finished')}
              icon={<CheckCircle size={16} />}
              color="hover:text-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Progress Slider - only shows when "Reading" */}
      {book.status === 'reading' && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Reading Progress</span>
            <span className="text-sky-400">{book.progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={book.progress || 0}
            onChange={(e) => onProgressChange(book.id, parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>
      )}

      <button
        onClick={() => onDelete(book.id)}
        className="mt-5 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
      >
        <Trash2 size={14} /> Remove Book
      </button>
    </motion.div>
  );
}

// Helper component for the status icons
function StatusButton({ active, onClick, icon, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${active
        ? 'bg-slate-800 text-sky-400 shadow-inner'
        : `text-slate-600 ${color} hover:bg-slate-800`
        }`}
    >
      {icon}
    </button>
  );
}