'use client'

import { Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { addItemToCart } from '@/lib/actions/cart.actions'
import { CartItem } from '@/types'

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter()
  const { toast } = useToast()

  const handleAddToCart = async () => {
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
  }

  return (
    <Button className="w-ull" type="button" onClick={handleAddToCart}>
      <Plus />
      Add To Cart
    </Button>
  )
}
export default AddToCart
