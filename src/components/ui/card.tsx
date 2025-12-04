import React from 'react'

type BaseProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className = '', ...props }: BaseProps) {
  return <div className={`rounded-lg border bg-white ${className}`} {...props} />
}

export function CardHeader({ className = '', ...props }: BaseProps) {
  return <div className={`p-6 border-b ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: BaseProps) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props} />
}

export function CardDescription({ className = '', ...props }: BaseProps) {
  return <p className={`text-sm text-gray-600 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: BaseProps) {
  return <div className={`p-6 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: BaseProps) {
  return <div className={`p-6 border-t ${className}`} {...props} />
}
