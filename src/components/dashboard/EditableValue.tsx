import { useState } from 'react';

interface EditableValueProps {
  field: string;
  value: number;
  allowNegative?: boolean;
  forceNegative?: boolean;
  showUSD?: boolean;
  exchangeRate?: number;
  onEdit: (field: string, value: number) => void;
}

export function EditableValue({ 
  field, 
  value, 
  allowNegative = false, 
  forceNegative = false, 
  showUSD = true,
  exchangeRate = 3.6725,
  onEdit 
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      onEdit(field, numValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-32 px-2 py-1 bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          autoFocus
          step="0.01"
        />
        <button
          onClick={handleSave}
          className="text-sm text-accent hover:text-accent/80"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-card/60 p-1 rounded transition-colors"
    >
      <p className={`text-lg font-bold ${(allowNegative && value < 0) || forceNegative ? 'text-red-400' : 'text-text-primary'}`}>
        AED {(forceNegative ? -value : value).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          signDisplay: forceNegative ? 'never' : (allowNegative ? 'exceptZero' : 'never') 
        })}
      </p>
      {showUSD && (
        <p className="text-sm text-text-secondary">
          USD {(convertToUSD(forceNegative ? -value : value)).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            signDisplay: forceNegative ? 'never' : (allowNegative ? 'exceptZero' : 'never')
          })}
        </p>
      )}
    </div>
  );
}
