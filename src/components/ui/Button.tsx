import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export function Button({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium rounded-sm transition-all duration-150 border-none outline-none cursor-pointer";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-light",
    secondary: "bg-surface text-text-primary hover:bg-[#F7F7F7]",
    outline: "bg-transparent text-primary border-[1.5px] border-primary hover:bg-accent-light",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface",
  };
  
  const sizes = {
    sm: "h-9 px-4 text-[13px] rounded-sm",
    md: "h-11 px-6 text-sm rounded-md",
    lg: "h-[52px] px-8 text-[15px] rounded-md",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
