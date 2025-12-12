
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { loadCards, saveCards, resetData } from './utils/storage';
import { Card, ViewMode, Proficiency } from './types';
import { Flashcard } from './components/Flashcard';
import { Editor } from './components/Editor';
import { CardList } from './components/CardList';
import { EditCardModal } from './components/EditCardModal';
import { 
  ArrowLeft, ArrowRight, Shuffle, List, Edit3, 
  Layers, BookOpen, RotateCcw, Check, X, Filter, Circle
} from 'lucide-react';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<ViewMode>('study');
  const [filterMode, setFilterMode] = useState<'all' | 'new' | 'unknown' | 'known'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // Editing State
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => {
    const data = loadCards();
    setCards(data);
  }, []);

  // Compute unique tags from current cards
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    cards.forEach(card => {
      if (card.tags) {
        card.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [cards]);

  // Filter cards based on selected mode and tag
  const displayCards = useMemo(() => {
    let filtered = cards;
    
    // 1. Proficiency Filter
    if (filterMode === 'new') {
      filtered = filtered.filter(c => !c.proficiency || c.proficiency === 'new');
    } else if (filterMode !== 'all') {
      filtered = filtered.filter(c => c.proficiency === filterMode);
    }

    // 2. Tag Filter
    if (selectedTag) {
      filtered = filtered.filter(c => c.tags?.includes(selectedTag));
    }

    return filtered;
  }, [cards, filterMode, selectedTag]);

  // Safe current card access
  // We clamp the index to ensure we never access an undefined position 
  // (e.g., if filter changes and previous index > new length)
  const effectiveIndex = Math.min(currentIndex, Math.max(0, displayCards.length - 1));
  const currentCard = displayCards[effectiveIndex];

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode, selectedTag]);

  const handleNext = useCallback(() => {
    if (displayCards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
          // Use effectiveIndex as base to ensure we continue from a valid position
          const base = prev >= displayCards.length ? 0 : prev;
          return (base + 1) % displayCards.length;
      });
    }, 200);
  }, [displayCards.length]);

  const handlePrev = useCallback(() => {
    if (displayCards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const base = prev >= displayCards.length ? 0 : prev;
        return (base - 1 + displayCards.length) % displayCards.length;
      });
    }, 200);
  }, [displayCards.length]);

  const handleMark = (proficiency: Proficiency) => {
    if (!currentCard) return;

    // Update the card in the main state
    const updatedCards = cards.map(c => 
      c.id === currentCard.id ? { ...c, proficiency } : c
    );
    
    setCards(updatedCards);
    saveCards(updatedCards);

    // Determine behavior based on whether the card stays in the current view
    // A card stays visible if it matches the Proficiency Filter AND the Tag Filter
    const matchesProficiency = filterMode === 'all' || filterMode === proficiency;
    const matchesTag = !selectedTag || (currentCard.tags?.includes(selectedTag));
    const willStayVisible = matchesProficiency && matchesTag;

    if (willStayVisible) {
        handleNext();
    } else {
        // If the card disappears, we need to adjust the index.
        // If we are at the end of the list, step back.
        // Otherwise, the next card will naturally slide into the current index.
        if (displayCards.length > 0 && effectiveIndex >= displayCards.length - 1) {
             // We are using setTimeout to allow the UI to update smoothly
             // But here we update state immediately to prevent "flashing" wrong content
             setCurrentIndex(Math.max(0, displayCards.length - 2)); 
        }
        setIsFlipped(false);
    }
  };

  const handleDeleteCard = () => {
    if (!currentCard) return;
    if (window.confirm('Are you sure you want to delete this card?')) {
      const newCards = cards.filter(c => c.id !== currentCard.id);
      setCards(newCards);
      saveCards(newCards);
      
      // Adjust index
      if (effectiveIndex >= displayCards.length - 1) {
        setCurrentIndex(Math.max(0, displayCards.length - 2)); 
      }
      setIsFlipped(false);
    }
  };

  const handleEditCard = () => {
    if (currentCard) {
      setEditingCard(currentCard);
    }
  };

  const handleUpdateCard = (updatedCard: Card) => {
    const newCards = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
    setCards(newCards);
    saveCards(newCards);
    setEditingCard(null);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleSaveData = (newCards: Card[]) => {
    setCards(newCards);
    saveCards(newCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMode('study');
    setFilterMode('all');
  };

  const handleAppendData = (newCards: Card[]) => {
      const merged = [...cards, ...newCards];
      setCards(merged);
      saveCards(merged);
  };

  const handleReset = () => {
      if(window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        const defaultData = resetData();
        setCards(defaultData);
        setCurrentIndex(0);
        setIsFlipped(false);
        setFilterMode('all');
        setSelectedTag('');
      }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'study' || editingCard) return; // Disable keys while editing
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') setIsFlipped(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, mode, editingCard]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Layers size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">ReguFlash</h1>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('study')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'study' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen size={16} /> Study
            </button>
            <button
              onClick={() => setMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={16} /> List
            </button>
            <button
              onClick={() => setMode('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit3 size={16} /> Editor
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col">
        {mode === 'editor' ? (
          <div className="animate-in fade-in duration-300 h-full">
            <Editor 
                initialData={cards} 
                onSave={handleSaveData} 
                onAppend={handleAppendData}
                onReset={handleReset}
            />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <BookOpen size={32} className="text-slate-300" />
            </div>
            <p>No cards available.</p>
            <button 
              onClick={() => setMode('editor')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
            >
              <Edit3 size={16} /> Go to Editor to Add Data
            </button>
          </div>
        ) : (
          <>
            {/* STUDY MODE */}
            {mode === 'study' && (
              <div className="flex-1 flex flex-col justify-center items-center gap-6">
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                    {/* Proficiency Tabs */}
                    <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setFilterMode('all')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilterMode('new')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${filterMode === 'new' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-blue-50'}`}
                        >
                            <Circle size={12} className={filterMode === 'new' ? "text-white fill-current" : "text-blue-500"} />
                            New
                        </button>
                        <button 
                            onClick={() => setFilterMode('unknown')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${filterMode === 'unknown' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-amber-50'}`}
                        >
                            Review
                        </button>
                        <button 
                            onClick={() => setFilterMode('known')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${filterMode === 'known' ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-green-50'}`}
                        >
                            Mastered
                        </button>
                    </div>

                    {/* Tag Dropdown */}
                    {uniqueTags.length > 0 && (
                        <div className="relative">
                            <select 
                                value={selectedTag} 
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 cursor-pointer"
                            >
                                <option value="">All Tags</option>
                                {uniqueTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <Filter size={12} />
                            </div>
                        </div>
                    )}
                </div>

                {displayCards.length > 0 ? (
                    <>
                        {/* Progress Bar */}
                        <div className="w-full max-w-2xl flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
                                <span>Card {effectiveIndex + 1} of {displayCards.length}</span>
                                <span>{Math.round(((effectiveIndex + 1) / displayCards.length) * 100)}% of View</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                    style={{ width: `${((effectiveIndex + 1) / displayCards.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <Flashcard 
                            card={currentCard} 
                            isFlipped={isFlipped} 
                            onFlip={() => setIsFlipped(!isFlipped)}
                            onEdit={handleEditCard}
                            onDelete={handleDeleteCard}
                        />

                        {/* Controls */}
                        <div className="flex flex-col gap-4 w-full max-w-2xl">
                             <div className="flex items-center justify-between gap-4">
                                <button 
                                    onClick={handlePrev}
                                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                    title="Previous"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <button 
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="flex-1 h-12 px-6 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={18} className={isFlipped ? "rotate-180 transition-transform" : ""} />
                                    {isFlipped ? 'Show Question' : 'Show Answer'}
                                </button>

                                <button 
                                    onClick={handleNext}
                                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                    title="Next"
                                >
                                    <ArrowRight size={24} />
                                </button>
                            </div>

                            {/* Proficiency Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleMark('unknown')}
                                    className="h-10 rounded-lg border-2 border-amber-100 bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 hover:border-amber-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Need Review
                                </button>
                                <button 
                                    onClick={() => handleMark('known')}
                                    className="h-10 rounded-lg border-2 border-green-100 bg-green-50 text-green-700 font-semibold hover:bg-green-100 hover:border-green-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={16} /> I Know This
                                </button>
                            </div>
                        </div>

                        <button 
                        onClick={handleShuffle}
                        className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 mt-2 transition-colors"
                        >
                        <Shuffle size={14} /> Shuffle Queue
                        </button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Filter size={32} className="text-slate-300" />
                        </div>
                        <p>No cards match the current filter.</p>
                        <button 
                            onClick={() => { setFilterMode('all'); setSelectedTag(''); }}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Reset Filter to All
                        </button>
                    </div>
                )}
              </div>
            )}

            {/* LIST MODE */}
            {mode === 'list' && (
              <div className="animate-in fade-in duration-300">
                <CardList cards={cards} />
              </div>
            )}
          </>
        )}
        
        {/* Edit Modal */}
        {editingCard && (
          <EditCardModal 
            card={editingCard} 
            availableTags={uniqueTags}
            onSave={handleUpdateCard} 
            onCancel={() => setEditingCard(null)} 
          />
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 bg-white">
        <p>© 2024 ReguFlash. Content based on provided study materials.</p>
      </footer>
    </div>
  );
};

export default App;
