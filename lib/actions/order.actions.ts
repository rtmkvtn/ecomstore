'use server'

// Create order and create order items
import { isRedirectError } from 'next/dist/client/components/redirect-error'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { convertToPlainObject, formatError } from '@/lib/utils'
import { cartItemSchema, insertOrderSchema } from '@/lib/validators'
import { CartItem } from '@/types'

export async function createOrder() {
  try {
    const session = await auth()
    if (!session) throw new Error('User is not authenticated')

    const cart = await getMyCart()
    const userId = session?.user?.id
    if (!userId) throw new Error('User not found')

    const user = await getUserById(userId)

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        onmessage: 'Your cart is empty',
        redirectTo: '/cart',
      }
    }
    if (!user.address) {
      return {
        success: false,
        onmessage: 'No shipping address',
        redirectTo: '/shipping-address',
      }
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        onmessage: 'No payment method',
        redirectTo: '/payment-method',
      }
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    })

    // Create a transaction to create order and order items in DB
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order })
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        })
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      })
      return insertedOrder.id
    })

    if (!insertedOrderId) throw new Error('Order not created')

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    }
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { success: false, message: formatError(e) }
  }
}

// Get order by ID
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  })

  return convertToPlainObject(data)
}
