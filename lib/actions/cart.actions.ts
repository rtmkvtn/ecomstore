'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { convertToPlainObject, formatError, round2 } from '@/lib/utils'
import { cartItemSchema, insertCartSchema } from '@/lib/validators'
import { CartItem } from '@/types'

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, x) => {
      return acc + Number(x.price) * x.qty
    }, 0)
  )

  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10)
  const taxPrice = round2(0.15 * itemsPrice)
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export async function addItemToCart(data: CartItem) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value

    if (!sessionCartId) {
      throw new Error('Could not find cart')
    }

    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    const cart = await getMyCart()

    const item = cartItemSchema.parse(data)

    // Find product in DB
    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    })

    if (!product) {
      throw new Error('Could not find product')
    }

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...calcPrice([item]),
      })

      await prisma.cart.create({
        data: newCart,
      })

      //Revalidate page
      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`,
      }
    } else {
      // Check if item is already in the cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      )

      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error('Not enough stock')
        }

        // Increase the quantity
        ;(cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1
      } else {
        // If item does not exist in cart
        // Check stock
        if (product.stock < 1) {
          throw new Error('Not enough stock')
        }

        // Add item to the cart.items
        cart.items.push(item)
      }

      //Save to DB
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      })

      revalidatePath(`/product/${product.slug}`)

      return {
        success: true,
        message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
      }
    }
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    }
  }
}

export async function getMyCart() {
  // Check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value

  if (!sessionCartId) {
    throw new Error('Could not find cart')
  }

  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  // Get user cart from DB
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId: sessionCartId },
  })

  if (!cart) {
    return undefined
  }

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  })
}

export async function removeItemFromCart(productId: string) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) {
      throw new Error('Could not find cart')
    }

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    })
    if (!product) {
      throw new Error('Product not found')
    }

    //Get user cart
    const cart = await getMyCart()
    if (!cart) {
      throw new Error('Cart not found')
    }

    // Check for item
    const exist = cart.items.find((x) => x.productId === productId)
    if (!exist) {
      throw new Error('Item not found')
    }

    // Check if only one in qty
    if (exist.qty === 1) {
      //Remove from the cart
      cart.items = cart.items.filter((x) => x.productId !== productId)
    } else {
      // Decrease the qty
      cart.items.find((x) => x.productId === productId)!.qty = exist.qty - 1
    }
    // Update DB
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    })

    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message: `${product.name} removed from cart`,
    }
  } catch (e) {
    return {
      success: false,
      message: formatError(e),
    }
  }
}
