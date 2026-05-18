# 🌳 LiveTree – React Tree Component

A feature-rich, highly customizable tree component for React with built-in support for collaborative editing, drag & drop, context menus, action buttons, virtual scrolling, RTL, theming, and real‑time synchronization with backend APIs.

## ✨ Features
✅ Dynamic loading – lazy load child nodes on expand

✅ Multiple root modes – single‑root (with optional root hiding) or multi‑root

✅ Drag & drop – reorder nodes, move between parents, drop before/after/inside

✅ Context menu – custom actions per node

✅ Action buttons – inline buttons (Add, Edit, Delete, etc.) with overflow menu

✅ Virtual scrolling – efficient rendering of large trees

✅ Real‑time sync – integrate with WebSocket updates (nodes:change)

✅ Theming – CSS variables or full class name overrides

✅ RTL support – right‑to‑left layout

✅ Size variants – small, medium, large

✅ Expand/collapse strategies – click on item or on dedicated icon

✅ Show/hide lines – tree connection lines

✅ TypeScript – fully typed


## 📦 Installation
```bash
npm install @livetree/react
# or
yarn add @livetree/react
```
Note: The component is written in TypeScript and requires React 16.8+ (hooks).


## 🚀 Quick Start

```tsx
import LiveTree, { useTree, NodeRow } from '@livetree/react';
import '@livetree/react/style.css'; // optional default styles

function App() {
  const { store, loading } = useTree({
    fetchApi: async (id) => {
      const res = await fetch(`/api/category/${id}`);
      return res.json();
    },
    fetchRootApi: async () => {
      const res = await fetch('/api/category/root');
      return res.json();
    },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <LiveTree
      visibleNodes={store.visibleNodes}
      expandNodesIds={store.expandNodesIds}
      expandHandler={store.expandHandler}
      unExpandHandler={store.unExpandHandler}
      selectNode={store.selectNode}
      selectedItem={store.selectedItem}
    />
  );
}
```

## LiveTree Component Props

|Prop |	Type |	Default | Description |
|:---:|:----:|:--------:|:-----------:|
|visibleNodes     |	NodeRow<T>[]  |	required | Flattened array of nodes to display (from useTree) |
|expandNodesIds   |	Set<string> |	required |	Set of expanded node IDs |
|expandHandler	  |   (node: NodeRow<T>) => Promise<void> |	required |	Called when a node should expand |
|unExpandHandler  |	(node: NodeRow<T>) => void |	required |	Called when a node should collapse |
|selectNode	      | (node: NodeRow<T> | null) => void |	required |	Callback to set selected node |
|selectedItem	  | NodeRow<T> | null |	required |	Currently selected node |
|actionButtons	  |ActionButtonsType<T> |	undefined |	Inline buttons configuration |
|rootDisplay	  |RootDisplay |	{ mode: 'single-root', showRoot: true } |	Root visibility settings |
|dir	          |'ltr' / 'rtl' |	'ltr' |	Text direction |
|size	          |'small' / 'medium' / 'large' |	'medium' |	Component size |
|theme	          |TreeTheme<T> |	{}	| CSS class names for styling |
|classNames	      |ClassNames<T> |	{} |	Additional class names (overrides) |
|renderNode	      |(props: RenderNodeProps<T>) => React.ReactNode |	undefined |	Custom node renderer |
|renderNodeIcon	  |(node: NodeRow<T>) => React.ReactNode |	undefined |	Custom icon renderer |
|showLines	      |boolean |	true |	Show tree guide lines |
|constLabelWidth  |	number |	undefined |	Fixed label width (px) |
|expandStrategy	  |'click on item' / 'click on expanedIcon' |	'click on expanedIcon' |	How to expand/collapse |
|showExpandIcons  |	boolean |	true |	Show expand/collapse | buttons |
|icons	          |{ expand?: { expanedIcon, unExpandedIcon }, nodesIcon?: ReactNode } |	undefined |	Custom expand icons |
|dragDrop	      |{ enabled: boolean; onDrag?, onDrop? } |	{ enabled: false } |	Drag & drop configuration |
|virtualization	  |{ enabled: boolean; rowHeight?, containerHeight?, overscan? } |	{ enabled: false } |	Virtual scrolling settings |

## useTree Hook

The useTree hook manages data fetching, flattening, expansion state, and real‑time synchronization.

```tsx
const {
  store,                // { visibleNodes, expandNodesIds, expandHandler, unExpandHandler, selectedItem, selectNode }
  loading,              // boolean
  fetchedIds,           // Set<string>
  syncNodesWithChange,  // (data: NodesChange<T>) => void
  resetTree,            // () => Promise<void>
  // ... other internals
} = useTree({
  fetchApi,      // (id: string) => Promise<TreeNode<T>>
  fetchRootApi,  // () => Promise<TreeNode<T> | TreeNode<T>[]>
  rootDisplay,   // optional
  rootProtection,// optional
});
```

