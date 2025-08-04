import { saveWord, deleteWords, updateWord, getAllWords } from '../pages/api';

export const useWordsFunctions = (setWords, setForeignWord, setTranslation, setSelectedWords, setAllSelected, setEditingWord, setEditValues) => {
  const handleAddWord = async (foreignWordInput, translationInput, groupId) => {
    if (!foreignWordInput || !translationInput) return;
    try {
      const newWord = await saveWord({
        foreignWord: foreignWordInput,
        translatedWord: translationInput,
        groupId: groupId !== '' ? groupId : null
      });
      setWords(prev => [...prev, newWord]);
      setForeignWord('');
      setTranslation('');
      return newWord;
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  const toggleSelectWord = (selectedWords, setSelectedWords, wordId) => {
    setSelectedWords(prev =>
      prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]
    );
  };

  const toggleSelectAllWords = (words, selectedWords, setSelectedWords, setAllSelected) => {
    if (selectedWords.length === words.length) {
      setSelectedWords([]);
      setAllSelected(false);
    } else {
      const allIds = words.map(word => word.id);
      setSelectedWords(allIds);
      setAllSelected(true);
    }
  };

  const handleDeleteSelected = async (selectedWords, setWords, words, setSelectedWords, setEditingWord, setEditValues, editingWord) => {
    if (selectedWords.length === 0) return;
    try {
      await deleteWords(selectedWords);
      setWords(words.filter(word => !selectedWords.includes(word.id)));
      setSelectedWords([]);

      if (editingWord && selectedWords.includes(editingWord.id)) {
        setEditingWord(null);
        setEditValues({ foreignWord: '', translatedWord: '' });
      }

    } catch (error) {
      console.error('Failed to delete selected words:', error);
    }
  };

  const handleUpdateSelected = (selectedWords, words, setEditingWord, setEditValues) => {
    if (selectedWords.length === 0) return;
    const wordId = selectedWords[0];
    const wordToUpdate = words.find(w => w.id === wordId);
    if (!wordToUpdate) return;
    setEditingWord(wordToUpdate);
    setEditValues({ foreignWord: wordToUpdate.foreignWord, translatedWord: wordToUpdate.translatedWord });
  };

  return {
    handleAddWord,
    toggleSelectWord,
    toggleSelectAllWords,
    handleDeleteSelected,
    handleUpdateSelected
  };
};
