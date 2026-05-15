import { useMemo, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'

function hasActiveDescendant(item, pathname) {
  if (item.to === pathname) return true
  return item.children?.some((child) => hasActiveDescendant(child, pathname)) || false
}

function badgeClass(value) {
  if (!value) return 'badge-mini'
  if (/now/i.test(value)) return 'badge-mini badge-location'
  if (/final|input|md/i.test(value)) return 'badge-mini badge-kind'
  return 'badge-mini badge-status'
}

function SidebarNode({ item, depth = 0, pathname }) {
  const activeInBranch = hasActiveDescendant(item, pathname)
  const [open, setOpen] = useState(activeInBranch)
  const hasChildren = Boolean(item.children?.length)
  const current = item.to === pathname

  // Auto-expand when navigating to a descendant
  useEffect(() => {
    if (activeInBranch) setOpen(true)
  }, [activeInBranch])

  return (
    <div className={cn('nav-node', `depth-${depth}`)}>
      <div className="nav-node-row">
        <NavLink
          to={item.to}
          end={item.to === '/' || item.to === '/globals'}
          className={({ isActive }) => cn('nav-link', depth > 0 && 'nav-link-nested', isActive && 'active', activeInBranch && !isActive && 'branch-active')}
        >
          <span className="nav-link-main">
            <span className={cn('nav-current-dot', !current && 'ghost')} aria-hidden="true"></span>
            <span>{item.label}</span>
          </span>
          {item.badge ? <span className={badgeClass(item.badge)}>{item.badge}</span> : null}
        </NavLink>
        {hasChildren ? (
          <button type="button" className="nav-node-toggle" onClick={() => setOpen((value) => !value)}>
            {open ? '▾' : '▸'}
          </button>
        ) : null}
      </div>

      {hasChildren && open ? (
        <div className="nav-children-tree">
          {item.children.map((child) => (
            <SidebarNode key={child.to} item={child} depth={depth + 1} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function SidebarNav({ title, items, defaultOpen = true, collapsible = false }) {
  const location = useLocation()
  const hasActiveItem = useMemo(() => items.some((item) => hasActiveDescendant(item, location.pathname)), [items, location.pathname])
  const [open, setOpen] = useState(defaultOpen || hasActiveItem)

  // Auto-expand when pathname changes to an item in this section
  useEffect(() => {
    if (hasActiveItem) setOpen(true)
  }, [hasActiveItem])

  return (
    <div className="sidebar-group">
      <div className="nav-group-head">
        <div className="nav-group-title">{title}</div>
        {collapsible ? (
          <button type="button" className="nav-group-toggle" onClick={() => setOpen((value) => !value)}>
            {open ? '▾' : '▸'}
          </button>
        ) : null}
      </div>

      {open ? (
        <nav className="nav">
          {items.map((item) => (
            <SidebarNode key={item.to} item={item} pathname={location.pathname} />
          ))}
        </nav>
      ) : null}
    </div>
  )
}
