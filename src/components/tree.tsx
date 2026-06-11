import { useState } from "react";
import { NodeRow, RootDisplay, Direction, Size, TreeTheme, ClassNames, RenderNodeProps, ExpandStrategy } from "../types";
import { ActionButtonsType, ActionButtonItem, ActionButtons } from "./actionButtons";
import { ContextMenu } from "./contextMenu"
import { CollapseItems } from "./colapseItems";
import { ExpandButtons } from "./expandButtons";
import LabelAndIcon from "./labelAndIcon";
import { useDragDrop } from "../hooks/useDragDrop";
import { VirtualScroller } from "./VirtualScroller";


type Props<T = unknown> = {
    actionButtons?: ActionButtonsType
    visibleNodes: NodeRow<T>[]
    expandNodesIds: Set<string>
    expandHandler: (node: NodeRow<T>) => Promise<void>
    unExpandHandler: (node: NodeRow<T>) => void
    selectNode: (node: NodeRow<T> | null) => void
    selectedItem: NodeRow<T> | null
    rootDisplay?: RootDisplay
    dir?: Direction
    size?: Size
    theme?: TreeTheme<T>
    classNames?: ClassNames<T>
    renderNode?: (props: RenderNodeProps<T>) => React.ReactNode
    renderNodeIcon?: (node: NodeRow<T>) => React.ReactNode
    className?: string
    nodeClassName?: string
    buttonClassName?: string
    labelClassName?: string
    showLines?: boolean,
    constLabelWidth?: number
    expandStrategy?: ExpandStrategy
    showExpandIcons?: boolean
    icons?: {
        expand?: {
            expanedIcon: React.ReactNode | null
            unExpandedIcon: React.ReactNode | null
        },
        nodesIcon?: React.ReactNode
    }
    dragDrop?: {
        enabled: boolean
        onDrag?: (dragNode: NodeRow<T>) => void
        onDrop?: (dragNode: NodeRow<T>, targetNode: NodeRow<T>, position: 'before' | 'after' | 'inside') => void
    }
    virtualization?: {
        enabled: boolean
        rowHeight?: number
        containerHeight?: number
        overscan?: number
    }
}

