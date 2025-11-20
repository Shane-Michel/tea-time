export default function Card({ title, subtitle, children, meta, variant = 'default' }) {
  const classes = ['card']
  if (variant === 'soft') classes.push('card--soft')

  return (
    <article className={classes.join(' ')}>
      {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {children}
      {meta ? <div className="card__meta">{meta}</div> : null}
    </article>
  )
}
