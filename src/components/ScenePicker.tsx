import type { SceneId } from '../lib/preferences'
import { SCENES } from '../scenes'

/** Tiny line icons for each scene, in the same ink style as everything else. */
const ICONS: Record<SceneId, string> = {
  shelf: 'M2 17 L22 17 M5 17 L5 9 L9 9 L9 17 M12 17 L12 6 L15 6 L15 17 M17 17 L17 11 L20 11 L20 17',
  room: 'M2 20 L22 20 M3 20 L3 3 M21 20 L21 3 M6 6 L11 6 L11 11 L6 11 Z M13 13 L20 13 M14 13 L14 20 M19 13 L19 20',
  bag: 'M4 9 L20 9 L19 20 L5 20 Z M9 9 L9 6 Q12 3 15 6 L15 9 M4 12 L20 12',
}

interface Props {
  value: SceneId
  onChange: (scene: SceneId) => void
}

export function ScenePicker({ value, onChange }: Props) {
  return (
    <div className="scene-picker" role="group" aria-label="Scene">
      {(Object.keys(SCENES) as SceneId[]).map((id) => (
        <button key={id} aria-pressed={value === id} onClick={() => onChange(id)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d={ICONS[id]} />
          </svg>
          {SCENES[id].label}
        </button>
      ))}
    </div>
  )
}
