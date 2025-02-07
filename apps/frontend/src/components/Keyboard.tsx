import React from 'react';

interface KeyProps {
  label: string;
  onPress: (key: string) => void;
  sizeMultiplier: number; // multiplier for size
}

const Key: React.FC<KeyProps> = ({ label, onPress, sizeMultiplier }) => {
  // Define a base width (in pixels) for the keys
  const baseWidth = 48; // for example, 48 pixels

  // Define an object to map the keys to their relative size factors
  const sizeFactors: { [key: string]: number } = {
    'Backspace': 2,
    'Tab': 1.5,
    'CapsLock': 2,
    'Enter': 2,
    'Shift': 2.5,
    'Ctrl': 1.5,
    'Win': 1.5,
    'Alt': 1.5,
    'Space': 4,
  };

  // Get the size factor for the key or default to 1
  const sizeFactor = sizeFactors[label] || 1;
  const width = baseWidth * sizeMultiplier * sizeFactor;

  return (
    <button 
      style={{ width: `${width}px` }}
      className="bg-gradient-to-t from-black/10 to-black/45 text-white font-bold  active:scale-95 rounded m-1 py-4 text-xl"
      onClick={() => onPress(label)}
      onMouseDown={e => e.preventDefault()} // Prevent focus on click
    >
      {label}
    </button>
  );
};

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  sizeMultiplier: number; // multiplier for size
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, sizeMultiplier }) => {
  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Ctrl']
  ];

  return (
    <div className="p-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2">
          {row.map((key) => (
            <Key key={key} label={key} sizeMultiplier={sizeMultiplier} onPress={onKeyPress} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;