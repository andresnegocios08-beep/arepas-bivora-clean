 
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { notFound } from 'next/navigation'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const statusMap: Record<string, { label: string; emoji: string; color: string }> = {
  'pending': { label: 'Pendiente', emoji: '⏳', color: 'text-yellow-600' },
  'confirmed': { label: 'Confirmado', emoji: '✅', color: 'text-blue-600' },
  'preparing': { label: 'En preparación', emoji: '👨‍🍳', color: 'text-purple-600' },
  'ready': { label: 'Listo para entregar', emoji: '📦', color: 'text-green-600' },
  'delivered': { label: 'Entregado', emoji: '🚚', color: 'text-gray-600' },
  'cancelled': { label: 'Cancelado', emoji: '❌', color: 'text-red-600' }
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  const statusInfo = statusMap[order.status] || statusMap['pending']

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            🥙 Pedido {order.orderNumber}
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-gray-600 font-medium">Estado:</span>
            <span className={`text-xl font-bold ${statusInfo.color}`}>
              {statusInfo.emoji} {statusInfo.label}
            </span>
          </div>

          <div className="space-y-2 border-b pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            {order.customerAddress && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium text-right">{order.customerAddress}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Fecha:</span>
              <span>{new Date(order.createdAt).toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Detalle del pedido:</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{item.quantity}x</span>
                  <span className="ml-2">{item.product.name}</span>
                  {item.customizationDetails && (
                    <div className="text-xs text-gray-500 mt-1">
                      🎨 {typeof item.customizationDetails === 'string' 
                        ? item.customizationDetails 
                        : JSON.stringify(item.customizationDetails)}
                    </div>
                  )}
                </div>
                <span className="font-bold">${item.totalPrice.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-orange-600">${order.total.toLocaleString('es-CO')}</span>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-center text-sm text-yellow-800">
              💰 El pago se realiza en efectivo al recibir tu pedido
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">
              📱 Guarda este número para hacer seguimiento
            </p>
          </div>

          <div className="mt-4">
            <a
              href={`https://wa.me/573126621391?text=Hola!%20Quiero%20consultar%20sobre%20mi%20pedido%20${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-center transition-colors"
            >
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}