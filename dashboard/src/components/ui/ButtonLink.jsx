import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export function ButtonLink({ to, children, tone }) {
  return (
    <Link to={to} className={cn('btn', tone)}>
      {children}
    </Link>
  )
}
