import { chunk } from 'lodash';

export const CHUNK_SIZE = parseInt(process.env.DB_CHUNK_SIZE || '5000', 10);

/**
 * მასივს ჭრის ნაწილებად და ასრულებს ასინქრონულ ოპერაციას თითოეულზე
 */
export async function chunkProcess<T>(
  items: T[],
  size: number,
  callback: (chunk: T[]) => Promise<any>,
): Promise<void> {
  const chunks = chunk(items, size);

  for (const chunk of chunks) {
    await callback(chunk);
  }
}
