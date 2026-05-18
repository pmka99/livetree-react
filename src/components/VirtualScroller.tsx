import { useState, useRef, useEffect, ReactNode } from "react";

type VirtualScrollerProps = {
    items: any[]
    rowHeight: number
    containerHeight: number
    overscan?: number
    renderRow: (item: any, index: number, style: React.CSSProperties) => ReactNode
    className?: string
}

export function VirtualScroller({
    items,
    rowHeight,
    containerHeight,
    overscan = 3,
    renderRow,
    className = ''
}: VirtualScrollerProps) {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const totalHeight = items.length * rowHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan)

    const visibleItems = items.slice(startIndex, endIndex)
    const offsetY = startIndex * rowHeight

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }

    return (
        <div
            ref={containerRef}
            className={`virtual-scroller ${className}`}
            style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, idx) =>
                        renderRow(item, startIndex + idx, { height: rowHeight })
                    )}
                </div>
            </div>
        </div>
    )
}