export default function LiveTree<T = unknown>({
    actionButtons,
    visibleNodes,
    expandNodesIds,
    expandHandler,
    unExpandHandler,
    selectNode,
    selectedItem,
    rootDisplay,
    dir = 'ltr',
    size = 'medium',
    theme = {},
    classNames = {},
    renderNode,
    className = '',
    nodeClassName = '',
    buttonClassName = '',
    labelClassName = '',
    showLines = true,
    constLabelWidth = 120,
    expandStrategy = "click on item",
    renderNodeIcon,
    icons,
    showExpandIcons = true,
    dragDrop = { enabled: false },
    virtualization = { enabled: false }
}: Props<T>) {

    const [contextMenu, setContextMenu] = useState<{
        visible: boolean
        x: number
        y: number
        node: NodeRow<T> | null
        actions: ActionButtonItem[]
    }>({ visible: false, x: 0, y: 0, node: null, actions: [] })

    const handleContextMenu = (e: React.MouseEvent, node: NodeRow<T>, actions: ActionButtonItem[]) => {
        e.preventDefault()
        selectNode(node)
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            node,
            actions
        })
    }

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, node: null, actions: [] })
    }


    const containerClasses = [
        'tree-container',
        `tree-size-${size}`,
        dir === 'rtl' ? 'tree-rtl' : 'tree-ltr',
        className,
        theme.container || '',
        classNames.container || ''
    ].filter(Boolean).join(' ')

    const clickHandler = (node: NodeRow<T>) => {
        if (expandStrategy === "click on item") {
            if (expandNodesIds.has(node.id)) {
                unExpandHandler(node)
            } else if (node.hasChild) {
                expandHandler(node)
            }
        }
        selectNode(node)
    }


    const { handleDragStart, handleDragOver, handleDrop } = useDragDrop<T>({
        enabled: dragDrop.enabled,
        onDrag: dragDrop.onDrag,
        onDrop: dragDrop.onDrop
    })

    const getDragAttributes = (node: NodeRow<T>) => {
        if (!dragDrop.enabled) return {}
        return {
            draggable: true,
            onDragStart: (e: React.DragEvent) => handleDragStart(e, node),
            onDragOver: handleDragOver,
            onDrop: (e: React.DragEvent) => handleDrop(e, node)
        }
    }

    const renderNodeItem = (node: NodeRow<T>, index: number, style: React.CSSProperties) => {
        const hasExpand = expandNodesIds.has(node.id)
        const isSelectedNode = selectedItem?.id === node.id;

        if (renderNode) {
            return renderNode({
                node,
                isExpanded: hasExpand,
                onExpand: () => expandHandler(node),
                onCollapse: () => unExpandHandler(node),
                hasChild: node.hasChild,
                isSelected: isSelectedNode,
                selectNode: selectNode
            })
        }

        return (
            <div
                data-path={node.path}
                id={node.id}
                key={node.id}
                className={`tree-node ${isSelectedNode ? 'tree-node-selected' : ''} ${nodeClassName} ${theme.node || ''} ${classNames.node || ''}`}
                onContextMenu={(e) => {
                    const actions = actionButtons
                        ? Object.entries(actionButtons)
                            .filter(([, b]) => b !== undefined)
                            .map(([key, button]) => ({ key, button: button! }))
                        : []
                    handleContextMenu(e, node, actions)
                }}
                style={expandStrategy === "click on item" ? { cursor: "pointer" } : {}}
                onClick={() => clickHandler(node)}
                {...getDragAttributes(node)}
            >
                <CollapseItems
                    showLines={showLines}
                    rootDisplay={rootDisplay}
                    depth={node.depth}
                    dir={dir}
                    theme={theme.collapseLine}
                    className={classNames.collapseLine}
                />

                <div
                    className="icons-label"
                    style={constLabelWidth !== undefined ? { width: `${constLabelWidth}px` } : {}}>
                    {showExpandIcons && <ExpandButtons
                        node={node}
                        hasExpand={hasExpand}
                        expandHandler={expandHandler}
                        unExpandHandler={unExpandHandler}
                        buttonClassName={buttonClassName}
                        theme={theme}
                        classNames={classNames}
                        expandStrategy={expandStrategy}
                        expand={icons?.expand}
                    />}

                    <LabelAndIcon
                        constLabelWidth={constLabelWidth}
                        node={node}
                        labelClassName={labelClassName}
                        theme={theme}
                        classNames={classNames}
                        renderNodeIcon={renderNodeIcon}
                        nodesIcon={icons?.nodesIcon}
                    />
                </div>

                {
                    actionButtons && (
                        <ActionButtons
                            node={node}
                            actionButtons={actionButtons}
                            theme={theme}
                            classNames={classNames}
                        />
                    )
                }
            </div>
        )

    }

    return (
        <>
            <div className={containerClasses} dir={dir} style={{ position: 'relative' }}>
                {virtualization?.enabled ? (
                    <VirtualScroller
                        items={visibleNodes}
                        rowHeight={virtualization.rowHeight || 36}
                        containerHeight={virtualization.containerHeight || 500}
                        overscan={virtualization.overscan || 3}
                        renderRow={(node, index, style) => renderNodeItem(node, index, style)}
                    />
                ) : (
                    visibleNodes.map((node, index) => renderNodeItem(node, index, {}))
                )}
            </div>
            {
                contextMenu.visible && contextMenu.node && (
                    <ContextMenu
                        actions={contextMenu.actions}
                        position={{ x: contextMenu.x, y: contextMenu.y }}
                        onClose={closeContextMenu}
                        node={contextMenu.node}
                        theme={theme}
                        classNames={classNames}
                    />
                )
            }
        </>
    )
}