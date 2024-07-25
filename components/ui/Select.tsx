// File: src/components/ui/Select.tsx

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, ...props }) => (
  <select {...props} className="border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
    {children}
  </select>
);

export const SelectOption: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = (props) => (
  <option {...props} />
);