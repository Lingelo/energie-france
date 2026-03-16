import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e2e8f0] rounded-xl p-6 max-w-lg mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-[#1e293b]">A propos</h2>
        <div className="space-y-3 text-sm text-[#64748b]">
          <p>
            <strong className="text-[#1e293b]">Energie France</strong> est un tableau
            de bord open source qui visualise la production electrique, la
            consommation et les emissions de CO2 en France metropolitaine.
          </p>
          <p>
            Les donnees proviennent du jeu de donnees{' '}
            <strong className="text-[#1e293b]">eCO2mix</strong> publie par{' '}
            <a
              href="https://www.rte-france.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0072CE] hover:underline"
            >
              RTE
            </a>{' '}
            et distribue via la plateforme{' '}
            <a
              href="https://odre.opendatasoft.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0072CE] hover:underline"
            >
              ODRE (Open Data Reseaux Energies)
            </a>
            .
          </p>
          <p>
            Les donnees temps reel sont mises a jour toutes les 15 minutes par RTE.
            Le pipeline de ce site actualise les donnees toutes les 6 heures.
          </p>
          <p>
            Licence des donnees :{' '}
            <a
              href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0072CE] hover:underline"
            >
              Licence Ouverte v2.0
            </a>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-5 px-4 py-2 bg-[#0072CE] hover:bg-[#005EB8] text-white rounded-lg text-sm font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>,
    document.body
  );
}
