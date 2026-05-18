import { NodeRow, TreeNode } from "../types"

export const flattenTree = <T = unknown>(
    node: TreeNode<T>,
    parentId: string | null = null,
    depth: number = 1,
    path: string = '',
    order: number = 0
): NodeRow<T>[] => {

    const currentPath = path || `${node.id}`

    const result: NodeRow<T>[] = [{
        id: node.id,
        label: node.label,
        depth: depth,
        hasChild: node.hasChild,
        parent: node.parent ?? parentId,
        version: node.version || 1,
        path: currentPath,
        order: order,
        icon: node.icon,
        isRoot: node.isRoot,
        createdAt: node.createdAt,
        extraData: node.extraData
    }]

    if (node.children) {
        let i = 0
        for (const child of node.children) {
            result.push(...flattenTree(child as TreeNode<T>, node.id, depth + 1, `${currentPath}/${child.id}`, i))
            i++;
        }
    }

    return result
}
