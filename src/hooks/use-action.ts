import { useCallback, useState } from 'react'

import { ActionState, FieldErrors } from '@/lib/create-safe-action'

export type Action<TInput, TOutput> = (
  data: TInput
) => Promise<ActionState<TInput, TOutput>>

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput, message: string) => void
  onError?: (error: string) => void
  onComplete?: () => void
}

export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {}
) => {
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined)
  const [error, setErrors] = useState<string | undefined>(undefined)
  const [data, setData] = useState<TOutput | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined)
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(false)
  const [message, setMessage] = useState<string | undefined>()
  const [type, setType] = useState<ActionState<TInput, TOutput>['type']>()
  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true)
      setFieldErrors(undefined)
      setErrors(undefined)
      try {
        const result = await action(input)
        if (!result) {
          return
        }
        const { data, error, fieldErrors, statusCode, message, success, type } =
          result
        setMessage(message)
        setType(type)
        if (fieldErrors) setFieldErrors(fieldErrors)
        if (error) {
          setErrors(error)
          // Callback to onError function
          options.onError?.(error)
        }
        if (data) {
          setData(data)
          // Callback to onSuccess function
          setIsSuccess(success)
          setFieldErrors(undefined)
          setErrors(undefined)
          options.onSuccess?.(data, message || 'Success')
        }
        if (statusCode) setStatusCode(statusCode)
      } catch (error) {
        //
        console.log(error)
      } finally {
        setIsLoading(false)
        options.onComplete?.()
      }
    },
    [action, options]
  )

  return {
    error,
    data,
    statusCode,
    isLoading,
    isSuccess,
    type,
    message,
    fieldErrors,
    setFieldErrors,
    execute,
  }
}
