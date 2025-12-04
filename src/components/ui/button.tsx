import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
}

export function Button({ className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
