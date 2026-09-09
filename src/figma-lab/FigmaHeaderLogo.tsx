interface FigmaHeaderLogoProps {
  disabled?: boolean
  onNavigateLanding?: () => void
}

export function FigmaHeaderLogo({ disabled = false, onNavigateLanding }: FigmaHeaderLogoProps) {
  return (
    <button
      type="button"
      className="figma-landing-logo"
      aria-label="Go to landing page"
      disabled={disabled || !onNavigateLanding}
      onClick={onNavigateLanding}
    >
      <img src="/ui-lab/logo.png" alt="" />
    </button>
  )
}
