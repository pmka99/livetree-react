import { useEffect, useRef } from "react";
import { NodeRow, TreeTheme, ClassNames } from "../types";

type ContextMenuProps<T = unknown> = {
    actions: Array<{ key: string; button: any }>
    position: { x: number; y: number }
    onClose: () => void
    node: NodeRow<T>
    theme?: TreeTheme<T>
    classNames?: ClassNames<T>  
}

export function ContextMenu<T = unknown>({
    actions,
    position,
    onClose,
    node,
    theme,
    classNames = {}  
}: ContextMenuProps<T>) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const adjustPosition = () => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect()
                const viewportWidth = window.innerWidth
                const viewportHeight = window.innerHeight

                let adjustedX = position.x
                let adjustedY = position.y

                if (position.x + rect.width > viewportWidth) {
                    adjustedX = viewportWidth - rect.width - 10
                }
                if (position.y + rect.height > viewportHeight) {
                    adjustedY = viewportHeight - rect.height - 10
                }

                menuRef.current.style.left = `${adjustedX}px`
                menuRef.current.style.top = `${adjustedY}px`
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        adjustPosition()

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose, position])

    return (
        <>
            <div
                className="tree-popover-overlay"
                onClick={onClose}
            />
            <div
                ref={menuRef}
                className={`tree-context-menu ${theme?.contextMenu || ''} ${classNames.contextMenu || ''}`}
                style={{
                    left: position.x,
                    top: position.y,
                }}
            >
                {actions.map(({ key, button }) => (
                    <button
                        key={key}
                        className={`tree-context-menu-item ${button.className || ''} ${theme?.contextMenuItem || ''} ${classNames.contextMenuItem || ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            button.handler(node.id, node)
                            onClose()
                        }}
                    >
                        {button.Icon && <span className="context-menu-icon">{button.Icon}</span>}
                        <span className="context-menu-text">{button.title ?? key}</span>
                    </button>
                ))}
            </div>
        </>
    )
}