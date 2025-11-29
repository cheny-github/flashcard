
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { Save, RotateCcw, AlertTriangle, CheckCircle, PlusCircle, Trash2, X, Sparkles } from 'lucide-react';

interface EditorProps {
  initialData: Card[];
  onSave: (data: Card[]) => void;
  onAppend: (data: Card[]) => void;
  onReset: () => void;
}

const AI_PROMPT_TEMPLATE = `I need you to convert study notes into a specific JSON structure for a flashcard app.
Please output ONLY a valid JSON array. Do not wrap it in markdown code blocks (no \`\`\`json).

The schema for each object in the array is:
{
  "category": "String (Short topic name)",
  "question": "String (The question)",
  "answer": "String (The main answer)",
  "details": ["String", "String"], // Optional: Array of strings for bullet points or lists
}

Example:
[
  {
    "category": "History",
    "question": "Who was the first president of the USA?",
    "answer": "George Washington",
    "details": ["Served from 1789 to 1797", "Commander-in-Chief of the Continental Army"],
  }
]

Please convert the following text into this JSON format:

[PASTE YOUR CONTENT HERE]`;

export const Editor: React.FC<EditorProps> = ({ initialData, onSave, onAppend, onReset }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showAppendModal, setShowAppendModal] = useState(false);
  const [appendText, setAppendText] = useState('');
  const [appendError, setAppendError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(initialData, null, 2));
  }, [initialData]);

  const generateId = () => {
    // Fallback for environments where crypto.randomUUID might not be available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const parseAndValidate = (text: string): Card[] => {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("Data must be an array");
    
    // Basic validation
    const isValid = parsed.every(item => item.question && item.answer);
    if (!isValid) throw new Error("Each card must have a question and answer.");
    
    // Normalize IDs and Tags
    return parsed.map((item: any) => ({
        ...item,
        id: item.id || generateId(), // Generate ID if missing
        proficiency: item.proficiency || 'new',
        tags: Array.isArray(item.tags) ? item.tags : undefined
    }));
  };

  const handleSave = () => {
    try {
      const data = parseAndValidate(jsonText);
      onSave(data);
      showSuccess("Data replaced successfully!");
    } catch (e: any) {
      setError(e.message);
      setSuccessMsg(null);
    }
  };

  const handleAppendSubmit = () => {
    try {
      const data = parseAndValidate(appendText);
      onAppend(data);
      setShowAppendModal(false);
      setAppendText('');
      setAppendError(null);
      showSuccess(`Successfully appended ${data.length} new cards!`);
    } catch (e: any) {
      setAppendError(e.message);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_TEMPLATE).then(() => {
        showSuccess("AI Prompt copied to clipboard! Paste it into ChatGPT/Gemini.");
    }).catch(() => {
        setError("Failed to copy to clipboard");
    });
  };

  const showSuccess = (msg: string) => {
    setError(null);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col gap-4 relative">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Data Editor</h2>
          <p className="text-slate-500 text-sm">Edit existing cards or append new ones.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={() => setJsonText('')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Clear text area"
          >
            <Trash2 size={16} /> Clear
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            title="Copy a prompt to generate JSON from text using AI"
          >
            <Sparkles size={16} /> Copy AI Prompt
          </button>
           <button 
            onClick={() => setShowAppendModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <PlusCircle size={16} /> Append Data
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-100">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <textarea 
        className="flex-1 w-full font-mono text-sm bg-slate-900 text-slate-100 p-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        spellCheck={false}
        placeholder='[ {"question": "...", "answer": "..."} ]'
        style={{ minHeight: '500px' }}
      />

      {/* Append Modal */}
      {showAppendModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-purple-600" /> 
                Append New Cards
              </h3>
              <button onClick={() => setShowAppendModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <p className="text-sm text-slate-600">
                Paste the new JSON array below. IDs will be generated automatically if missing.
              </p>
              
              {appendError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                   <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                   <span>{appendError}</span>
                </div>
              )}

              <textarea 
                className="w-full h-64 font-mono text-sm bg-slate-900 text-slate-100 p-4 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                placeholder='[ {"category": "Basic", "question": "New Question", "answer": "New Answer"} ]'
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowAppendModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAppendSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
              >
                Confirm Append
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
