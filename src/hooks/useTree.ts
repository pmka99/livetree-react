import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { NodeRow, RootDisplay, TreeNode } from "../types"
import { flattenTree } from "../utils/flattenTree"
import { useSupportsAdvancedMode } from "./useSupportsAdvancedMode"
import { syncNodes } from "../syncData/syncNodes"
import { NodesChange } from "../types/index"

type Props<T = unknown> = {
    fetchApi: (id: string) => Promise<TreeNode<T>>;
    fetchRootApi: () => Promise<TreeNode<T> | TreeNode<T>[]>;
    rootDisplay?: RootDisplay
}

export const useTree = <T = unknown>({
    fetchApi,
    fetchRootApi,
    rootDisplay = {
        mode: 'single-root',
        showRoot: true,
    },
}: Props<T>) => {

    const normalizedRootDisplay: RootDisplay = {
        ...rootDisplay,
        showRoot: rootDisplay.showRoot ?? true,
    }


    const advancedServerDataMode = false
    const [nodesMap, setNodesMap] = useState<Map<string, NodeRow<T>>>(new Map())
    const [expandNodesIds, setExpandNodesIds] = useState<Set<string>>(new Set())
    const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set())
    const [selectedItem, setSelectedItem] = useState<NodeRow<T> | null>(null)
    const [rootIds, setRootIds] = useState<string[]>([])
    const [rootId, setRootId] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const isMounted = useRef(true)

    const {
        supportsAdvancedMode,
        checking: checkingAdvancedMode,
        error: advancedModeError
    } = useSupportsAdvancedMode({
        advancedServerDataMode,
        fetchRootApi
    })

    const resetTree = useCallback(async () => {
        if (!isMounted.current) return

        setLoading(true)
        try {
            const result = await fetchRootApi()

            if (!isMounted.current) return

            const roots = Array.isArray(result) ? result : [result]

            const allFlatNodes: NodeRow<T>[] = []
            for (const root of roots) {
                const flatNodes = flattenTree(root)
                allFlatNodes.push(...flatNodes)
            }
            setNodesMap(new Map(allFlatNodes.map(n => [n.id, n])))
            setRootIds(roots.map(r => r.id))
            setRootId(roots[0]?.id || null)

        } catch (error) {
            console.error("Failed to load tree:", error)
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        if (normalizedRootDisplay.mode === 'single-root' && !normalizedRootDisplay.showRoot && rootId) {
            setExpandNodesIds(prev => prev.has(rootId) ? prev : new Set([...prev, rootId]))
            setFetchedIds(prev => prev.has(rootId) ? prev : new Set([...prev, rootId]))
        }
    }, [normalizedRootDisplay.mode, normalizedRootDisplay.showRoot, rootId])

    useEffect(() => {
        isMounted.current = true
        resetTree()

        return () => {
            isMounted.current = false
        }
    }, [resetTree])

    const sortedNodes = useMemo(() =>
        Array.from(nodesMap.values()).sort((a, b) => {

            const pathCompare = a.path.localeCompare(b.path);
            if (pathCompare !== 0) return pathCompare;

            return (a.order || 0) - (b.order || 0);
        }), [nodesMap]
    );

    const visibleNodes = useMemo(() => {
        let result: NodeRow<T>[] = []
        let forbiddenDepth: number | null = null

        for (const node of sortedNodes) {
            if (forbiddenDepth !== null && node.depth > forbiddenDepth) {
                continue
            }
            forbiddenDepth = null

            result.push(node)

            if (node.hasChild && !expandNodesIds.has(node.id)) {
                forbiddenDepth = node.depth
            }
        }

        if (normalizedRootDisplay.mode === 'single-root' && !normalizedRootDisplay.showRoot) {
            result = result.filter(node => node.parent !== null)
        }

        return result
    }, [sortedNodes, expandNodesIds, normalizedRootDisplay])

    const expandHandler = useCallback(async (node: NodeRow<T>) => {
        if (!fetchedIds.has(node.id)) {
            const res = await fetchApi(node.id)
            const parentID = nodesMap.get(node.id)?.parent
            const nodeRows = flattenTree(res, parentID, node.depth, node.path, node.order)

            setNodesMap(prev => {
                const newMap = new Map(prev)
                nodeRows.forEach(row => newMap.set(row.id, row))
                return newMap
            })

            setFetchedIds(prev => new Set([...prev, node.id]))
        }
        setExpandNodesIds(prev => new Set([...prev, node.id]))
    }, [fetchedIds, fetchApi, nodesMap])

    const unExpandHandler = useCallback((node: NodeRow<T>) => {
        setExpandNodesIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(node.id)
            return newSet
        })
    }, [])

    const selectNode = useCallback((node: NodeRow<T> | null) => {
        setSelectedItem(node)
    }, [])

    //------------------------------------------------
    const nodesMapRef = useRef(nodesMap);

    useEffect(() => {
        nodesMapRef.current = nodesMap;
    }, [nodesMap]);

    const syncNodesWithChange = useCallback((data: NodesChange<T>) => {

        syncNodes({
            changes: data,
            nodesMap: nodesMapRef.current,
            setNodesMap,
            setExpandNodesIds,
            setFetchedIds
        });
    }, [setNodesMap, setExpandNodesIds, setFetchedIds]);


    const store = {
        rootDisplay: normalizedRootDisplay,
        visibleNodes,
        expandNodesIds,
        expandHandler,
        unExpandHandler,
        selectedItem,
        selectNode
    }


    return {
        store,
        fetchRootApi,
        fetchApi,
        fetchedIds,
        setFetchedIds,
        loading,
        checkingAdvancedMode,
        advancedModeError,
        rootId,
        rootIds,
        sortedNodes,
        nodesMap,
        visibleNodes,
        expandNodesIds,
        setExpandNodesIds,
        expandHandler,
        unExpandHandler,
        selectedItem,
        setSelectedItem,
        selectNode,
        syncNodesWithChange,
        resetTree
    }
}