import { mainNav, navSections } from '../../mock/data'
import { SidebarNav } from './SidebarNav'
import { Outlet } from 'react-router-dom'

export function AppShell({ brandText, projectName }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand brand-compact">
          <p className="brand-kicker">流程驾驶台</p>
          <h1>小说工作区{projectName ? <span className="brand-project-name"> / {projectName}</span> : null}</h1>
          <p>{brandText}</p>
        </div>

        <SidebarNav title="总览" items={mainNav} defaultOpen />
        {navSections.map((section) => (
          <SidebarNav
            key={section.id}
            title={section.title}
            items={section.items}
            defaultOpen={section.defaultOpen}
            collapsible
          />
        ))}
      </aside>

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  )
}
