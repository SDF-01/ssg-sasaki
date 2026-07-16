import type { ReactNode } from 'react';

export type PageVariant = 'videos' | 'music' | 'accounts' | 'add';

interface PageSpreadProps {
  variant: PageVariant;
  children: ReactNode;
  className?: string;
}

interface PageBannerProps {
  sticker: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
}

interface PageFrameProps {
  label: string;
  labelIcon?: string;
  variant?: 'default' | 'notebook' | 'polaroid' | 'cassette' | 'sticker';
  aside?: boolean;
  className?: string;
  children: ReactNode;
}

export function PageSpread({ variant, children, className = '' }: PageSpreadProps) {
  return (
    <div className={`page-spread page-spread--${variant} ${className}`.trim()}>
      <span className="page-spread__corner" aria-hidden="true" />
      <span className="page-spread__heart page-spread__heart--tl" aria-hidden="true">
        ♡
      </span>
      <span className="page-spread__heart page-spread__heart--br" aria-hidden="true">
        ✨
      </span>
      {children}
    </div>
  );
}

export function PageBanner({ sticker, title, subtitle, meta }: PageBannerProps) {
  return (
    <header className="page-banner">
      <span className="page-banner__sticker" aria-hidden="true">
        {sticker}
      </span>
      <span className="page-banner__bubble" aria-hidden="true">
        ♡
      </span>
      <div className="page-banner__copy">
        <h2 className="page-banner__title">{title}</h2>
        {subtitle ? <p className="page-banner__subtitle">{subtitle}</p> : null}
      </div>
      {meta ? <div className="page-banner__meta">{meta}</div> : null}
      <span className="page-banner__rule" aria-hidden="true" />
    </header>
  );
}

export function PageFrame({
  label,
  labelIcon,
  variant = 'default',
  aside = false,
  className = '',
  children,
}: PageFrameProps) {
  return (
    <section
      className={`page-frame page-frame--${variant} ${aside ? 'page-frame--aside' : ''} ${className}`.trim()}
    >
      {aside ? <span className="page-frame__binding" aria-hidden="true" /> : null}
      <span className="page-frame__tape" aria-hidden="true" />
      <span className="page-frame__heart" aria-hidden="true">
        ♡
      </span>
      <header className="page-frame__head">
        {labelIcon ? (
          <span className="page-frame__icon" aria-hidden="true">
            {labelIcon}
          </span>
        ) : null}
        <h3 className="page-frame__label">{label}</h3>
      </header>
      <div className="page-frame__body">{children}</div>
    </section>
  );
}

export function PageMetaChip({ children }: { children: ReactNode }) {
  return <span className="page-meta-chip">{children}</span>;
}
