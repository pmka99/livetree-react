import { useRef, useCallback } from 'react'
import { NodeRow, DropPosition, DragData } from '../types'

export const useDragDrop = <T>(
    config: {
        enabled: boolean
        onDrag?: (dragNode: NodeRow<T>) => void      
        onDrop?: (dragNode: NodeRow<T>, targetNode: NodeRow<T>, position: DropPosition) => void
    }
) => {
    const dragNodeRef = useRef<NodeRow<T> | null>(null)

    const handleDragStart = useCallback((e: React.DragEvent, node: NodeRow<T>) => {
        if (!config.enabled) return

        dragNodeRef.current = node

        const dragData: DragData<T> = {
            node: node,
            sourceId: node.id
        }

        e.dataTransfer.setData('text/plain', JSON.stringify(dragData))
        e.dataTransfer.effectAllowed = 'move'

        if (e.dataTransfer.setDragImage) {
            const dragIcon = document.createElement('div')
            dragIcon.textContent = node.label
            dragIcon.className = 'drag-preview'
            document.body.appendChild(dragIcon)
            e.dataTransfer.setDragImage(dragIcon, 0, 0)
            setTimeout(() => document.body.removeChild(dragIcon), 0)
        }

        if (config.onDrag) {
            config.onDrag(node)
        }
    }, [config.enabled, config.onDrag])

    const getDropPosition = (e: React.DragEvent, element: HTMLElement): DropPosition => {
        const rect = element.getBoundingClientRect()
        const threshold = rect.top + rect.height * 0.25

        if (e.clientY < rect.top + rect.height * 0.33) return 'before'
        if (e.clientY > rect.bottom - rect.height * 0.33) return 'after'
        return 'inside'
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!config.enabled) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }, [config.enabled])

    const handleDrop = useCallback((e: React.DragEvent, targetNode: NodeRow<T>) => {
        if (!config.enabled) return
        e.preventDefault()

        const rawData = e.dataTransfer.getData('text/plain')
        if (!rawData) return

        const dragData: DragData<T> = JSON.parse(rawData)
        const dragNode = dragData.node

        if (dragNode.id === targetNode.id) return

        const targetElement = e.currentTarget as HTMLElement
        const position = getDropPosition(e, targetElement)

        config.onDrop?.(dragNode, targetNode, position)

        dragNodeRef.current = null
    }, [config.enabled, config.onDrop])

    return {
        handleDragStart,
        handleDragOver,
        handleDrop,
        isDragging: !!dragNodeRef.current
    }
}