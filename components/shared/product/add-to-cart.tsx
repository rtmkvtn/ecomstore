'use client'

import { useTransition } from 'react'

import { Loader, Minus, Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions'
import { Cart, CartItem } from '@/types'

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter()
  const { toast } = useToast()

  const [isPending, startTransition] = useTransition()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
        return
      }

      toast({
        description: res.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push('/cart')}
          >
            Go To Cart
          </ToastAction>
        ),
      })
    })
  }

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)

      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      })
    })
  }

  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId)

  return existItem ? (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleRemoveFromCart}
        disabled={isPending}
      >
        <Minus className="h-4 w-4" />
      </Button>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <span className="w-4 text-center">{existItem.qty}</span>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddToCart}
        disabled={isPending}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <Button className="w-ull" type="button" onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add To Cart
    </Button>
  )
}
export default AddToCart
