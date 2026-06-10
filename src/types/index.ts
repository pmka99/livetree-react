export type TreeNode<T = unknown> = {
    id: string
    label: string
    hasChild: boolean
    version?: number
    parent: string | null
    icon?: string | React.ReactNode
    isRoot: boolean
    createdAt?: Date | string
    extraData?: T
    children: {
        id: string
        label: string
        hasChild: boolean
        version?: number
        icon?: string | React.ReactNode
        isRoot: boolean
        createdAt?: Date | string
        extraData?: T
    }[]
}

export type NodeRow<T = unknown> = {
    id: string
    label: string
    depth: number
    hasChild: boolean
    parent: string | null
    path: string
    version?: number
    order: number
    icon?: string | React.ReactNode
    isRoot: boolean
    createdAt?: Date | string
    extraData?: T
}


export type RootDisplay = {
    mode: 'single-root' | 'multi-root';     // 'single-root' | 'multi-root' 
    showRoot?: boolean;                     // just for single-root
    label?: string;                         // just for single-root
    icon?: React.ReactNode;
};


export type Direction = 'ltr' | 'rtl'
export type Size = 'small' | 'medium' | 'large'

export type TreeTheme<T = unknown> = {
    container?: string
    node?: (node: NodeRow<T>) => string
    collapseLine?: string
    button?: string
    label?: string
    actionButton?: string
    moreButton?: string
    popover?: string
    popoverItem?: string
    contextMenu?: string
    contextMenuItem?: string
}


export type ClassNames<T = unknown> = {
    container?: string
    node?: (node: NodeRow<T>) => string
    button?: string
    label?: string
    actionButton?: string
    moreButton?: string
    collapseLine?: string
    popover?: string
    popoverItem?: string
    contextMenu?: string
    contextMenuItem?: string
}


export type RenderNodeProps<T = unknown> = {
    node: NodeRow<T>
    isExpanded: boolean
    onExpand: () => void
    onCollapse: () => void
    hasChild: boolean
    selectNode: (node: NodeRow<T> | null) => void
    isSelected: boolean
}

export type ExpandStrategy = "click on item" | "click on expanedIcon"


export type DragData<T = unknown> = {
    node: NodeRow<T>
    sourceId: string
}

export type DropPosition = 'before' | 'after' | 'inside'
export type DragDropConfig<T = unknown> = {
    enabled: boolean
    onDrop?: (dragId: string, targetId: string, position: DropPosition) => void | Promise<void>
    dragImage?: (node: NodeRow<T>) => HTMLElement | null
}

export type NodesChangeData<T = unknown> = {
    id: string
    label: string
    hasChild: boolean
    parent: string | null
    version?: number
    icon?: string | React.ReactNode
    isRoot: boolean
    createdAt?: Date | string
    extraData?: T
}

export interface NodesChange<T = unknown> {
    operationId?: string;
    operationType?: string;
    timestamp?: Date;
    changes: {
        created: Array<{ id: string; name: string; data: NodesChangeData<T> }>;
        updated: Array<{ id: string; name: string; changes?: Record<string, NodesChangeData<T>>; data: NodesChangeData<T> }>;
        deleted: Array<{ id: string; name: string; data: NodesChangeData<T> }>;
    };
    metadata?: any;
}