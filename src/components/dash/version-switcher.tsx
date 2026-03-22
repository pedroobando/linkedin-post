'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VersionSwitcherProps {
  versions?: string[];
  defaultVersion?: string;
  onVersionChange?: (version: string) => void;
}

export function VersionSwitcher({
  versions = ['v1.0.0', 'v1.1.0', 'v2.0.0'],
  defaultVersion = 'v1.0.0',
  onVersionChange,
}: VersionSwitcherProps) {
  return (
    <Select defaultValue={defaultVersion} onValueChange={onVersionChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Versión" />
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem key={version} value={version}>
            {version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
