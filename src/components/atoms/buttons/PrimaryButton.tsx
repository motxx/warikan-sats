import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const PrimaryButton: React.FC<Props> = ({ children, onClick }) => {
  return (
    <button
      className="h-full w-full rounded bg-[#4597F7] hover:bg-[#55a7FF] text-white text-xs font-semibold px-4 py-2"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
