/**
 * Minimal ambient declarations for the two score libraries, which ship no types.
 * We only declare the slice of the surface that ScorePlayer actually uses.
 */

declare module 'verovio/wasm' {
  /** Resolves the Emscripten WASM module that the toolkit wraps. */
  const createVerovioModule: () => Promise<unknown>
  export default createVerovioModule
}

declare module 'verovio/esm' {
  export interface ElementsAtTime {
    notes: string[]
    page: number
    measure?: string
  }
  export class VerovioToolkit {
    constructor(module: unknown)
    loadData(data: string): boolean
    setOptions(options: Record<string, unknown>): void
    getPageCount(): number
    renderToSVG(page: number, options?: Record<string, unknown>): string
    renderToMIDI(): string
    getElementsAtTime(timeMs: number): ElementsAtTime
    getTimeForElement(id: string): number
  }
}

declare module 'html-midi-player' {
  /** The `<midi-player>` custom element. Importing the module registers it. */
  export interface PlayerElement extends HTMLElement {
    src: string
    soundFont: string | null
    currentTime: number
    duration: number
    playing: boolean
    start(): Promise<void>
    stop(): void
    reload(): void
  }
}
