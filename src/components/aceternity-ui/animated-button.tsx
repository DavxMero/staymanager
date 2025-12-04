"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconBaseProps } from "react-icons";

interface AnimatedButtonProps {
  children: React.ReactNode;
  icon?: React.ComponentType<IconBaseProps>;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  icon: Icon,
  onClick,
  className = "",
  variant = "primary",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      case "outline":
        return "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${getVariantStyles()} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};