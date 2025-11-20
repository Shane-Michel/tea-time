export default function Button({ variant = 'primary', as = 'button', className = '', children, ...rest }) {
  const Component = as
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ')
  const componentProps = Component === 'button' ? { type: 'button', ...rest } : rest

  return (
    <Component className={classes} {...componentProps}>
      {children}
    </Component>
  )
}
