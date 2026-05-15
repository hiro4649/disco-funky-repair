import React from "react";

type props = {
    onChange?: Function;
    value: number;
    disabled?: boolean;
    type?: string;
    icon?: React.ReactNode;
    className?: string;
};

const Input: React.FC<props> = ({ onChange, value, disabled, type = "number", icon, className }) => {
    return (
        <div className={`flex items-center bg-input_bg ${className || ''}`}>
            {icon && <div className="px-2 text-text_1">{icon}</div>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
                disabled={disabled}
                className="flex-1 bg-transparent text-white px-2 py-2 focus:outline-none"
                placeholder="0"
            />
        </div>
    );
};

export default Input;
