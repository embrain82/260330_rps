'use client'

import { useGameStore } from '@/store/gameStore'

export function IdleScreen() {
  const start = useGameStore((s) => s.start)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-[#F8F9FA]">
      <h1 className="text-4xl font-bold leading-tight text-[#1A1A2E] mb-4">
        가위바위보 챌린지
      </h1>
      <p className="text-base text-[#6B7280] mb-12">
        5판 연속 승리하면 쿠폰!
      </p>
      <button
        onClick={start}
        className="px-8 py-4 min-h-[44px] rounded-2xl bg-[#FF6B6B] text-white text-lg font-bold shadow-lg animate-pulse-gentle active:scale-95 transition-transform touch-manipulation"
      >
        시작하기
      </button>
    </div>
  )
}
