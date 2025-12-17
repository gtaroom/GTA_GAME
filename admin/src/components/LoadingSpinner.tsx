import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "blue",
}) => {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-500 border-t-transparent",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      } rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
