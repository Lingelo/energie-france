import { timeAgo } from '../utils/format';

interface Props {
  latestDate: string | null;
  onAboutClick: () => void;
}

export function Footer({ latestDate, onAboutClick }: Props) {
  return (
    <footer className="border-t border-[#e2e8f0] pt-3">
      <div className="flex items-center justify-between text-xs text-[#64748b]">
        <div className="flex items-center gap-2">
          <a
            href="https://odre.opendatasoft.com/explore/dataset/eco2mix-national-tr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0072CE] hover:underline"
          >
            RTE eCO2mix
          </a>
          {latestDate && (
            <>
              <span className="text-[#e2e8f0]">|</span>
              <span>{timeAgo(latestDate)}</span>
            </>
          )}
        </div>
        <button
          onClick={onAboutClick}
          className="text-[#0072CE] hover:underline"
        >
          A propos
        </button>
      </div>
    </footer>
  );
}
