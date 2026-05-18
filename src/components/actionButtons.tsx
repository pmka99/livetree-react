import { useState, useRef, useEffect } from "react";
import { NodeRow, TreeTheme, ClassNames } from "../types";
import { PopoverMenu } from "./popover";

type ActionTrigger<T = unknown> = {
    Icon?: React.ReactNode;
    title?: string;
    showInMenu?: boolean;
    className?: string;
    handler: (id: string, node: NodeRow<T>) => void | Promise<void>;
}

export type BuiltInActionKeys =
    | 'add'
    | 'edit'
    // | 'edit'
    | 'remove'
    | 'removeChildren'
    | 'removeNodeAndChildren'

export type ActionButtonsType<T = unknown> =
    & Partial<Record<BuiltInActionKeys, ActionTrigger<T>>>
    & Record<string, ActionTrigger<T> | undefined>

export type ActionButtonItem<T = unknown> = {
    key: string
    button: ActionTrigger<T>
}

type ActionButtonsProps<T = unknown> = {
    actionButtons: ActionButtonsType<T>
    node: NodeRow<T>
    onContextMenu?: (node: NodeRow<T>, actions: ActionButtonItem<T>[]) => void
    theme?: TreeTheme<T>
    classNames?: ClassNames<T>
}

export function ActionButtons<T = unknown>({
    actionButtons,
    node,
    onContextMenu,
    theme,
    classNames = {}
}: ActionButtonsProps<T>) {
    const [showPopover, setShowPopover] = useState(false)
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
    const moreButtonRef = useRef<HTMLButtonElement>(null)

    const allButtons: ActionButtonItem<T>[] = Object.entries(actionButtons)
        .filter((entry): entry is [string, ActionTrigger<T>] => entry[1] !== undefined)
        .map(([key, button]) => ({ key, button }))

    const directButtons = allButtons.filter(({ button }) => !button.showInMenu)
    const menuButtons = allButtons.filter(({ button }) => button.showInMenu)

    const DirectButtons = () => (
        <div className="action-buttons-container" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {directButtons.map(({ key, button }) => (
                <button
                    key={key}
                    className={`tree-action-button ${button.className || ''} ${theme?.actionButton || ''} ${classNames.actionButton || ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        button.handler(node.id, node)
                    }}
                    title={button.title ?? key}
                >
                    {button.Icon && <span className="action-button-icon">{button.Icon}</span>}
                    <span className="action-button-text">{button.title ?? key}</span>
                </button>
            ))}
        </div>
    )

    const MoreButton = () => {
        if (menuButtons.length === 0) return null

        const handleMoreClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setPopoverPosition({ x: rect.right, y: rect.bottom })
            setShowPopover(true)
        }

        return (
            <>
                <button
                    ref={moreButtonRef}
                    className={`tree-more-button ${theme?.moreButton || ''} ${classNames.moreButton || ''}`}
                    onClick={handleMoreClick}
                    title="more"
                >
                    ⋯
                </button>
                {showPopover && (
                    <PopoverMenu
                        buttons={menuButtons}
                        onClose={() => setShowPopover(false)}
                        position={popoverPosition}
                        node={node}
                        theme={theme}
                        classNames={classNames}
                    />
                )}
            </>
        )
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (onContextMenu) {
            onContextMenu(node, allButtons)
        }
    }

    return (
        <div
            className="action-buttons-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            onContextMenu={handleContextMenu}
        >
            <DirectButtons />
            {/* <MoreButton /> */}
        </div>
    )
}