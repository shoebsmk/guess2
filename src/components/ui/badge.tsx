import React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>

export function Badge({ className = '', ...props }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white bg-gray-800 ${className}`} {...props} />
}
