import React from 'react';

interface KeyProps {
  label: string;
  onPress: (key: string) => void;
  size?: string;
}

const Key: React.FC<KeyProps> = ({ label, onPress, size }) => {
  return (
    <button 
      className={`bg-blue-500 text-white font-bold py-2 px-4 active:scale-95 rounded m-1 ${size ? size : 'w-12'}`}
      onClick={() => onPress(label)}
      onMouseDown={e => e.preventDefault()} // Prevent focus on click
    >
      {label}
    </button>
  );
};

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  const rows = [
    [
      { key: '`' }, { key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }, { key: '5' }, { key: '6' }, { key: '7' }, { key: '8' }, { key: '9' }, { key: '0' }, { key: '-' }, { key: '=' }, { key: 'Backspace', size: 'w-28' }
    ],
    [
      { key: 'Tab', size: 'w-20' }, { key: 'Q' }, { key: 'W' }, { key: 'E' }, { key: 'R' }, { key: 'T' }, { key: 'Y' }, { key: 'U' }, { key: 'I' }, { key: 'O' }, { key: 'P' }, { key: '[' }, { key: ']' }, { key: '\\' }
    ],
    [
      { key: 'CapsLock', size: 'w-24' }, { key: 'A' }, { key: 'S' }, { key: 'D' }, { key: 'F' }, { key: 'G' }, { key: 'H' }, { key: 'J' }, { key: 'K' }, { key: 'L' }, { key: ';' }, { key: '\'' }, { key: 'Enter', size: 'w-28' }
    ],
    [
      { key: 'Shift', size: 'w-32' }, { key: 'Z' }, { key: 'X' }, { key: 'C' }, { key: 'V' }, { key: 'B' }, { key: 'N' }, { key: 'M' }, { key: ',' }, { key: '.' }, { key: '/' }, { key: 'Shift', size: 'w-32' }
    ],
    [
      { key: 'Ctrl', size: 'w-20' }, { key: 'Win', size: 'w-20' }, { key: 'Alt', size: 'w-20' }, { key: 'Space', size: 'w-64' }, { key: 'Alt', size: 'w-20' }, { key: 'Ctrl', size: 'w-20' }
    ]
  ];

  return (
    <div className="p-4 scale-150">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2">
          {row.map(({ key, size }) => (
            <Key key={key} label={key} size={size} onPress={onKeyPress} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;