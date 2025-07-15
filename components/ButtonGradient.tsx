"use client";

import React from "react";

const ButtonGradient = ({
  title = "Gradient Button",
  onClick = () => { },
  type = "button",
  disabled = false,
}: {
  title?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) => {
  return (
    <button
      className="btn btn-gradient animate-shimmer"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {title}
    </button>
  );
};

export default ButtonGradient;
