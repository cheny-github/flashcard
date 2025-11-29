
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import { RefreshCw, Lightbulb, CheckCircle, AlertCircle, Edit2, Trash2, Tag, Volume2, Square } from 'lucide-react';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip, onEdit, onDelete }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when card changes or flips
  useEffect(() => {
    const stopSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    stopSpeech();
    return () => stopSpeech();
  }, [card?.id, isFlipped]);

  // Defensive check: If card is undefined (e.g. during filter transitions), render nothing or a placeholder
  if (!card) return null;

  const toggleSpeech = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.5; // Speed up speech rate
      // Optional: Set language if needed, e.g. utterance.lang = 'zh-CN';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getStatusBadge = () => {
    if (card.proficiency === 'known') {
      return (
        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
          <CheckCircle size={12} /> Mastered
        </span>
      );
    }
    if (card.proficiency === 'unknown') {
      return (
        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100">
          <AlertCircle size={12} /> Review
        </span>
      );
    }
    return null;
  };

  // Helper to render action buttons with specific styling
  const renderActionButtons = (colorClass: string, hoverClass: string, textToRead: string) => (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button 
        type="button"
        onClick={(e) => toggleSpeech(e, textToRead)}
        className={`p-1.5 ${colorClass} ${hoverClass} rounded-md transition-colors relative z-10 mr-1`}
        title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
      >
        {isSpeaking ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
      </button>
      <div className="w-px h-4 bg-slate-200 mx-1 opacity-50"></div>
      <button 
        type="button"
        onClick={onEdit}
        className={`p-1.5 ${colorClass} ${hoverClass} rounded-md transition-colors relative z-10`}
        title="Edit Card"
      >
        <Edit2 size={16} />
      </button>
      <button 
        type="button"
        onClick={onDelete}
        className={`p-1.5 ${colorClass} hover:text-red-600 hover:bg-red-50 rounded-md transition-colors relative z-10`}
        title="Delete Card"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const questionText = `${card.category}. ${card.question}`;
  const answerText = `${card.answer}. ${card.details ? card.details.join('. ') : ''}`;

  return (
    <div className="w-full max-w-2xl mx-auto h-[400px] cursor-pointer perspective-1000" onClick={onFlip}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front Face */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col justify-between overflow-hidden ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 items-start">
               <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{card.category}</span>
               <div className="flex flex-wrap gap-1">
                 {getStatusBadge()}
                 {card.tags && card.tags.map((tag, idx) => (
                   <span key={idx} className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-medium border border-slate-200">
                     <Tag size={10} /> {tag}
                   </span>
                 ))}
               </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400 text-sm font-medium"><Lightbulb size={16} /> Question</span>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              {renderActionButtons("text-slate-400", "hover:text-blue-600 hover:bg-blue-50", questionText)}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center leading-relaxed select-none">
              {card.question}
            </h2>
          </div>

          <div className="text-center text-slate-400 text-sm">
            Click to reveal answer
          </div>
        </div>

        {/* Back Face */}
        <div 
          className={`absolute w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-2xl shadow-xl p-8 flex flex-col justify-between overflow-hidden ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
           <div className="flex justify-between items-start text-blue-300 text-sm font-medium">
             <div className="flex flex-col gap-2">
                <span className="uppercase tracking-wider">{card.category}</span>
            </div>
             <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 uppercase tracking-wider"><RefreshCw size={16} /> Answer</span>
                <div className="h-4 w-px bg-slate-700 mx-1"></div>
                 {renderActionButtons("text-slate-500", "hover:text-blue-300 hover:bg-white/10", answerText)}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
            <h3 className="text-xl md:text-2xl font-semibold text-white text-center mb-6 leading-relaxed">
              {card.answer}
            </h3>
            
            {card.details && card.details.length > 0 && (
              <div className="w-full bg-slate-800/50 rounded-lg p-4 mt-2">
                <ul className="space-y-2 text-left">
                  {card.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-blue-400 mt-1.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
