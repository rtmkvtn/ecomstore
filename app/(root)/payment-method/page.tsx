import { Metadata } from 'next'

import PaymentMethodForm from '@/app/(root)/payment-method/payment-method-form'
import { auth } from '@/auth'
import CheckoutSteps from '@/components/shared/checkout-steps'
import { getUserById } from '@/lib/actions/user.actions'

export const metadata: Metadata = {
  title: 'Select Payment Method',
}

const PaymentMethodPage = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('User not found')
  }

  const user = await getUserById(userId)

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  )
}
export default PaymentMethodPage
