import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { deleteWords, getAllWords, saveWord, updateWord, createWordGroup, getAllGroups, getWordsByGroup, removeWordFromGroup, renameGroup, deleteGroup, addWordToGroup } from '../api.js';
import './HomePage.css';

const HomePage = () => {
  const [foreignWord, setForeignWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [words, setWords] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [editValues, setEditValues] = useState({ foreignWord: '', translatedWord: '' });
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [selectedGroupWords, setSelectedGroupWords] = useState({});

  useEffect(() => {
    const fetchWordsAndGroups = async () => {
      try {
        const wordsFromServer = await getAllWords();
        const groupsFromServer = await getAllGroups();
        setWords(wordsFromServer);
        setGroups(groupsFromServer);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    fetchWordsAndGroups();
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!foreignWord || !translation) return;

    try {
      const newWord = await saveWord({
        foreignWord,
        translatedWord: translation,
        groupId: selectedGroupId !== '' ? selectedGroupId : null
      });
      setWords([...words, newWord]);
      if (selectedGroupId && expandedGroups.includes(Number(selectedGroupId))) {
        const updatedGroupWords = await getWordsByGroup(selectedGroupId);
        setGroupWordsMap(prev => ({
          ...prev,
          [selectedGroupId]: updatedGroupWords
        }));
      }
      setForeignWord('');
      setTranslation('');
      setSelectedGroupId('');
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  const handleAddGroup = async () => {
    if (!groupName) return;
    try {
      const newGroup = await createWordGroup(groupName);
      if (!groups.some(g => g.id === newGroup.id)) {
        setGroups([...groups, newGroup]);
      }
      setGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const toggleSelectWord = (wordId) => {
    if (selectedWords.includes(wordId)) {
      setSelectedWords(selectedWords.filter(id => id !== wordId));
    } else {
      setSelectedWords([...selectedWords, wordId]);
    }
  };

  const toggleSelectAllWords = () => {
    if (allSelected) {
      setSelectedWords([]);
      setAllSelected(false);
    } else {
      const allIds = words.map(word => word.id);
      setSelectedWords(allIds);
      setAllSelected(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedWords.length === 0) return;
    try {
    await deleteWords(selectedWords);
      setWords(words.filter(word => !selectedWords.includes(word.id)));
      setSelectedWords([]);
    } catch (error) {
      console.error('Failed to delete selected words:', error);
    }
  };

  const handleUpdateSelected = () => {
    if (selectedWords.length === 0) return;

    const wordId = selectedWords[0];
    const wordToUpdate = words.find(w => w.id === wordId);
    if (!wordToUpdate) return;

    setEditingWord(wordToUpdate);
    setEditValues({ foreignWord: wordToUpdate.foreignWord, translatedWord: wordToUpdate.translatedWord });
  };

  const [groupWordsMap, setGroupWordsMap] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);

  const handleSelectGroup = async (groupId) => {
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== groupId));
      setGroupWordsMap(prev => {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      });
    } else {
      try {
        const wordsOfGroup = await getWordsByGroup(groupId);
        setGroupWordsMap(prev => ({
          ...prev,
          [groupId]: wordsOfGroup
        }));
        setExpandedGroups([...expandedGroups, groupId]);
      } catch (error) {
        console.error('Failed to load words for group:', error);
      }
    }
  };

  const handleRenameGroup = async (oldGroupName) => {
    try {
      await renameGroup(oldGroupName, editingGroupName);
      setGroups(groups.map(group =>
        group.name === oldGroupName ? { ...group, name: editingGroupName } : group
      ));
      setEditingGroupId(null);
      setEditingGroupName('');
    } catch (error) {
      console.error('Failed to rename group:', error);
    }
  };

  const handleRemoveWordFromGroup = async (wordId, groupId) => {
    try {
      await removeWordFromGroup(wordId);
      const updatedWords = await getWordsByGroup(groupId);
      setGroupWordsMap(prev => ({
        ...prev,
        [groupId]: updatedWords
      }));
    } catch (error) {
      console.error('Failed to remove word from group:', error);
    }
  };

  const toggleGroupWord = (groupId, wordId) => {
    setSelectedGroupWords(prev => {
      const current = prev[groupId] || [];
      return {
        ...prev,
        [groupId]: current.includes(wordId)
          ? current.filter(id => id !== wordId)
          : [...current, wordId]
      };
    });
  };

  const toggleSelectAllGroupWords = (groupId) => {
    const allWordIds = groupWordsMap[groupId].map(word => word.id);
    const allSelected = selectedGroupWords[groupId]?.length === allWordIds.length;

    setSelectedGroupWords(prev => ({
      ...prev,
      [groupId]: allSelected ? [] : allWordIds
    }));
  };

  const handleAddWordToGroup = async (wordId) => {
    if (!selectedGroupId) return;
    try {
      await addWordToGroup(selectedGroupId, wordId);
      console.log('Word added to group successfully');
    } catch (error) {
      console.error('Failed to add word to group:', error);
    }
  };

  return (
    <div className="page-container">
      <h2>Add Word</h2>
      <form className="add-word-form" onSubmit={handleAddWord}>
        <input
          type="text"
          placeholder="Foreign word"
          value={foreignWord}
          onChange={(e) => setForeignWord(e.target.value)}
        />
        <input
          type="text"
          placeholder="Translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
        />
        <select
          value={selectedGroupId || ''}
          onChange={(e) => setSelectedGroupId(e.target.value)}
        >
          <option value="">Select group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
      <h2>List of Words</h2>
      <table className="word-table" border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Foreign Word</th>
            <th>Translation</th>
        <th>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAllWords}
            title="Select all"
          />
        </th>
          </tr>
        </thead>
        <tbody>
          {words.map((word, index) => (
            <tr key={index}>
              <td>{word.foreignWord}</td>
              <td>{word.translatedWord}</td>
              <td>
                <input
                  type="checkbox"
                  checked={selectedWords.includes(word.id)}
                  onChange={() => toggleSelectWord(word.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="delete-button">
        <button onClick={handleDeleteSelected}>Delete</button>
      </div>
      
      {editingWord && (
        <div className="edit-word-form">
          <h3>Edit Word</h3>
          <input
            type="text"
            value={editValues.foreignWord}
            onChange={(e) => setEditValues({ ...editValues, foreignWord: e.target.value })}
            placeholder="Foreign word"
          />
          <input
            type="text"
            value={editValues.translatedWord}
            onChange={(e) => setEditValues({ ...editValues, translatedWord: e.target.value })}
            placeholder="Translation"
          />
          <button
            onClick={async () => {
              try {
                await updateWord({
                  id: editingWord.id,
                  foreignWord: editValues.foreignWord,
                  translatedWord: editValues.translatedWord
                });
                setWords(words.map(w =>
                  w.id === editingWord.id
                    ? { ...w, foreignWord: editValues.foreignWord, translatedWord: editValues.translatedWord }
                    : w
                ));
                setSelectedWords([]);
                setEditingWord(null);
                setEditValues({ foreignWord: '', translatedWord: '' });
              } catch (error) {
                console.error('Failed to update word:', error);
              }
            }}
          >
            Confirm Update
          </button>
        </div>
      )}
      <div className="update-button"> 
        <button onClick={handleUpdateSelected}>Update</button>
      </div>

      {groups.length > 0 && (
        <div className="add-to-group-button">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!selectedGroupId) return;
              try {
              await Promise.all(
                selectedWords.map((wordId) =>
                  addWordToGroup(selectedGroupId, wordId)
                )
              );
              
              if (expandedGroups.includes(Number(selectedGroupId))) {
                const updatedGroupWords = await getWordsByGroup(selectedGroupId);
                setGroupWordsMap(prev => ({
                  ...prev,
                  [selectedGroupId]: updatedGroupWords
                }));
              }
              } catch (error) {
                console.error('Failed to add words to group:', error);
              }
            }}
          >
            Add to Group
          </button>
        </div>
      )}

      <h2>Groups</h2>
      <div className="group-form">
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={handleAddGroup}>Add Group</button>
      </div>
      <div className="groups-list">
      {groups.map((group, idx) => (
          <div key={idx} className="group-item">
            <button
              className="group-button"
              onClick={() => handleSelectGroup(group.id)}
            >
              {editingGroupId === group.id ? (
                <input
                  type="text"
                  value={editingGroupName}
                  onChange={(e) => setEditingGroupName(e.target.value)}
                />
              ) : (
                group.name
              )}
            </button>
            <button
              className="delete-group-button"
              onClick={() => handleDeleteGroup(group.id)}
              title="Delete group"
            >
              ×
            </button>
            <button
              className="rename-group-button"
              onClick={() => {
                if (editingGroupId === group.id) {
                  handleRenameGroup(group.name);
                } else {
                  setEditingGroupId(group.id);
                  setEditingGroupName(group.name);
                }
              }}
              title="Rename group"
            >
              ✎
            </button>
            {expandedGroups.includes(group.id) && groupWordsMap[group.id] && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      selectedGroupWords[group.id]?.length === groupWordsMap[group.id].length
                    }
                    onChange={() => toggleSelectAllGroupWords(group.id)}
                  />
                  Select All
                </label>
                <ul className="group-word-list">
                  {groupWordsMap[group.id].map(word => (
                    <li key={word.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedGroupWords[group.id]?.includes(word.id) || false}
                          onChange={() => toggleGroupWord(group.id, word.id)}
                        />
                        {word.foreignWord} - {word.translatedWord}
                      </label>
                      <button
                        className="remove-from-group-button"
                        onClick={() => handleRemoveWordFromGroup(word.id, group.id)}
                        title="Remove word from group"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="practice-button">
        {(() => {
          const practiceIds = [
            ...selectedWords,
            ...Object.values(selectedGroupWords).flat()
          ];
          return (
            <Link
              to="/practice"
              state={{ selectedIds: practiceIds }}
            >
              <button>Start Practice</button>
            </Link>
          );
        })()}
      </div>
    </div>
  );
};

export default HomePage;