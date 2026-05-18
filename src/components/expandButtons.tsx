import { ClassNames, ExpandStrategy, NodeRow, TreeTheme } from "../types"

type Props<T = unknown> = {
    node: NodeRow<T>
    hasExpand: boolean
    expandHandler: (node: NodeRow<T>) => Promise<void>
    unExpandHandler: (node: NodeRow<T>) => void
    buttonClassName?: string
    theme?: TreeTheme<T>
    classNames?: ClassNames<T>
    expandStrategy: ExpandStrategy
    expand?: {
        expanedIcon: React.ReactNode | null
        unExpandedIcon: React.ReactNode | null
    },
}

export function ExpandButtons<T = unknown>({
    node,
    hasExpand,
    expandHandler,
    unExpandHandler,
    buttonClassName = '',
    theme = {},
    classNames = {},
    expandStrategy,
    expand,
}: Props<T>) {

    const onExpandHandler = (node: NodeRow<T>) => {
        if (expandStrategy === "click on expanedIcon") {
            expandHandler(node)
        }
    }

    const onUnExpandHandler = (node: NodeRow<T>) => {
        if (expandStrategy === "click on expanedIcon") {
            unExpandHandler(node)
        }
    }

    if (expandStrategy === "click on expanedIcon") {
        return (
            <>
                {node.hasChild && hasExpand ? (
                    <button
                        className={`tree-toggle-button ${buttonClassName} ${theme.button || ''} ${classNames.button || ''}`}
                        onClick={() => onUnExpandHandler(node)}
                    >
                        {expand?.unExpandedIcon ?? "-"}
                    </button>
                ) : node.hasChild ? (
                    <button
                        className={`tree-toggle-button ${buttonClassName} ${theme.button || ''} ${classNames.button || ''}`}
                        onClick={() => onExpandHandler(node)}
                    >
                        {expand?.expanedIcon ?? "+"}
                    </button>
                ) : <div style={{ width: 0, height: '1.25rem' }} />}

            </>
        )
    } else {
        return (
            <>
                {node.hasChild && hasExpand ? (
                    <div
                        className={`tree-toggle-button justIcon ${buttonClassName} ${theme.button || ''} ${classNames.button || ''}`}
                        onClick={() => onUnExpandHandler(node)}
                    >
                        {expand?.unExpandedIcon ?? "-"}
                    </div>
                ) : node.hasChild ? (
                    <div
                        className={`tree-toggle-button justIcon ${buttonClassName} ${theme.button || ''} ${classNames.button || ''}`}
                        onClick={() => onExpandHandler(node)}
                    >
                        {expand?.expanedIcon ?? "+"}
                    </div>
                ) : <div style={{ width: 0, height: '1.25rem' }} />}

            </>
        )
    }
}

