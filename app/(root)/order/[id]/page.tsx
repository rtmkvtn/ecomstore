import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import OrderDetailsTable from '@/app/(root)/order/[id]/order-details-table'
import { auth } from '@/auth'
import { getOrderById } from '@/lib/actions/order.actions'
import { ShippingAddress } from '@/types'

export const metadata: Metadata = {
  title: 'Order Details',
}

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {
  const { id } = await props.params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  )
}
export default OrderDetailsPage
