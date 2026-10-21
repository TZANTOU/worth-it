import { useState } from 'react'

export type SceneId = 'shelf' | 'room' | 'bag'

const SCENE_KEY = 'worth-it:scene'
const SCENE_IDS: SceneId[] = ['shelf', 'room', 'bag']
const ZIP_KEY = 'worth-it:bag-zip'

// Storage can be blocked (private windows, previews), so every read and write is guarded
// and the app falls back to defaults that still work.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Not remembered across visits, but the change still applies now.
  }
}

/** The chosen scene, remembered in this browser. */
export function useScene(): [SceneId, (scene: SceneId) => void] {
  const [scene, setScene] = useState(() => SCENE_IDS.find((id) => id === read(SCENE_KEY)) ?? 'shelf')

  function update(next: SceneId) {
    setScene(next)
    write(SCENE_KEY, next)
  }

  return [scene, update]
}

/**
 * How far the bag's zip is open (0–1). It starts closed so there is something to play with;
 * only finished moves are remembered, not every step of a drag.
 */
export function useBagZip(): [number, (value: number, commit: boolean) => void] {
  const [zip, setZip] = useState(() => {
    const stored = Number(read(ZIP_KEY) ?? 0)
    return stored >= 0 && stored <= 1 ? stored : 0
  })

  function update(next: number, commit: boolean) {
    setZip(next)
    if (commit) write(ZIP_KEY, String(next))
  }

  return [zip, update]
}
