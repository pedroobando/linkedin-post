'use client';

import { useState, type KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export const useInputTag = ({ onTagsChange, tags, maxTags }: Props) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      // Verificar si ya existe el tag
      if (tags.includes(inputValue.trim())) {
        setInputValue('');
        return;
      }

      // Verificar límite máximo de tags
      if (maxTags && tags.length >= maxTags) {
        return;
      }

      onTagsChange([...tags, inputValue.trim()]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Eliminar el último tag si presiona backspace con input vacío
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return {
    handleKeyDown,
    removeTag,
    inputValue,
    setInputValue,
  };
};
