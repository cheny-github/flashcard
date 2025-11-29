import { Card } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'reguflash_data_v1';

export const saveCards = (cards: Card[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards', e);
  }
};

export const loadCards = (): Card[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load cards', e);
  }
  return INITIAL_DATA;
};

export const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    return INITIAL_DATA;
}
