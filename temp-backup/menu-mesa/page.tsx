'use client'

import { useState, useEffect } from 'react'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  ingredients: string[]
}

export default function MenuMesaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error cargando productos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando menú...</p>
      </div>
    )
  }

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category
    if (!acc[category]) acc[category] = []
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const categoryNames: Record<string, string> = {
    'arepas-clasicas': '🥇 Arepas Clásicas',
    'arepas-especiales': '⭐ Arepas Especiales',
    'acompanantes': '🍟 Acompañantes',
    'bebidas': '🥤 Bebidas'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white py-6 text-center">
        <h1 className="text-3xl font-bold">🥙 Arepas Mixtas La Bívora</h1>
        <p className="text-lg mt-1">Menú Digital</p>
        <p className="text-sm mt-1">📍 Entrada a La, Amalfi, Antioquia</p>
        <p className="text-sm">📱 312 6621391</p>
      </div>

      <div className="container mx-auto px-4 py-6">
        {Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-orange-300 pb-2">
              {categoryNames[category] || category}
            </h2>
            
            <div className="space-y-3">
              {items.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.ingredients.slice(0, 4).map((ingredient, i) => (
                          <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xl font-bold text-orange-600">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-600 text-white text-center py-4 text-sm">
        <p>📱 Escanea el QR para hacer tu pedido</p>
        <p className="text-xs mt-1">© 2024 Arepas Mixtas La Bívora</p>
      </div>
    </div>
  )
}