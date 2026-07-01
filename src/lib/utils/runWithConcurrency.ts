export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  const queue = [...items]

  async function workerTask() {
    while (queue.length > 0) {
      const item = queue.shift()!
      try {
        results.push(await worker(item))
      } catch {
        // individual item failures are caught by the worker or ignored
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => workerTask())
  await Promise.allSettled(workers)
  return results
}
