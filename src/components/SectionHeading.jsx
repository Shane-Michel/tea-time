export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? (
        <h2 id={id}>
          {title}
        </h2>
      ) : null}
      {description ? <p>{description}</p> : null}
    </div>
  )
}
