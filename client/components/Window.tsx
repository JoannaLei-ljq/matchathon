import { Pixel, type SpriteName } from './Pixel';

type Tone = 'matcha' | 'mocha' | 'lemon';

const barTone: Record<Tone, string> = {
  matcha: '',
  mocha: '!bg-mocha',
  lemon: '!bg-lemon-deep !text-mocha',
};

/** A retro OS window: pixel-font title bar with fake controls, cream body. */
export function Window({
  title,
  icon,
  tone = 'matcha',
  className = '',
  bodyClassName = 'p-5',
  controls = true,
  onClose,
  children,
  as: Tag = 'section',
  ...rest
}: {
  title: string;
  icon?: SpriteName;
  tone?: Tone;
  className?: string;
  bodyClassName?: string;
  controls?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  as?: 'section' | 'article' | 'div' | 'aside';
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`win ${className}`} {...rest}>
      <div className={`win-bar ${barTone[tone]}`}>
        <span className="flex min-w-0 items-center gap-1.5">
          {icon && <Pixel sprite={icon} scale={1.5} />}
          <span className="truncate">{title}</span>
        </span>
        {controls && (
          <span className="flex shrink-0 gap-1" aria-hidden={onClose ? undefined : true}>
            <span className="win-ctl">_</span>
            <span className="win-ctl">□</span>
            {onClose ? (
              <button type="button" className="win-ctl hover:bg-berry" onClick={onClose} aria-label="Close">
                x
              </button>
            ) : (
              <span className="win-ctl">x</span>
            )}
          </span>
        )}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}
