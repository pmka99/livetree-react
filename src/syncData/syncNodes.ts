import { Dispatch, SetStateAction } from "react";
import { NodeRow, NodesChange } from "../types";

type SyncNodesParams<T> = {
    changes: NodesChange<T>;
    nodesMap: Map<string, NodeRow<T>>;
    setNodesMap: Dispatch<SetStateAction<Map<string, NodeRow<T>>>>;
    setExpandNodesIds: Dispatch<SetStateAction<Set<string>>>;
    setFetchedIds: Dispatch<SetStateAction<Set<string>>>;
};

// ⭐ Update depth and path of a node and all its descendants
const updateNodeAndDescendants = <T>(
    nodeId: string,
    newParentPath: string,
    newParentDepth: number,
    nodesMap: Map<string, NodeRow<T>>
): void => {
    const node = nodesMap.get(nodeId);
    if (!node) return;

    // Update current node
    const newPath = `${newParentPath}/${node.id}`;
    const newDepth = newParentDepth + 1;
    nodesMap.set(nodeId, { ...node, path: newPath, depth: newDepth });

    // Update children
    for (const [childId, child] of nodesMap) {
        if (child.parent === nodeId) {
            updateNodeAndDescendants(childId, newPath, newDepth, nodesMap);
        }
    }
};

// ⭐ Add a new node
const addNode = <T>(
    item: NodesChange<T>['changes']['created'][0],
    newMap: Map<string, NodeRow<T>>
): void => {
    const nodeData = item.data;
    const parentId = nodeData.parent;

    // Root node
    if (parentId === null && nodeData.isRoot) {
        newMap.set(item.id, {
            ...nodeData,
            path: nodeData.id,
            depth: 1,
            order: 0
        });
        return;
    }

    if (parentId === null) {
        console.warn('Node with null parent and isRoot=false, skipping:', item.id);
        return;
    }

    const parent = newMap.get(parentId);
    if (parent) {
        newMap.set(item.id, {
            ...nodeData,
            path: `${parent.path}/${nodeData.id}`,
            depth: parent.depth + 1,
            order: 0
        });
    } else {
        console.warn(`Parent ${parentId} not found for node ${item.id}`);
    }
};

// ⭐ Update an existing node
const updateNode = <T>(
    item: NodesChange<T>['changes']['updated'][0],
    newMap: Map<string, NodeRow<T>>
): void => {
    const existing = newMap.get(item.id);
    if (!existing) return;

    const newNodeData = item.data;
    const newParentId = newNodeData.parent;
    const oldParentId = existing.parent;

    // Simple update (no parent change)
    if (newParentId === oldParentId) {
        newMap.set(item.id, { ...existing, ...newNodeData });
        return;
    }

    // Parent change
    if (newParentId === null) {
        // Path and depth for a node without parent (whether root or not)
        const newPath = item.id;
        const newDepth = 1;

        // Use the isRoot value sent by the server (default to false if not provided)
        const isRoot = newNodeData.isRoot === true;

        if (!isRoot) {
            console.warn(`Node ${item.id} has parent null but isRoot=false. This may cause inconsistency. liveTree decided to delete from local`);
            newMap.delete(item.id);
            return;
        }

        newMap.set(item.id, {
            ...existing,
            ...newNodeData,
            path: newPath,
            depth: newDepth,
            parent: null,
            isRoot,  // ← Use server value
        });

        updateNodeAndDescendants(item.id, newPath, newDepth, newMap);
    } else {
        const newParent = newMap.get(newParentId);
        if (!newParent) {
            console.warn(`New parent ${newParentId} not found for moving node ${item.id}`);
            return;
        }
        // Move to new parent
        newMap.set(item.id, {
            ...existing,
            ...newNodeData,
            path: `${newParent.path}/${item.id}`,
            depth: newParent.depth + 1,
            parent: newParentId,
        });
        // Update all descendants
        updateNodeAndDescendants(item.id, newParent.path, newParent.depth, newMap);
    }
};

// ⭐ Delete a node
const deleteNode = <T>(
    itemId: string,
    newMap: Map<string, NodeRow<T>>
): void => {
    const node = newMap.get(itemId);
    if (!node) return;

    const parentId = node.parent;

    const idsToDelete = [itemId];

    idsToDelete.forEach(id => newMap.delete(id));

};

// ============================================
// Main syncNodes function
// ============================================
export const syncNodes = <T>({
    changes,
    nodesMap,
    setNodesMap,
    setExpandNodesIds,
    setFetchedIds
}: SyncNodesParams<T>) => {
    const { created, updated, deleted } = changes.changes;

    const deletedIds = deleted.map(item => item.id);

    // console.log(`🔄 Syncing: created=${created.length}, updated=${updated.length}, deleted=${deleted.length}`);
    setNodesMap(prev => {
        const newMap = new Map(prev);

        for (const item of deleted) {
            deleteNode(item.id, newMap);
        }

        for (const item of updated) {
            updateNode(item, newMap);
        }

        for (const item of created) {
            addNode(item, newMap);
        }

        return newMap;
    });

    if (deletedIds.length > 0) {
        setExpandNodesIds(prev => {
            const newSet = new Set(prev);
            for (const id of deletedIds) {
                newSet.delete(id);
            }
            return newSet;
        });
        setFetchedIds(prev => {
            const newSet = new Set(prev);
            for (const id of deletedIds) {
                newSet.delete(id);
            }
            return newSet;
        });
    }

    // console.log(`✅ Sync complete. New map size: ${newMap.size}`);

    return changes;
};