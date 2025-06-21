import { useState } from 'react';

interface CustomSelectProps {
  label?: string;
  options: string[];
  onSelect?: (option: string) => void;
}

export default function CustomSelect({
  label,
  options,
  onSelect,
}: CustomSelectProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div className="relative" style={{width:130}}>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center cursor-pointer"
      >
        <span>{selected || label}</span>
        <i
          className={`fa fa-chevron-down w-5 h-5 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded-lg w-full shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                selected === option ? 'bg-gray-100 text-black font-medium' : 'hover:bg-yellow-400 hover:text-white'
              }`}
            >
              <span>{option}</span>
              {selected === option && (
                <i className="fa fa-check text-green-500 ml-2" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
