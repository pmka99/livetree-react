import { ClassNames, NodeRow, TreeTheme } from "../types"

type Props<T = unknown> = {
    constLabelWidth?: number
    node: NodeRow<T>
    labelClassName?: string
    theme?: TreeTheme<T>
    classNames?: ClassNames<T>
    renderNodeIcon?: (node: NodeRow<T>) => React.ReactNode
    nodesIcon?: React.ReactNode
}

export default function LabelAndIcon<T = unknown>({
    constLabelWidth,
    node,
    labelClassName = '',
    theme = {},
    classNames = {},
    renderNodeIcon,
    nodesIcon
}: Props<T>) {




    return (
        <div style={{ display: 'flex', gap: 2, alignItems: "center", flexGrow: 1, width: '30px' }}>
            {/* Icon ----------------------------------------- */}
            {
                node.icon
                    ? typeof node.icon === "string"
                        ? renderNodeIcon ? renderNodeIcon(node) : null
                        : node.icon
                    : nodesIcon
                        ? nodesIcon
                        : null
            }

            {/* Label ---------------------------------------- */}
            <span
                // style={constLabelWidth !== undefined ? { width: `${constLabelWidth}px` } : {}}
                title={node.label}
                className={`label ${labelClassName} ${theme.label || ''} ${classNames.label || ''}`}
            >
                {node.label}
            </span>
        </div>
    )
}
