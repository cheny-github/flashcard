
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { Save, X, Plus, Check } from 'lucide-react';

interface EditCardModalProps {
  card: Card;
  availableTags?: string[];
  onSave: (updatedCard: Card) => void;
  onCancel: () => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({ card, availableTags = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState<Card>({ ...card });
  const [detailsText, setDetailsText] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (card.details) {
      setDetailsText(card.details.join('\n'));
    }
    if (card.tags) {
      setTagsText(card.tags.join(', '));
    }
  }, [card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Process details from textarea back to array
    const detailsArray = detailsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Process tags
    const tagsArray = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSave({
      ...formData,
      details: detailsArray.length > 0 ? detailsArray : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined
    });
  };

  const toggleTag = (tag: string) => {
    const currentTags = tagsText.split(',').map(t => t.trim()).filter(t => t.length > 0);
    let newTags: string[];
    
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter(t => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    
    setTagsText(newTags.join(', '));
  };

  // Parse current tags to check active state for badges
  const activeTagsSet = new Set(tagsText.split(',').map(t => t.trim()));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Edit Card
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. difficult, chapter1, important"
              className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm"
            />
            {availableTags.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 mb-1.5 uppercase font-medium">Quick Select Existing Tags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => {
                    const isActive = activeTagsSet.has(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-all
                          ${isActive 
                            ? 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        {isActive ? <Check size={10} /> : <Plus size={10} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Answer</label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Details (One per line)</label>
            <textarea
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              rows={4}
              placeholder="Bullet point 1&#10;Bullet point 2"
              className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm resize-none font-mono"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
