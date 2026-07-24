import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const products = await prisma.product.findMany({
      where: { isAvailable: true }
    })

    return NextResponse.json({ orders, products })
  } catch (error) {
    console.error('Error en admin-data:', error)
    return NextResponse.json(
      { error: 'Error al cargar datos' },
      { status: 500 }
    )
  }
}