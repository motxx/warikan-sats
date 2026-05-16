import { IonButton } from "@ionic/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export const PrimaryButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}) => {
  const isSecondary = variant === "secondary";

  return (
    <IonButton
      color={isSecondary ? "light" : "primary"}
      fill={isSecondary ? "outline" : "solid"}
      className={`m-0 min-h-12 w-full text-sm font-bold ${
        isSecondary ? "text-[#354036]" : ""
      }`}
      style={{
        textTransform: "none",
        "--border-radius": "14px",
        "--border-width": isSecondary ? "1px" : "0",
        "--border-color": "#c5d0c1",
      } as React.CSSProperties}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </IonButton>
  );
};
