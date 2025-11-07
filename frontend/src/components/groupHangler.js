import { useState, useEffect } from 'react';
import { getAllWords } from '../pages/api';

import {
  createWordGroup,
  getAllGroups,
  getWordsByGroup,
  removeWordFromGroup,
  renameGroup,
  deleteGroup,
  addWordToGroup,
} from '../pages/api';

export const useWords = () => {
  const [foreignWord, setForeignWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [editValues, setEditValues] = useState({ foreignWord: '', translatedWord: '' });

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const wordsFromServer = await getAllWords();
        setWords(wordsFromServer);
      } catch (error) {
        console.error('Failed to load words:', error);
      }
    };
    fetchWords();
  }, []);

  const fetchWordsAndGroups = async () => {
    try {
      const wordsFromServer = await getAllWords();
      setWords(wordsFromServer);
    } catch (error) {
      console.error('Failed to load words:', error);
    }
  };

  return {
    words,
    setWords,
    foreignWord,
    setForeignWord,
    translation,
    setTranslation,
    selectedWords,
    setSelectedWords,
    allSelected,
    setAllSelected,
    editingWord,
    setEditingWord,
    editValues,
    setEditValues,
    fetchWordsAndGroups,
  };
};

export const useGroups = () => {
  const [groupName, setGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [groupWordsMap, setGroupWordsMap] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedGroupWords, setSelectedGroupWords] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsFromServer = await getAllGroups();
        setGroups(groupsFromServer);
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    };
    fetchGroups();
  }, []);

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

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error('Failed to delete group:', error);
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
      setSelectedGroupWords(prev => ({
        ...prev,
        [groupId]: (prev[groupId] || []).filter(id => id !== wordId)
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
    const groupId = Number(selectedGroupId);
    if (!groupId) return;
    try {
      await addWordToGroup(groupId, wordId);
      console.log('Word added to group successfully');

      if (!expandedGroups.includes(groupId)) {
        await handleSelectGroup(groupId);
      } else {
        const updatedWords = await getWordsByGroup(groupId);
        setGroupWordsMap(prev => ({
          ...prev,
          [groupId]: updatedWords
        }));
      }
    } catch (error) {
      console.error('Failed to add word to group:', error);
    }
  };

  const fetchGroupWords = async (groupId) => {
    try {
      const wordsOfGroup = await getWordsByGroup(groupId);
      setGroupWordsMap(prev => ({
        ...prev,
        [groupId]: wordsOfGroup
      }));
    } catch (error) {
      console.error('Failed to fetch words for group:', error);
    }
  };

  return {
    groupName, setGroupName,
    selectedGroupId, setSelectedGroupId,
    groups, setGroups,
    editingGroupId, setEditingGroupId,
    editingGroupName, setEditingGroupName,
    groupWordsMap, setGroupWordsMap,
    expandedGroups, setExpandedGroups,
    selectedGroupWords, setSelectedGroupWords,
    handleAddGroup,
    handleSelectGroup,
    handleRenameGroup,
    handleRemoveWordFromGroup,
    toggleGroupWord,
    toggleSelectAllGroupWords,
    handleAddWordToGroup,
    handleDeleteGroup,
    fetchGroupWords,
  };
};