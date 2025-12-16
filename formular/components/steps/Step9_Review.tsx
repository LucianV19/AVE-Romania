
import React from 'react';
import { FormData, FormErrors, ProiectNarativ, UploadedFile } from '../../types';
import { NIVELURI_INVATAMANT, CATEGORII_PROIECT } from '../../constants';
import EditIcon from '../icons/EditIcon';
import DocumentIcon from '../icons/DocumentIcon';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
  goToStep: (step: number, elementId?: string) => void;
  userName?: string;
}

interface ReviewItemProps {
  label: string;
  value?: string | null | React.ReactNode;
  onEdit?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ label, value, onEdit }) => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  return (
    <div className="py-3 flex justify-between items-start gap-4 group">
      <div>
        <dt className="font-semibold text-brand-text-light text-sm">{label}</dt>
        <dd className="mt-1 text-brand-white whitespace-pre-wrap break-words">{value}</dd>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-2 -my-2 -mr-2 rounded-full text-brand-text-light/60 hover:text-brand-white hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
          aria-label={`Editează ${label}`}
        >
          <EditIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; step: number; onEdit: (step: number, elementId: string) => void; firstElementId: string; }> = ({ title, step, onEdit, firstElementId }) => (
    <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3">
        <h3 className="text-xl font-semibold text-brand-white">{title}</h3>
        <button 
            type="button" 
            onClick={() => onEdit(step, firstElementId)} 
            className="group flex items-center gap-2 text-sm text-brand-text-light hover:text-brand-white transition-colors duration-200 p-2 -m-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-button/50 hover:bg-brand-button/10"
            aria-label={`Editează ${title}`}
        >
            <EditIcon className="transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">Editează</span>
        </button>
    </div>
);

const narativFieldLabels: { [key in keyof Omit<ProiectNarativ, 'documenteJustificative'>]: string } = {
    modelInterventie: 'Model de intervenție',
    schimbariProduse: 'Schimbări produse',
    strategieComunicare: 'Strategie de comunicare',
    riscuriGestionate: 'Riscuri gestionate',
    indicatoriMasurati: 'Indicatori măsurați',
    continuitate: 'Continuitate',
    invataturi: 'Învățături',
    relatieAutoritati: 'Relația cu autoritățile',
};

