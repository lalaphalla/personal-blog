import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

export type GlobalErrorEvent = {
  message: string
  retry: () => void
}

type GlobalErrorListener = (event: GlobalErrorEvent) => void

const globalErrorListeners = new Set<GlobalErrorListener>()

export function subscribeGlobalErrors(listener: GlobalErrorListener): () => void {
  globalErrorListeners.add(listener)
  return () => {
    globalErrorListeners.delete(listener)
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

function handleGlobalError(
  error: unknown,
  meta: Record<string, unknown> | undefined,
  retry: () => void,
): void {
  if (meta?.suppressGlobalError === true) return
  const message = getErrorMessage(error)
  globalErrorListeners.forEach((listener) => listener({ message, retry }))
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleGlobalError(error, query.meta, () => {
        void query.fetch()
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, _context, mutation) => {
      handleGlobalError(error, mutation.meta, () => {
        void mutation.execute(variables)
      })
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
