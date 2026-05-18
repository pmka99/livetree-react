import { useEffect, useState } from "react"
import { TreeNode } from "../types";

type SupportsAdvancedModeParam<T = unknown> = {
    advancedServerDataMode: boolean;
    fetchRootApi: () => Promise<TreeNode<T> | TreeNode<T>[]>;
    onCheckComplete?: (supports: boolean) => void;  
}

export const useSupportsAdvancedMode = <T = unknown>({
    advancedServerDataMode,
    fetchRootApi,
    onCheckComplete
}: SupportsAdvancedModeParam<T>) => {

    const [supportsAdvancedMode, setSupportsAdvancedMode] = useState<boolean | null>(null)
    const [checking, setChecking] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const checkData = async () => {
        if (!advancedServerDataMode) {
            setSupportsAdvancedMode(null)
            setChecking(false)
            return
        }

        setChecking(true)
        setError(null)

        try {
            const result = await fetchRootApi()

            const roots = Array.isArray(result) ? result : [result]

            if (roots.length === 0) {
                console.warn('No roots found in data')
                setSupportsAdvancedMode(false)
                onCheckComplete?.(false)
                return
            }

            const allHaveParent = roots.every(root =>
                root && 'parent' in root && root.parent !== undefined
            )
            const allHaveVersion = roots.every(root =>
                root && 'version' in root && root.version !== undefined
            )

            const supports = allHaveParent && allHaveVersion

            if (!supports) {
                console.warn(
                    'advancedServerDataMode is enabled but data missing "parent" or "version" fields. ' +
                    'Falling back to simple mode.'
                )
            }

            setSupportsAdvancedMode(supports)
            onCheckComplete?.(supports)

        } catch (err) {
            console.error("Failed to check advanced mode:", err)
            setError(err instanceof Error ? err : new Error(String(err)))
            setSupportsAdvancedMode(false)
            onCheckComplete?.(false)
        } finally {
            setChecking(false)
        }
    }

    useEffect(() => {
        checkData()
    }, [advancedServerDataMode, fetchRootApi])

    const recheck = () => {
        checkData()
    }

    const reset = () => {
        setSupportsAdvancedMode(null)
        setChecking(false)
        setError(null)
    }

    return {
        supportsAdvancedMode,
        checking,      
        error,         
        recheck,       
        reset          
    }
}