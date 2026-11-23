import { type ReactNode } from 'react';

import Reveal from './Reveal';

type SectionHeaderProps = {
  title: ReactNode;
  /** Right side: counter or "see all" link */
  aside?: ReactNode;
  id?: string;
  className?: string;
};

/** One section heading pattern for the whole site: title left, meta right, hairline below */
export default function SectionHeader({ title, aside, id, className = '' }: SectionHeaderProps) {
  return (
    <Reveal className={`flex items-end justify-between gap-6 border-b border-line pb-4 mb-10 md:mb-16 ${className}`}>
      <h2 id={id} className="t-section">
        {title}
      </h2>
      {aside && <div className="text-sm md:text-base text-muted">{aside}</div>}
    </Reveal>
  );
}
