import React from "react";

interface ButtonPropTypes {
  label: string;
  onClick: Function;
  customClasses: string;
  children?: React.ReactNode;
  leftIconFlag?: boolean;
  disabled?: boolean;
}

const ButtonDefault = ({
  label,
  onClick,
  customClasses,
  children,
  leftIconFlag=false,
  disabled,
}: ButtonPropTypes) => {
  return (
    <>
      <button
        className={`inline-flex items-center justify-center text-center font-medium hover:bg-opacity-90 ${customClasses}`}
        onClick={()=>{onClick()}}
        disabled={disabled}
      >
        {leftIconFlag?children:<></>}
        {label}
        {leftIconFlag?<></>:children}
      </button>
    </>
  );
};

export default ButtonDefault;
