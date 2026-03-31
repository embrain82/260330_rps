'use client'

import { useGameStore } from '@/store/gameStore'

export function ResultScreen() {
  const phase = useGameStore((s) => s.phase)
  const retry = useGameStore((s) => s.retry)
  const couponConfig = useGameStore((s) => s.couponConfig)

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-8">
      <h1
        className={`text-4xl font-bold mb-4 ${
          phase === 'victory' ? 'text-[#FFD700]' : 'text-[#FF6B6B] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
        }`}
      >
        {phase === 'victory' ? '축하합니다!' : '아쉽네요...'}
      </h1>

      {phase === 'victory' && couponConfig ? (
        <div data-testid="coupon-area" className="flex flex-col items-center mb-12">
          {couponConfig.couponImage && (
            <img
              src={couponConfig.couponImage}
              alt="쿠폰"
              className="w-full max-w-[280px] rounded-xl mb-4 mx-auto"
            />
          )}
          <p className="text-2xl font-mono font-bold text-white bg-white/10 rounded-xl px-6 py-3 tracking-wider select-all">
            {couponConfig.couponCode}
          </p>
          {couponConfig.couponText && (
            <p className="text-base text-white/80 mt-2">
              {couponConfig.couponText}
            </p>
          )}
        </div>
      ) : phase === 'victory' ? (
        <p className="text-base text-white mb-12">5판 연속 승리!</p>
      ) : (
        <p className="text-base text-white mb-12">다시 도전해보세요!</p>
      )}

      <button
        onClick={retry}
        className="px-8 py-4 min-h-[44px] rounded-2xl bg-[#FF6B6B] text-white text-lg font-bold shadow-lg active:scale-95 transition-transform touch-manipulation"
      >
        {phase === 'victory' ? '한 번 더 하기' : '다시 하기'}
      </button>
    </div>
  )
}
