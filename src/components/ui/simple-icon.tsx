import React from 'react';
import * as SimpleIcons from 'simple-icons-react';

interface SimpleIconProps {
  name: keyof typeof SimpleIcons;
  size?: number;
  color?: string;
  className?: string;
}

export function SimpleIcon({ name, size = 24, color, className = '' }: SimpleIconProps) {
  const IconComponent = SimpleIcons[name];
  
  if (!IconComponent) {
    console.error(`Icon "${name}" not found in simple-icons`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      style={{ color }}
      className={className}
    />
  );
}
