import { Slot } from '@radix-ui/react-slot'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes } from 'react'
// shadcn/ui ownership pattern: local, accessible Radix primitive, editable styles.
export function Button({asChild=false,className,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{asChild?:boolean}){const Comp=asChild?Slot:'button';return <Comp className={twMerge(clsx('btn',className))} {...props}/>}
