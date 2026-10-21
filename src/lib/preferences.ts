import { useState } from 'react'

export type SceneId = 'shelf' | 'room' | 'bag'

const SCENE_KEY = 'worth-it:scene'
const SCENE_IDS: SceneId[] = ['shelf', 'room', 'bag']

function readScene(): SceneId {
  try {
    const stored = localStorage.getItem(SCENE_KEY)
    return SCENE_IDS.find((id) => id === stored) ?? 'shelf'
  } catch {
    // Storage can be blocked (private windows, previews); the default scene still works.
    return 'shelf'
  }
}

/** The chosen scene, remembered in this browser. */
export function useScene(): [SceneId, (scene: SceneId) => void] {
  const [scene, setScene] = useState(readScene)

  function update(next: SceneId) {
    setScene(next)
    try {
      localStorage.setItem(SCENE_KEY, next)
    } catch {
      // Not remembered across visits, but the switch still applies now.
    }
  }

  return [scene, update]
}
