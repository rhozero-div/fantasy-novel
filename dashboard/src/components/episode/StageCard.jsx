import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export function StageCard({ stage }) {
  return (
    <div className="stage-card stage-card-refined">
      <div className="stage-head stage-head-refined">
        <strong>{stage.name}</strong>
        <span className={cn('stage-status', stage.statusClass)}>{stage.status}</span>
      </div>
      <div className="slot-list stage-body stage-body-refined">
        {stage.slots.map((slot) => (
          <div
            key={slot.name}
            className={cn(
              'slot slot-refined',
              slot.active && 'active',
              slot.missing && 'missing',
              slot.blocked && 'blocked',
              slot.warning && 'top-warning',
            )}
          >
            <div className="slot-row slot-row-refined">
              <span className="slot-name">{slot.name}</span>
              <span className={cn('tag slot-tag-refined', slot.tone)}>{slot.badge}</span>
            </div>
            <div className="slot-meta slot-meta-refined">{slot.meta}</div>
            {slot.to ? (
              <div className="slot-link-row slot-link-row-refined">
                <Link to={slot.to} className="mini-inline-link">
                  查看关联页
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
