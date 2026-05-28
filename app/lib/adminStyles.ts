export const topButtonClass =
  'inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

export const cardClass = 'bg-white border border-[#E5E5E7] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]'

export const buttonVariant = {
  primary: 'bg-[#027BFF] text-white hover:bg-[#0263CC]',
  secondary: 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]',
  ghost: 'bg-transparent text-[#1D1D1F] hover:bg-[#F5F5F7]',
} as const

export const buttonSize = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3',
} as const

export function badgeClass(variant: 'default' | 'success'): string {
  const base = 'px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider'
  if (variant === 'success') return `${base} bg-[#E4F2E6] text-[#248A3D]`
  return `${base} bg-[#F5F5F7] text-[#86868B]`
}
