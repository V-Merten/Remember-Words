export const getPracticeWords = async (ids) => {
    const response = await fetch(`/api/practice?ids=${ids.join(',')}`);
    if (!response.ok) throw new Error('Error loading words');
    return await response.json();
  };
  
export const checkPracticeAnswer = async ({ id, userWord, direction }) => {
    console.log('Sending practice answer:', { id, userWord, direction });
    const response = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        userWord,
        direction
      })
    });
    if (!response.ok) throw new Error('Error while checking words');
    return await response.json();
  };

export const saveWord = async ({ foreignWord, translatedWord, groupId }) => {
    const response = await fetch(`/api/${foreignWord}/${translatedWord}/${groupId}`, {
      method: 'POST'
    });
  
    if (!response.ok) throw new Error('Failed to save word');
    return await response.json();
  };

export const getAllWords = async () => {
  const response = await fetch('/api', {
    method: 'GET'
  });
  if (!response.ok) throw new Error('Failed to load words');
  return await response.json();
};

export const deleteWords = async (ids) => {
  for (const id of ids) {
    const response = await fetch(`/api/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete word');
  }
};

export const updateWord = async ({ id, foreignWord, translatedWord }) => {
  const response = await fetch('/api', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, foreignWord, translatedWord })
  });
  if (!response.ok) throw new Error('Failed to update word');
};

export const createWordGroup = async (groupName) => {
  const response = await fetch(`/api/word-groups/${groupName}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to create group');
  return await response.json();
};

export const getAllGroups = async () => {
    const response = await fetch('/api/word-groups/groups', {
      method: 'GET'
    });
    if (!response.ok) throw new Error('Failed to load groups');
    return await response.json();
  };

export const getWordsByGroup = async (groupId) => {
    const response = await fetch(`/api/word-groups/words?groupId=${groupId}`, {
      method: 'GET'
    });
    if (!response.ok) throw new Error('Failed to load group words');
    return await response.json();
  };

export const deleteGroup = async (groupId) => {
    const response = await fetch(`/api/word-groups/deleteGroup/${groupId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete group');
};

export const renameGroup = async (oldGroupName, newGroupName) => {
    const response = await fetch(`/api/word-groups/rename/${oldGroupName}/${newGroupName}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to rename group');
};

export const removeWordFromGroup = async (wordId) => {
    const response = await fetch(`/api/word-groups/delete/${wordId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove word from group');
};

export const addWordToGroup = async (groupId, wordId) => {
    const response = await fetch(`/api/word-groups/addToGroup/${groupId}/${wordId}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to add word to group');
  };