### Parameters

|Param | Type |	Description |
|:---:|:----:|:--------:|
|fetchApi |	(id: string) => Promise<TreeNode<T>> |	Fetch a single node by ID (including its children) |
|fetchRootApi |	() => Promise<TreeNode<T> TreeNode<T>[]> |	Fetch the root node(s) |
|rootDisplay |	RootDisplay |	Same as LiveTree prop |
|rootProtection |	{ allowRootDeletion?, allowRootMove? } |	Prevent root modifications |


### Return Values
|Property |	Type | Description |
|:---:|:----:|:--------:|
|store |	object |	Contains visibleNodes, expandNodesIds, handlers, etc. – pass directly to <LiveTree> |
|loading |	boolean	| Initial load status |
|fetchedIds |	Set<string> |	IDs of nodes whose children have been fetched |
|syncNodesWithChange |	(data: NodesChange<T>) => void |	Apply WebSocket changes to local state |
|resetTree |	() => Promise<void> |	Reload entire tree from API |


## Synchronization with Backend (WebSocket)

When using the backend with nodes:change messages (see Live Tree Backend), call syncNodesWithChange on each WebSocket message:

```tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001?userId=xxx&userName=xxx');
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'nodes:change') {
      syncNodesWithChange(message.payload);
    }
  };
  return () => ws.close();
}, [syncNodesWithChange]);
```
The syncNodes utility (internal) will:

Add/update/delete nodes in the local Map

Adjust path and depth for moved nodes

Clean up expansion and fetched IDs for deleted nodes


## Action Buttons Configuration

```tsx
const actionButtons = {
  add: {
    Icon: <PlusIcon />,
    title: 'Add child',
    handler: (id, node) => console.log('Add', id),
  },
  edit: {
    Icon: <EditIcon />,
    title: 'Edit',
    showInMenu: true,   // moves to "more" menu
    handler: (id, node) => console.log('Edit', id),
  },
  remove: {
    Icon: <TrashIcon />,
    title: 'Delete',
    handler: async (id, node) => { /* call API */ },
  },
};
```
Built‑in keys: 'add', 'edit', 'remove', 'removeChildren', 'removeNodeAndChildren'. You can also use any custom string key.

## Drag & Drop

```tsx
<LiveTree
  dragDrop={{
    enabled: true,
    onDrag: (dragNode) => console.log('Dragging', dragNode),
    onDrop: async (dragNode, targetNode, position) => {
      // position: 'before' | 'after' | 'inside'
      await fetch(`/api/category/${dragNode.id}/move`, {
        method: 'PUT',
        body: JSON.stringify({ newParentId: targetNode.id, position }),
      });
    },
  }}
/>
```

## Virtual Scrolling
For trees with thousands of nodes:

```tsx
<LiveTree
  virtualization={{
    enabled: true,
    rowHeight: 36,           // px
    containerHeight: 600,    // px
    overscan: 5,             // extra rows above/below
  }}
/>
```

## Data Structures
LiveTree expects and uses the following TypeScript types. All types are generic (<T>) to allow custom extra data.

### 1. TreeNode<T> – Server/API Response Format
This is the format your API must return when fetching nodes (e.g., from fetchApi or fetchRootApi).
```typescript
type TreeNode<T = unknown> = {
  id: string;                    // unique identifier
  label: string;                 // display text
  hasChild: boolean;             // does it have children? (for lazy loading)
  parent: string | null;         // parent ID (null for root)
  isRoot: boolean;               // is this a root node?
  version?: number;              // optional – used for optimistic locking
  icon?: string | React.ReactNode; // custom icon
  createdAt?: Date | string;     // optional metadata
  extraData?: T;                 // any additional data you want to attach
  
  children: Array<{              // IMPORTANT: must be an array of the same structure
    id: string;
    label: string;
    hasChild: boolean;
    version?: number;
    icon?: string | React.ReactNode;
    isRoot: boolean;
    createdAt?: Date | string;
    extraData?: T;
  }>;
};
```
Example response from /api/category/root:
```json
{
  "id": "root-1",
  "label": "Categories",
  "hasChild": true,
  "parent": null,
  "isRoot": true,
  "version": 5,
  "children": [
    {
      "id": "cat-1",
      "label": "Electronics",
      "hasChild": true,
      "parent": "root-1",
      "isRoot": false,
      "children": []
    }
  ]
}
```

