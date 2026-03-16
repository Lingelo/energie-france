import { timeAgo } from '../utils/format';

interface Props {
  latestDate: string | null;
  onAboutClick: () => void;
}

export function Footer({ latestDate, onAboutClick }: Props) {
  return (
    <footer className="border-t border-[#334155] py-6 mt-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#94a3b8]">
        <div className="flex items-center gap-3">
          <span>
            Donnees :{' '}
            <a
              href="https://odre.opendatasoft.com/explore/dataset/eco2mix-national-tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b5cf6] hover:underline"
            >
              RTE eCO2mix via ODRE
            </a>
          </span>
          <span className="text-[#334155]">|</span>
          <a
            href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Licence Ouverte v2.0
          </a>
        </div>
        <div className="flex items-center gap-3">
          {latestDate && (
            <span className="text-xs">
              Donnees : {timeAgo(latestDate)}
            </span>
          )}
          <button
            onClick={onAboutClick}
            className="text-[#8b5cf6] hover:underline text-sm"
          >
            A propos
          </button>
        </div>
      </div>
    </footer>
  );
}
