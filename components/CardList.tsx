
import React from 'react';
import { Card } from '../types';
import { CheckCircle, AlertCircle, Circle, Tag } from 'lucide-react';

interface CardListProps {
  cards: Card[];
}

export const CardList: React.FC<CardListProps> = ({ cards }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-16">Status</th>
              <th className="px-6 py-3 w-32">Category & Tags</th>
              <th className="px-6 py-3">Question</th>
              <th className="px-6 py-3">Answer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 align-top">
                    {card.proficiency === 'known' && <CheckCircle size={18} className="text-green-500" />}
                    {card.proficiency === 'unknown' && <AlertCircle size={18} className="text-amber-500" />}
                    {(!card.proficiency || card.proficiency === 'new') && <Circle size={18} className="text-slate-300" />}
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-semibold text-slate-700 whitespace-nowrap mb-1">{card.category}</div>
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                           <Tag size={8} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-800 align-top">{card.question}</td>
                <td className="px-6 py-4 text-slate-600 align-top">
                  <div className="font-medium">{card.answer}</div>
                  {card.details && (
                    <ul className="mt-1 list-disc list-inside text-xs text-slate-500">
                      {card.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
