import { Direction, RootDisplay } from "../types";

type CollapseItemsComponentsProps = {
    level: number
    dir: Direction
    theme?: string
    className?: string
    showLines?: boolean;
    index: number;
}

function CollapseItemsWithShowLines({
    index,
    level,
    dir,
    theme,
    className = '',
    showLines = true }: CollapseItemsComponentsProps) {

    return (
        <div
            key={index}
            className={`tree-collapse-line ${theme || ''} ${className}`}
            style={{
                display: "flex",
                width: "100%",
                marginLeft: dir === 'rtl' ? '0' : '14px',
                marginRight: dir === 'rtl' ? '14px' : '0'
            }}
        >
            <div
                style={{
                    width: "2px",
                    // ...(dir === 'rtl'
                    //     ? { borderRight: '1px dashed var(--tree-border-dashed, #3f3f46)', borderLeft: 'none' }
                    //     : { borderRight: '1px dashed var(--tree-border-dashed, #3f3f46)', borderLeft: 'none' }
                    // )
                }}
            >
                <span style={{ visibility: "hidden", width: 0 }}>s</span>
            </div>
            <div style={{
                width: "1.25rem",
                height: "50%",
                ...(index + 1 === level ? { borderBottom: '1px dashed var(--tree-border-dashed, #3f3f46)' } : {})
            }}>
                <span style={{ visibility: "hidden" }}>s</span>
            </div>
        </div>
    )
}


function CollapseItemsWithoutShowLines({
    index,
    level,
    dir,
    theme,
    className = '',
    showLines = true }: CollapseItemsComponentsProps) {

    return (
        <div
            key={index}
            className={`tree-collapse-line ${theme || ''} ${className}`}
            style={{
                borderLeft: "none",
                borderRight: "none",
                display: "flex",
                width: "100%",
                marginLeft: dir === 'rtl' ? '0' : '1.25rem',
                marginRight: dir === 'rtl' ? '1.25rem' : '0'
            }}
        >
            <div
                style={{ width: "10px" }}
            >
                <span style={{ visibility: "hidden", width: 0 }}>s</span>
            </div>
        </div>
    )
}



type CollapseItemsProps = {
    depth: number
    dir: Direction
    theme?: string
    className?: string
    showLines?: boolean;
    rootDisplay?: RootDisplay
}

export function CollapseItems({
    depth,
    dir,
    theme,
    className = '',
    showLines = true,
    rootDisplay
}: CollapseItemsProps) {
    const components = [];

    const getDisplayDepth = (depth: number): number => {
        if (rootDisplay?.mode === "single-root" && !rootDisplay.showRoot) {
            return depth - 1
        }
        return depth
    }

    const level = getDisplayDepth(depth)

    if (showLines) {
        for (let index = 1; index < level; index++) {
            components.push(
                CollapseItemsWithShowLines({
                    level,
                    dir,
                    theme,
                    className,
                    showLines: true,
                    index,
                })
            );
        }
    } else {
        for (let index = 1; index < level; index++) {
            components.push(
                CollapseItemsWithoutShowLines({
                    level,
                    dir,
                    theme,
                    className,
                    showLines: false,
                    index,
                })
            );
        }
    }


    return (
        <div style={{ display: "flex", height: "100%" }}>
            {components}
        </div>
    );
}