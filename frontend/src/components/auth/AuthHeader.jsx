import React from 'react';

export function AuthHeader({ title, description }) {
  return (
    <div className="mb-8 text-center space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
