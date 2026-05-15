import { Link } from 'react-router-dom'

export function EpisodeJumpList({ items }) {
  return (
    <div className="jump-list-refined">
      {items.map((item) => (
        <div className="jump-row-refined" key={item.label}>
          <div className="jump-copy-refined">
            <div className="jump-label-refined">{item.label}</div>
            <div className="jump-hint-refined">回看相关页面，不离开当前流程语境。</div>
          </div>
          <Link to={item.to} className="mini-inline-link jump-link-refined">
            {item.button}
          </Link>
        </div>
      ))}
    </div>
  )
}
