import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'white';
  size?: 'default' | 'lg';
  asChild?: boolean;
}

export function Button({ 
  className = '', 
  variant = 'primary', 
  size = 'default', 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-1.5 font-medium rounded-pill transition-all duration-150 border-none outline-none cursor-pointer";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-light",
    ghost: "bg-transparent text-text-secondary border border-border hover:text-text-primary hover:border-text-muted",
    outline: "bg-transparent text-accent border-[1.5px] border-accent hover:bg-accent-dim",
    white: "bg-white text-accent hover:bg-surface",
  };
  
  const sizes = {
    default: "text-sm px-[18px] py-[9px]",
    lg: "text-base px-[28px] py-[13px]",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
