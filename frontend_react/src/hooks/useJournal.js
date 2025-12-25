import { useState, useEffect } from 'react';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../services/journal';

export const useJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await getJournalEntries();
      setEntries(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const createEntry = async (data) => {
    const res = await createJournalEntry(data);
    setEntries(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateEntry = async (id, data) => {
    const res = await updateJournalEntry(id, data);
    setEntries(prev => prev.map(e => e.id === id ? res.data : e));
    return res.data;
  };

  const deleteEntry = async (id) => {
    await deleteJournalEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return { entries, loading, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
};