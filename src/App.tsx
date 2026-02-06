import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { SimpleAvatarView } from './components/3d/SimpleAvatarView'
import { BottomNav } from './components/ui/BottomNav'
import { Celebrations } from './components/effects/Celebrations'
import { useCelebration } from './hooks/useCelebration'
import { useWardrobeInit } from './hooks/useWardrobeInit'
import { useEquippedTextures } from './hooks/useEquippedTextures'
import { useUIStore } from './stores/uiStore'
import { useAvatarStore } from './stores/avatarStore'
import { useSettingsStore } from './stores/settingsStore'
import { ToastProvider } from './components/ui/Toast'
import { ThreeJSErrorBoundary } from './components/ui/ErrorBoundary'
import VRMUploader from './components/3d/VRMUploader'
import DownloadedAssets from './components/3d/DownloadedAssets'
import TextureSwapper from './components/3d/TextureSwapper'
import { WardrobeScreen } from './components/wardrobe/WardrobeScreen'
import { CollectionsView } from './components/wardrobe/CollectionsView'
import { OutfitGallery } from './components/wardrobe/OutfitGallery'
import { ChallengeScreen } from './components/challenges/ChallengeScreen'
import { AchievementsScreen } from './components/achievements/AchievementsScreen'
import { ProfileCard } from './components/progress/ProfileCard'
import { StarCounter } from './components/progress/StarCounter'
import type { VRM } from '@pixiv/three-vrm'
import type { Screen } from './styles/kidTheme'

// Closet screen with wardrobe and collections tabs
function ClosetScreen() {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'collections'>('wardrobe')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'wardrobe'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'collections'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Collections
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'wardrobe' ? <WardrobeScreen /> : <CollectionsView />}
      </div>
    </div>
  )
}

function PlayScreen() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'profile'>('challenges')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'challenges'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            🎯 Challenges
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'achievements'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            ⭐ Profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'challenges' && <ChallengeScreen />}
        {activeTab === 'achievements' && <AchievementsScreen />}
        {activeTab === 'profile' && (
          <div className="p-4">
            <div className="max-w-2xl mx-auto">
              <ProfileCard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GalleryScreen() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-kid-xl font-bold text-gray-800">My Gallery</h2>
          <p className="text-kid-sm text-gray-600">Your saved outfits and looks</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <OutfitGallery />
        </div>
      </div>
    </div>
  )
}

// Dress Up controls panel (avatar is rendered in AppContent)
function DressUpControls() {
  const { vrmUrl, vrmFileName, currentVRM, setVRM } = useAvatarStore()
  const blobUrlsRef = useRef<Set<string>>(new Set())

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      blobUrlsRef.current.clear()
    }
  }, [])

  const handleVRMUpload = useCallback((url: string, fileName: string) => {
    // Revoke old blob URL if it exists
    if (vrmUrl && vrmUrl.startsWith('blob:')) {
      URL.revokeObjectURL(vrmUrl)
      blobUrlsRef.current.delete(vrmUrl)
    }
    // Track new blob URL
    if (url.startsWith('blob:')) {
      blobUrlsRef.current.add(url)
    }
    setVRM(url, fileName)
  }, [vrmUrl, setVRM])

  const handleVRMSelect = useCallback((url: string, name: string) => {
    // Revoke old blob URL if it exists
    if (vrmUrl && vrmUrl.startsWith('blob:')) {
      URL.revokeObjectURL(vrmUrl)
      blobUrlsRef.current.delete(vrmUrl)
    }
    setVRM(url, name)
  }, [vrmUrl, setVRM])

  return (
    <div className="flex flex-col h-full">
      {/* Spacer for avatar area */}
      <div className="flex-1" />

      {/* Quick Actions Panel - slides up from bottom */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto">
          {/* VRM Selection */}
          {!vrmUrl ? (
            <div className="space-y-3">
              <p className="text-kid-sm text-gray-600 text-center font-medium">
                Choose your avatar to get started!
              </p>
              <div className="grid grid-cols-2 gap-3">
                <VRMUploader
                  onUpload={handleVRMUpload}
                  currentFile={vrmFileName}
                  compact
                />
                <DownloadedAssets
                  vrm={currentVRM}
                  onModelSelect={handleVRMSelect}
                  currentModelUrl={vrmUrl}
                  compact
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current avatar info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-kid-sm font-semibold text-gray-700 truncate max-w-[200px]">
                    {vrmFileName || 'Avatar'}
                  </span>
                </div>
                <button
                  onClick={() => setVRM(null, null)}
                  className="text-kid-xs text-gray-500 hover:text-primary"
                >
                  Change Avatar
                </button>
              </div>

              {/* Texture swapper for quick access */}
              <TextureSwapper vrm={currentVRM} compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { activeScreen, setActiveScreen } = useUIStore()
  const { celebrationsEnabled } = useSettingsStore()
  const { celebrationType, clear: clearCelebration } = useCelebration()
  const { vrmUrl, currentVRM, setCurrentVRM, backgroundColor } = useAvatarStore()

  // Initialize wardrobe from manifest
  useWardrobeInit()

  // Apply equipped wardrobe items when VRM loads (persistent across screen changes)
  useEquippedTextures(currentVRM)

  const handleNavigate = useCallback((screen: Screen) => {
    setActiveScreen(screen)
  }, [setActiveScreen])

  const handleVRMLoaded = useCallback((vrm: VRM) => {
    setCurrentVRM(vrm)
  }, [setCurrentVRM])

  // Render the active screen overlay (on top of avatar)
  const renderScreenOverlay = () => {
    switch (activeScreen) {
      case 'closet':
        return <ClosetScreen />
      case 'dress-up':
        return <DressUpControls />
      case 'play':
        return <PlayScreen />
      case 'gallery':
        return <GalleryScreen />
      default:
        return <DressUpControls />
    }
  }

  // Show avatar on dress-up screen
  const showAvatar = activeScreen === 'dress-up'

  return (
    <div className="w-full h-screen flex flex-col bg-cream font-kid overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 safe-area-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-kid-xl font-bold text-gradient-rainbow">
            StyleSpace
          </h1>
          <div className="flex items-center gap-3">
            {/* Star counter */}
            <StarCounter size="sm" />
            {/* Settings button placeholder */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pb-20 relative">
        {/* Persistent Avatar Layer - always rendered, visibility controlled */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            showAvatar ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ThreeJSErrorBoundary>
            <SimpleAvatarView
              vrmUrl={vrmUrl}
              onVRMLoaded={handleVRMLoaded}
              backgroundColor={backgroundColor}
              showControls={showAvatar}
            />
          </ThreeJSErrorBoundary>
        </div>

        {/* Screen Content Layer */}
        <div className={`relative h-full ${showAvatar ? 'z-20' : 'z-10'}`}>
          {renderScreenOverlay()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />

      {/* Celebration Effects Layer */}
      {celebrationsEnabled && (
        <Celebrations type={celebrationType} onComplete={clearCelebration} />
      )}
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
