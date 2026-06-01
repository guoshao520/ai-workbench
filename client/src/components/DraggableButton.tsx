import React, { useEffect, useRef, useCallback } from 'react'

export const DraggableButton: React.FC<{
  children: React.ReactNode
  onClick: () => void
  className?: string
  title?: string
}> = ({ children, onClick, className, title }) => {
  const btnRef = useRef<HTMLButtonElement>(null)
  const posRef = useRef({ x: window.innerWidth - 72, y: window.innerHeight - 140 })
  const isDraggingRef = useRef(false)
  const isPressedRef = useRef(false)
  const hasMovedRef = useRef(false)
  const offsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return
    btn.style.position = 'fixed'
    btn.style.zIndex = '100'
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isPressedRef.current = true
    hasMovedRef.current = false

    // 记录鼠标相对于按钮左上角的偏移，这样拖拽时鼠标在原位
    const rect = btnRef.current!.getBoundingClientRect()
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    btnRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // 没按下就不处理
    if (!isPressedRef.current) return

    const newX = e.clientX - offsetRef.current.x
    const newY = e.clientY - offsetRef.current.y

    // 第一次移动标记为拖拽
    if (!hasMovedRef.current) {
      hasMovedRef.current = true
      isDraggingRef.current = true
    }

    // 边界限制
    const clampedX = Math.max(0, Math.min(window.innerWidth - 44, newX))
    const clampedY = Math.max(0, Math.min(window.innerHeight - 44, newY))

    posRef.current = { x: clampedX, y: clampedY }
    const btn = btnRef.current
    if (btn) {
      btn.style.left = clampedX + 'px'
      btn.style.top = clampedY + 'px'
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    isPressedRef.current = false
    // 没移动过才算点击
    if (!hasMovedRef.current) {
      onClick()
    }
    isDraggingRef.current = false
    hasMovedRef.current = false
  }, [onClick])

  return (
    <button
      ref={btnRef}
      className={className}
      title={title}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {children}
    </button>
  )
}