### 2. NodesChangeData<T> – WebSocket Update Payload
When you receive a nodes:change message from the server (WebSocket), the data field inside created, updated, or deleted must follow this structure:
```typescript
type NodesChangeData<T = unknown> = {
  id: string;
  label: string;
  hasChild: boolean;
  parent: string | null;
  isRoot: boolean;
  version?: number;
  icon?: string | React.ReactNode;
  createdAt?: Date | string;
  extraData?: T;
};
```
Example WebSocket message:
```json
{
  "type": "nodes:change",
  "payload": {
    "changes": {
      "created": [
        {
          "id": "new-123",
          "name": "New Category",
          "data": {
            "id": "new-123",
            "label": "New Category",
            "hasChild": false,
            "parent": "cat-1",
            "isRoot": false
          }
        }
      ],
      "updated": [],
      "deleted": []
    }
  }
}
```

### 3. NodeRow<T> – Internal Flat Node (used by LiveTree component)
You don't need to construct this manually. It is generated by useTree and passed to visibleNodes and other props.
```typescript
type NodeRow<T = unknown> = {
  id: string;
  label: string;
  depth: number;          // level in tree (1 = root)
  hasChild: boolean;
  parent: string | null;
  path: string;           // e.g., "root-1/cat-1/sub-1"
  version?: number;
  order: number;          // index among siblings
  icon?: string | React.ReactNode;
  isRoot: boolean;
  createdAt?: Date | string;
  extraData?: T;
};
```
### Important Notes:
For real‑time sync, the WebSocket nodes:change payload must exactly match the NodesChangeData structure inside data field.

version field is optional but highly recommended if you implement conflict resolution or optimistic locking.


## Theming & Styling

### CSS Variables

Override the default variables (see style.css in source):

```css
:root {
  --tree-primary: #dbeafe;
  --tree-primary-hover: #60a5fa;
  --tree-neutral-hover: #e5e7eb;
  --tree-border: #e5e7eb;
  --tree-border-dashed: #3f3f46;
  --tree-text: #1f2937;
  /* ... */
}
```

### Class Name Overrides

Use theme (static class names) or classNames (dynamic functions) props:

```tsx
<LiveTree
  theme={{
    container: 'my-tree-container',
    node: 'custom-node',
    button: 'custom-toggle',
    label: 'custom-label',
  }}
  classNames={{
    node: (node) => node.isRoot ? 'root-node' : 'child-node',
  }}
/>
```

### Size Variants

The component includes three built‑in sizes: small, medium, large. Use the size prop.


## TypeScript Types

The library exports all types:
```tsx
import {
  LiveTree,
  useTree,
  NodeRow,
  TreeNode,
  NodesChange,
  ActionButtonsType,
  TreeTheme,
  ClassNames,
  RootDisplay,
  Direction,
  Size,
  ExpandStrategy,
  DropPosition,
} from '@livetree/react';
```

## Examples
### Basic Tree with Custom Node Renderer

```tsx
<LiveTree
  {...store}
  renderNode={({ node, isExpanded, onExpand, onCollapse, hasChild, isSelected, selectNode }) => (
    <div style={{ background: isSelected ? '#eef' : 'transparent' }}>
      <span onClick={hasChild ? (isExpanded ? onCollapse : onExpand) : undefined}>
        {node.label}
      </span>
    </div>
  )}
/>
```

### Multi‑root Mode ![Experimental](https://img.shields.io/badge/status-experimental-orange)

```tsx
useTree({
  fetchRootApi: async () => {
    const res = await fetch('/api/category/roots'); // returns array
    return res.json();
  },
  rootDisplay: { mode: 'multi-root' },
});
```

### Hide Root Node (Single‑root) ![Experimental](https://img.shields.io/badge/status-experimental-orange)

```tsx
rootDisplay={{
  mode: 'single-root',
  showRoot: false,   // root not displayed, children become top-level
  label: 'Custom Root Label', // optional
}}
```

## 📄 License
MIT © Mohammad Karimi (https://github.com/pmka99)

## 📞 Contact
For questions or suggestions, please open an issue on GitHub or contact the maintainer.

[![GitHub](https://img.shields.io/badge/GitHub-pmka99-181717?logo=github&style=flat-square)](https://github.com/pmka99)

[![Email](https://img.shields.io/badge/Email-mohammad.karimi.wrk%40gmail.com-D14836?logo=gmail&style=flat-square)](mailto:mohammad.karimi.wrk@gmail.com)

## 🤝 Contributing
Issues and pull requests are welcome. Please follow the existing code style and add tests for new features.

## Related Projects
Live Tree Backend (https://github.com/pmka99/livetree-node-server-example) – Node.js + MongoDB + WebSocket server that pairs perfectly with this component.

Happy tree building! 🌳

