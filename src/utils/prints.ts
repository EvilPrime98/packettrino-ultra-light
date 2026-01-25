/**
 * Returns a formatted line of text with a specified gap between columns.
 * @param gap The gap between columns.
 * @param data The data to be printed per column.
 * @returns 
 */
export function printcol(
  gap: number = 1,
  ...data: string[]
){
  return data
  .map(d => d.padEnd(gap, ' '))
  .join(' '.repeat(gap))
}