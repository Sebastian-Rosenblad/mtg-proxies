export function getNewId(ids: Array<string>): string {
  let id: string = Math.random().toString(16).slice(2, 8);
  while (ids.includes(id)) id = Math.random().toString(16).slice(2, 8);
  return id;
}
