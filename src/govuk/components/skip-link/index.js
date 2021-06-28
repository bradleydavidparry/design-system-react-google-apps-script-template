import React from 'react';

function SkipLink({ href="#main-content", text="Skip to main content", className, children, ...attributes }) {
  return (
    <a
      href={href}
      className={`govuk-skip-link ${className || ''}`}
      {...attributes}
    >
      {text}
    </a>
  );
}

export { SkipLink };
