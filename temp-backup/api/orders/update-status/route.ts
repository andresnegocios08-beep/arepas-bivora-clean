import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { generateWhatsAppLink, generateStatusMessage } from '../../../lib/whatsapp'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID del pedido es requerido' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    const message = generateStatusMessage(order)
    const whatsappLink = generateWhatsAppLink(order.customerPhone, message)

    return NextResponse.json({ 
      order, 
      whatsappLink,
      message: 'Pedido actualizado. Enlace de WhatsApp generado.'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}