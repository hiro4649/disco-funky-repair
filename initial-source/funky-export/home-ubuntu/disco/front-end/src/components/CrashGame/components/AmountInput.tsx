import CurrencyIcon from "./CurrencyIcon";
import Input from "./Input";

type props = { 
    onChange: Function, 
    disabled?: boolean, 
    value: number, 
    className?: string, 
    label?: string, 
    amount?: number,
    maxAmount?: number,
    onMaxClick?: () => void
};

const AmountInput: React.FC<props> = ({ onChange, disabled, value, className, label, amount, maxAmount, onMaxClick }) => {
    const handleChange = (newValue: number) => {
        // Ensure the value never goes below 1
        const validatedValue = Math.max(1, newValue);
        onChange(validatedValue);
    };

    const handleMaxClick = () => {
        if (onMaxClick) {
            onMaxClick();
        } else if (maxAmount && maxAmount > 0) {
            onChange(Math.max(1, maxAmount));
        }
    };
    
    return (
    <div className="mt-2 flex flex-col">
        <div className="flex justify-between">
            <p className={`text-sm ${disabled ? "text-text_1" : "text-[#cccbcb]"}  font-bold`}>
                {label || "Amount"}
            </p>
            <div className="text-ms text-[#c7c7c7]">
                ${amount || 0}
            </div>
        </div>
        <div className="text-xs text-[#888] mb-1 flex justify-between">
            <span>Min: 1</span>
            {value === 1 && <span className="text-green-400">✓</span>}
            {maxAmount !== undefined && (
                <button
                    onClick={handleMaxClick}
                    disabled={disabled || !maxAmount || maxAmount <= 0}
                    className={`${maxAmount && maxAmount > 0 ? 'text-blue-400 hover:text-blue-300' : 'text-gray-400'} ${(disabled || !maxAmount || maxAmount <= 0) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    Max: ${maxAmount || 0}
                </button>
            )}
        </div>
        <div className={`flex bg-input_bg rounded overflow-hidden shadow-input ${className}`}>
            <Input onChange={(e: number) => handleChange(e)} value={value} disabled={disabled} type="number" icon={<CurrencyIcon />} />
            <div className="flex relative">
                <button
                    disabled={disabled}
                    onClick={() => handleChange(value / 2)}
                    className={`px-2 text-text_1 focus:outline-none ${disabled ? "cursor-not-allowed" : "hover:bg-input_hover"} ${disabled ? '' : 'active:scale-90 transform'}`}
                >
                    ½
                </button>
                <div className={`absolute w-[2px] bg-panel left-[46%] top-[20%] bottom-[25%] transform -translate-x-1/2`} />
                <button
                    disabled={disabled}
                    onClick={() => handleChange(value * 2)}
                    className={`px-2 text-text_1 focus:outline-none ${disabled ? "cursor-not-allowed" : "hover:bg-input_hover"} ${disabled ? '' : 'active:scale-90 transform'}`}
                >
                    2×
                </button>
            </div>
        </div>
    </div>
    );
};


export default AmountInput;