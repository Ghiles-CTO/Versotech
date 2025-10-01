import { Brand, brands } from '@/lib/theme'

interface BrandHeaderProps {
  brand: Brand
  className?: string
}

export function BrandHeader({ brand, className = '' }: BrandHeaderProps) {
  const brandConfig = brands[brand]

  return (
    <div className={`flex items-center ${className}`}>
      <h1 className="text-xl font-bold text-black">
        {brandConfig.name}
      </h1>
    </div>
  )
}

