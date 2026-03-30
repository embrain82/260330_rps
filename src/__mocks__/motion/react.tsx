import React from 'react'

const createMotionComponent = (tag: string) => {
  return React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, variants, whileHover, whileTap,
            whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props
    return React.createElement(tag, { ...rest, ref })
  })
}

export const motion = new Proxy({}, {
  get: (_, tag: string) => createMotionComponent(tag)
})

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const useAnimate = () => [{ current: null }, () => Promise.resolve()] as const
export const useReducedMotion = () => false
export const MotionConfig = ({ children }: { children: React.ReactNode }) => <>{children}</>
