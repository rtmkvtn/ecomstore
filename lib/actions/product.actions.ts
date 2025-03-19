'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/db/prisma'
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '@/lib/constants'
import { convertToPlainObject, formatError } from '@/lib/utils'

// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return convertToPlainObject(data)
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  })
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string
  limit?: number
  page: number
  category?: string
}) {
  const data = await prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
  })

  const dataCount = await prisma.product.count()

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({ where: { id } })
    if (!productExists) throw new Error(`Product is not found`)

    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/products')

    return { success: true, message: 'Product deleted successfully.' }
  } catch (e) {
    return { success: false, message: formatError(e) }
  }
}
