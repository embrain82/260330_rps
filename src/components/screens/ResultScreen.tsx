'use client'

import { useGameStore } from '@/store/gameStore'

export function ResultScreen() {
  const phase = useGameStore((s) => s.phase)
  const retry = useGameStore((s) => s.retry)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8">
      <h1
        className={`text-4xl font-bold mb-4 ${
          phase === 'victory' ? 'text-[#FFD700]' : 'text-white'
        }`}
      >
        {phase === 'victory' ? '축하합니다!' : '아쉽네요...'}
      </h1>
      <p className="text-base text-white mb-12">
        {phase === 'victory'
          ? '5판 연속 승리! 쿠폰을 확인하세요'
          : '다시 도전해보세요!'}
      </p>
      <button
        onClick={retry}
        className="px-8 py-4 min-h-[44px] rounded-2xl bg-[#FF6B6B] text-white text-lg font-bold shadow-lg active:scale-95 transition-transform touch-manipulation"
      >
        {phase === 'victory' ? '한 번 더 하기' : '다시 하기'}
      </button>
    </div>
  )
}
