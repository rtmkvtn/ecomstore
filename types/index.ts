import { z } from 'zod'

import { insertProductSchema } from '@/lib/validators'

export type IProduct = z.infer<typeof insertProductSchema> & {
  id: string
  rating: string
  createdAt: Date
}
