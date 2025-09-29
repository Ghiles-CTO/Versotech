import { Brand, brands } from '@/lib/theme'

interface BrandHeaderProps {
  brand: Brand
  className?: string
}

export function BrandHeader({ brand, className = '' }: BrandHeaderProps) {
  const brandConfig = brands[brand]
  
  return (
    <div className={`flex items-center space-x-4 group ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <span className="text-white font-bold text-lg">V</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-900 group-hover:to-blue-700 transition-all duration-300">
          {brandConfig.name}
        </h1>
        <p className="text-xs text-muted-foreground group-hover:text-gray-600 transition-colors duration-300">
          {brand === 'versoholdings' ? 'Investor Portal' : 'Operations Portal'}
        </p>
      </div>
    </div>
  )
}