const Step9_Review: React.FC<Props> = ({ data, handleChange, errors, goToStep, userName }) => {
  const formatPhone = (v: string) => {
    const d = (v || '').replace(/\D/g, '').slice(0, 10);
    const a = d.slice(0, 2);
    const b = d.slice(2, 4);
    const c = d.slice(4, 7);
    const e = d.slice(7, 10);
    let r = a;
    if (b) r += b;
    if (c) r += ' ' + c;
    if (e) r += ' ' + e;
    return r;
  };
  const getSelectedLabels = (source: {id: string, label: string}[], selections: {[key: string]: boolean}) => {
    return Object.entries(selections)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => source.find(item => item.id === key)?.label)
      .filter(Boolean).join(', ');
  };
  
  const statisticiLabels: { [key in keyof FormData['statistici']]: string } = {
    eleviInscrisi: 'Elevi înscriși', eleviRomi: 'Elevi romi', eleviCES: 'Elevi CES',
    eleviDezavantajati: 'Elevi dezavantajați', eleviBursaSociala: 'Elevi cu bursă socială',
    eleviNavetisti: 'Elevi navetiști', eleviAbandonScolar: 'Elevi în risc de abandon',
    personalDidacticTitular: 'Personal didactic titular',
    personalDidacticSuplinitor: 'Personal didactic suplinitor',
    personalNedidactic: 'Personal nedidactic',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none">Pasul 9: Finalizare și Trimitere</h2>
        <button type="button" onClick={() => window.print()} className="print:hidden py-2 px-4 text-sm bg-brand-button text-brand-white font-bold uppercase rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-button transition-all duration-300">
          Exportă PDF
        </button>
      </div>
      <p className="text-brand-text-light text-center mb-8">
        {userName ? `Aproape gata, ${userName}! ` : ''}Vă rugăm să verificați cu atenție informațiile de mai jos înainte de a trimite formularul.
      </p>
      
      <div className="space-y-4 bg-white/5 p-6 rounded-lg border border-gray-700">
        
        <details open className="group">
            <summary className="list-none">
              <SectionHeader title="Date Contact" step={1} onEdit={goToStep} firstElementId="email" />
            </summary>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-800">
              <ReviewItem label="Nume Complet" value={`${data.nume} ${data.prenume}`} onEdit={() => goToStep(1, 'nume')} />
              <ReviewItem label="Email" value={data.email} onEdit={() => goToStep(1, 'email')} />
              <ReviewItem label="Telefon" value={formatPhone(data.telefon)} onEdit={() => goToStep(1, 'telefon')} />
            </dl>
        </details>

        <details className="group">
            <summary className="list-none">
              <SectionHeader title="Experiență Profesională" step={2} onEdit={goToStep} firstElementId="functie-inceput-section" />
            </summary>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-800">
              <ReviewItem label="Început funcție" value={`${data.functieInceputLuna} ${data.functieInceputAn}`} onEdit={() => goToStep(2, 'functie-inceput-section')} />
              <ReviewItem label="Ani de activitate în sistem" value={data.aniActivitateSistem} onEdit={() => goToStep(2, 'aniActivitateSistem')} />
              <ReviewItem label="Ani de conducere acumulați" value={data.aniConducereAcumulati} onEdit={() => goToStep(2, 'ani-conducere-acumulati-section')} />
              <ReviewItem label="Mod ocupare funcție" value={data.modOcupareFunctie} onEdit={() => goToStep(2, 'modOcupareFunctie')} />
            </dl>
        </details>

        <details className="group">
            <summary className="list-none">
              <SectionHeader title="Unitatea de Învățământ" step={3} onEdit={goToStep} firstElementId="denumireUnitate" />
            </summary>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-800">
                <ReviewItem label="Denumire" value={data.denumireUnitate} onEdit={() => goToStep(3, 'denumireUnitate')} />
                <ReviewItem label="Website" value={data.websiteUnitate} onEdit={() => goToStep(3, 'websiteUnitate')} />
                <ReviewItem label="Județ" value={data.judetUnitate} onEdit={() => goToStep(3, 'judetUnitate')} />
                <ReviewItem label="Localitate" value={data.localitateUnitate} onEdit={() => goToStep(3, 'localitateUnitate')} />
                <ReviewItem label="Adresă" value={data.adresaUnitate} onEdit={() => goToStep(3, 'adresaUnitate')} />
                <ReviewItem label="Regiune" value={data.regiuneUnitate} onEdit={() => goToStep(3, 'regiuneUnitate')} />
                <ReviewItem label="Niveluri asigurate" value={getSelectedLabels(NIVELURI_INVATAMANT, data.niveluriInvatamant)} onEdit={() => goToStep(3, 'niveluri-invatamant-section')} />
                <ReviewItem label="Are personalitate juridică" value={data.arePersonalitateJuridica} onEdit={() => goToStep(3, 'personalitate-juridica-section')} />
            </dl>
        </details>
        
        <details className="group">
            <summary className="list-none">
              <SectionHeader title="Statistici Cheie" step={4} onEdit={goToStep} firstElementId="eleviInscrisi" />
            </summary>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-800">
                {(Object.keys(data.statistici) as Array<keyof typeof statisticiLabels>).map((key) => (
                    <ReviewItem key={key} label={statisticiLabels[key]} value={data.statistici[key]} onEdit={() => goToStep(4, key)} />
                ))}
            </dl>
        </details>

        <details className="group">
            <summary className="list-none">
              <SectionHeader title="Categorii Alese" step={5} onEdit={goToStep} firstElementId="categorii-section" />
            </summary>
            <dl className="divide-y divide-gray-800">
                <ReviewItem label="Categorii" value={getSelectedLabels(CATEGORII_PROIECT, data.categorii)} onEdit={() => goToStep(5, 'categorii-section')} />
            </dl>
        </details>
        
        {Object.keys(data.proiecteNarative).length > 0 && Object.values(data.categorii).some(Boolean) && (
          <details className="group">
            <summary className="list-none">
              <SectionHeader title="Descriere Proiecte" step={6} onEdit={goToStep} firstElementId="proiecte-narative-section" />
            </summary>
            {Object.entries(data.proiecteNarative).map(([key, value]) => {
                if (!value || !data.categorii[key]) return null;
                const categoryKey = key as keyof FormData['proiecteNarative'];
                const categoryLabel = CATEGORII_PROIECT.find(c => c.id === categoryKey)?.label;
                return (
                    <div key={categoryKey} className="mt-4 first:mt-0">
                        <h4 className="font-bold text-green-400 mb-2 border-b border-gray-700 pb-2">{categoryLabel}</h4>
                        <dl className="divide-y divide-gray-800">
                            {Object.entries(value).map(([field, fieldValue]) => {
                                const fieldKey = field as keyof ProiectNarativ;
                                if (fieldKey === 'documenteJustificative') {
                                    const files = fieldValue as UploadedFile[];
                                    if (files.length === 0) return null;
                                    return (
                                        <ReviewItem 
                                            key={fieldKey} 
                                            label="Documente Justificative" 
                                            onEdit={() => goToStep(6, 'proiecte-narative-section')}
                                            value={
                                                <ul className="space-y-1 mt-1">
                                                    {files.map(f => (
                                                      <li key={f.id} className="flex items-center gap-2">
                                                        <DocumentIcon className="w-4 h-4 text-brand-text-light" /> 
                                                        <span>{f.name}</span>
                                                      </li>
                                                    ))}
                                                </ul>
                                            } 
                                        />
                                    );
                                }
                                const label = narativFieldLabels[fieldKey as keyof typeof narativFieldLabels] || field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                    <ReviewItem key={fieldKey} label={label} value={fieldValue as string} onEdit={() => goToStep(6, `${categoryKey}-${fieldKey}`)} />
                                );
                            })}
                        </dl>
                    </div>
                )
            })}
          </details>
        )}

        {(data.linkedinProfile || data.facebookProfile || data.otherProfile) && (
            <div>
                <SectionHeader title="Prezență Online" step={7} onEdit={goToStep} firstElementId="linkedinProfile" />
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-800">
                    <ReviewItem label="Profil LinkedIn" value={data.linkedinProfile} onEdit={() => goToStep(7, 'linkedinProfile')} />
                    <ReviewItem label="Profil Facebook" value={data.facebookProfile} onEdit={() => goToStep(7, 'facebookProfile')} />
                    <ReviewItem label="Alt Profil" value={data.otherProfile} onEdit={() => goToStep(7, 'otherProfile')} />
                </dl>
            </div>
        )}

        {data.recomandari.length > 0 && (
          <details className="group">
            <summary className="list-none">
              <SectionHeader title="Referințe" step={6} onEdit={goToStep} firstElementId="recomandari-section" />
            </summary>
             <div className="space-y-4">
                {data.recomandari.map((rec, index) => (
                  <div key={rec.id} className="pt-3 border-t border-gray-800 first:pt-0 first:border-t-0">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                          <ReviewItem label={`Nume Recomandare ${index + 1}`} value={rec.nume} onEdit={() => goToStep(8, 'recomandari-section')} />
                          <ReviewItem label="Tip Recomandare" value={rec.tip} onEdit={() => goToStep(8, 'recomandari-section')} />
                          <ReviewItem label="Funcție și Instituție" value={rec.functie} onEdit={() => goToStep(8, 'recomandari-section')} />
                          <ReviewItem label="Telefon" value={formatPhone(rec.telefon)} onEdit={() => goToStep(8, 'recomandari-section')} />
                      </dl>
                  </div>
                ))}
             </div>
          </details>
        )}

      </div>

      <div className="mt-8 space-y-4">
        <label className="flex items-start p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer group">
          <input type="checkbox" name="acordRegulament" checked={data.acordRegulament} onChange={handleChange} className="sr-only peer" />
           <span className="w-5 h-5 mt-0.5 rounded border-2 border-brand-text-light flex-shrink-0 flex items-center justify-center transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-green-500 group-hover:scale-110">
              <svg className="w-4 h-4 text-brand-white transition-transform scale-0 peer-checked:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
           </span>
          <span className="ml-4 text-brand-text-light text-sm">
            Sunt de acord cu <a 
              href="https://ave-romania.ro/wp-content/uploads/2024/05/Regulament_Premiile-pentru-Directorii-Anului-2025_f.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-white hover:underline font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-button/50 rounded"
            >
              Regulamentul competiției
            </a>. <span className="text-red-400 font-bold">*</span>
          </span>
        </label>
        <label className="flex items-start p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer group">
          <input type="checkbox" name="acordGDPR" checked={data.acordGDPR} onChange={handleChange} className="sr-only peer" />
           <span className="w-5 h-5 mt-0.5 rounded border-2 border-brand-text-light flex-shrink-0 flex items-center justify-center transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-green-500 group-hover:scale-110">
              <svg className="w-4 h-4 text-brand-white transition-transform scale-0 peer-checked:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
           </span>
          <span className="ml-4 text-brand-text-light text-sm">
            Sunt de acord cu prelucrarea datelor cu caracter personal. <span className="text-red-400 font-bold">*</span>
          </span>
        </label>
        {errors.acordRegulament && <p className="text-red-400 text-sm mt-1 ml-9">{errors.acordRegulament}</p>}
      </div>
    </div>
  );
};

export default Step9_Review;
