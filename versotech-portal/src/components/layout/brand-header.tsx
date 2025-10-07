import { Brand, brands } from '@/lib/theme'

interface BrandHeaderProps {
  brand: Brand
  className?: string
}

export function BrandHeader({ brand, className = '' }: BrandHeaderProps) {
  const brandConfig = brands[brand]
  const isStaff = brand === 'versotech'

  return (
    <div className={`flex items-center ${className}`}>
      <h1 className={`text-xl font-bold ${isStaff ? 'text-foreground' : 'text-black'}`}>
        {brandConfig.name}
      </h1>
    </div>
  )
}

