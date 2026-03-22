'use client';

import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export const useInputTagGroup = ({ onTagsChange, tags, maxTags }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const tagsRef = useRef(tags);
  
  // Update the ref when tags change
  tagsRef.current = tags;

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const currentTags = tagsRef.current;
    
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      const trimmedTag = inputValue.trim();

      // Check if tag already exists (case-insensitive for better UX)
      if (currentTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
        setInputValue('');
        return;
      }

      // Check maximum tags limit
      if (maxTags && currentTags.length >= maxTags) {
        return;
      }

      onTagsChange([...currentTags, trimmedTag]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      // Remove last tag if backspace is pressed with empty input
      onTagsChange(currentTags.slice(0, -1));
    }
  }, [inputValue, maxTags, onTagsChange]);

  const removeTag = useCallback((indexToRemove: number) => {
    const currentTags = tagsRef.current;
    onTagsChange(currentTags.filter((_, index) => index !== indexToRemove));
  }, [onTagsChange]);

  return {
    handleKeyDown,
    removeTag,
    inputValue,
    setInputValue,
  };
};