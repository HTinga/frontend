import React from 'react';

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';

  // Basic styling for the button. You can expand on this with different variants and sizes.
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Example variants (you can add more like 'outline', 'ghost', etc.)
  let variantStyles = '';
  switch (variant) {
    case 'destructive':
      variantStyles = 'bg-red-500 text-white hover:bg-red-600';
      break;
    case 'outline':
      variantStyles = 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      break;
    case 'secondary':
      variantStyles = 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      break;
    case 'ghost':
      variantStyles = 'hover:bg-accent hover:text-accent-foreground';
      break;
    case 'link':
      variantStyles = 'text-primary underline-offset-4 hover:underline';
      break;
    default: // 'default' or primary
      variantStyles = 'bg-blue-500 text-white hover:bg-blue-600';
      break;
  }

  // Example sizes
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'h-9 px-3';
      break;
    case 'lg':
      sizeStyles = 'h-11 px-8';
      break;
    case 'icon':
      sizeStyles = 'h-10 w-10';
      break;
    default: // 'default'
      sizeStyles = 'h-10 px-4 py-2';
      break;
  }

  return (
    <Comp
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
