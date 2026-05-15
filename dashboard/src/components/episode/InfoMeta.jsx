export function InfoMeta({ pairs }) {
  return (
    <div className="meta-grid-refined">
      {pairs.map(([label, value]) => (
        <div key={label} className="meta-row-refined">
          <div className="meta-key-refined">{label}</div>
          <div className="meta-value-refined">{value}</div>
        </div>
      ))}
    </div>
  )
}
