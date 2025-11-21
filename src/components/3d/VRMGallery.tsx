interface SampleVRM {
  id: string
  name: string
  url: string
  thumbnail: string
  author: string
  license: string
}

export const SAMPLE_VRMS: SampleVRM[] = [
  {
    id: 'vita',
    name: 'Vita',
    url: '/vrm/vita.vrm',
    thumbnail: '👩',
    author: 'VRoid Project',
    license: 'CC0',
  },
  {
    id: 'seed-san',
    name: 'Seed-san',
    url: '/vrm/seed-san.vrm',
    thumbnail: '👧',
    author: 'VRoid Project',
    license: 'CC0',
  },
  {
    id: 'three-vrm-girl',
    name: 'VRM Sample',
    url: '/vrm/three-vrm-girl.vrm',
    thumbnail: '🧑',
    author: 'Pixiv',
    license: 'MIT',
  },
  {
    id: 'masc-vroid',
    name: 'Masc VRoid',
    url: '/vrm/masc-vroid.vrm',
    thumbnail: '👨',
    author: 'VRoid Project',
    license: 'CC0',
  },
  {
    id: 'avatar-orion',
    name: 'Orion',
    url: '/vrm/avatar-orion.vrm',
    thumbnail: '🧑‍🚀',
    author: 'madjin',
    license: 'CC0',
  },
  {
    id: 'meebit',
    name: 'Meebit',
    url: '/vrm/meebit.vrm',
    thumbnail: '🤖',
    author: 'madjin',
    license: 'CC0',
  },
  {
    id: 'skinnie-1',
    name: 'Skinnie 1',
    url: '/vrm/skinnie-1.vrm',
    thumbnail: '🧍',
    author: 'MJMoonbow',
    license: 'CC0',
  },
  {
    id: 'skinnie-2',
    name: 'Skinnie 2',
    url: '/vrm/skinnie-2.vrm',
    thumbnail: '🧍‍♀️',
    author: 'MJMoonbow',
    license: 'CC0',
  },
  {
    id: 'sendagaya-shino',
    name: 'Shino',
    url: '/vrm/sendagaya-shino.vrm',
    thumbnail: '👩‍🦰',
    author: 'VRoid Project',
    license: 'CC0',
  },
  {
    id: 'sendagaya-shibu',
    name: 'Shibu',
    url: '/vrm/sendagaya-shibu.vrm',
    thumbnail: '👱‍♀️',
    author: 'VRoid Project',
    license: 'CC0',
  },
  {
    id: 'cryptovoxels',
    name: 'CryptoVoxel',
    url: '/vrm/cryptovoxels.vrm',
    thumbnail: '🎮',
    author: 'madjin',
    license: 'CC0',
  },
]

interface VRMGalleryProps {
  onSelect: (url: string, name: string) => void
  currentUrl: string | null
}

export default function VRMGallery({ onSelect, currentUrl }: VRMGalleryProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Sample Avatars</h2>
      <p className="text-xs text-gray-500 mb-3">Click to load (CC0/MIT licensed)</p>

      <div className="grid grid-cols-3 gap-2">
        {SAMPLE_VRMS.map((vrm) => (
          <button
            key={vrm.id}
            onClick={() => onSelect(vrm.url, vrm.name)}
            className={`p-3 rounded-lg text-center transition-all ${
              currentUrl === vrm.url
                ? 'bg-purple-600 ring-2 ring-purple-400'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{vrm.thumbnail}</div>
            <div className="text-xs font-medium truncate">{vrm.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
