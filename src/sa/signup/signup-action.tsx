'use server'

import { cookies } from 'next/headers'
import { loginSchema } from '@/schema/login.schema'
import { signupSchema } from '@/schema/signup.schema'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'

import { createSafeAction } from '@/lib/create-safe-action'

import { ReturnType } from './types'

type ZodLoginSchema = z.infer<typeof loginSchema>
async function handler(values: ZodLoginSchema): Promise<ReturnType> {
  const validatedSchema = loginSchema.safeParse(values)
  if (!validatedSchema.success) {
    return {
      success: false,
      message: 'Bad request',
      statusCode: 400,
      type: 'error',
      fieldErrors: validatedSchema.error.flatten().fieldErrors,
    }
  }
  const {
    data: { email, password },
  } = validatedSchema
  const supabase = createRouteHandlerClient({ cookies })
  const response = await supabase.auth.signUp({ email, password })
  if (response.data) {
    return {
      success: true,
      data: response.data,
      message: 'Signup success!',
      type: 'success',
      statusCode: 200,
    }
  } else {
    return {
      success: false,
      message: 'Signup error!',
      type: 'error',
      statusCode: 400,
      error: response.error?.message,
    }
  }
}
export const signupAction = createSafeAction(signupSchema, handler)