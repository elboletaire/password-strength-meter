/** The element a framework mounts a demo into (`slot()` in src/shell/components.ts). */
export function slot(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-slot="${name}"]`)
  if (!element) {
    throw new Error(`Missing the [data-slot="${name}"] of the demo`)
  }
  return element
}
