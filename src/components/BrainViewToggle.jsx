import { useNavigate } from 'react-router-dom'

/**
 * Segmented pill toggle for switching between the Neural Brain, Semantic Map,
 * and Memory Map views.
 * `current` — one of 'brain', 'map', 'memory'
 * `langId`  — the language route param (e.g. 'dadjo', 'sumerian')
 */
export default function BrainViewToggle({ current, langId }) {
  const navigate = useNavigate()

  return (
    <div className="inline-flex items-center rounded-2xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-1 shadow-lg gap-0.5">
      <button
        type="button"
        onClick={() => current !== 'brain' && navigate(`/brain/${langId}`)}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
          current === 'brain'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer'
        }`}
      >
        <span className="text-base leading-none">🧠</span>
        <span>Neural Brain</span>
      </button>

      <button
        type="button"
        onClick={() => current !== 'map' && navigate(`/brain-map/${langId}`)}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
          current === 'map'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer'
        }`}
      >
        <span className="text-base leading-none">🗺</span>
        <span>Semantic Map</span>
      </button>

      <button
        type="button"
        onClick={() => current !== 'memory' && navigate(`/memory-map/${langId}`)}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
          current === 'memory'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer'
        }`}
      >
        <span className="text-base leading-none">🌱</span>
        <span>Memory Map</span>
      </button>
    </div>
  )
}
