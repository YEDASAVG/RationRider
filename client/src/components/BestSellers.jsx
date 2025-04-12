import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSellers = () => {
  const {products} = useAppContext()
  return (
    <div className='mt-16'>
        <p className='text-2xl md:text-3xl font-medium'>Best Sellers</p>
        <div className='flex flex-wrap gap-4 justify-center md:justify-between mt-6'>
          {products
            .filter((product) => product.inStock)
            .slice(0, 7)
            .map((product) => (
              <ProductCard key={product._id} product={product} />
          ))}
        </div>
    </div>
  )
}

export default BestSellers
