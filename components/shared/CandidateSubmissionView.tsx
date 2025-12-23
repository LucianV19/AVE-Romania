import React, { useEffect, useMemo, useState } from 'react';
import { Candidat, Regiune } from '../../types';
import { FormData as DirectorFormData } from '../../formular/types';

interface CandidateSubmissionViewProps {
    candidate: Candidat;
}

const CandidateSubmissionView: React.FC<CandidateSubmissionViewProps> = ({ candidate }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 640px)');
        const apply = () => setIsMobile(mql.matches);
        apply();
        mql.addEventListener('change', apply);
        return () => mql.removeEventListener('change', apply);
    }, []);

    const formData = useMemo<DirectorFormData | null>(() => {
        if (candidate.extendedData) return candidate.extendedData;
        if (candidate.submissionText) {
            try {
                const rawText = candidate.submissionText.trim();
                if (rawText.startsWith('{') || rawText.startsWith('[')) {
                    return JSON.parse(rawText);
                }
            } catch (e) {
                console.error("Failed to parse submissionText", e);
            }
        }
        return null;
    }, [candidate]);

    if (!formData) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                <p>Nu există date structurate pentru acest candidat.</p>
            </div>
        );
    }

    const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
        <details
            className="border-b dark:border-slate-700 py-3 last:border-0"
            open={openSections[id] ?? !isMobile}
            onToggle={(e) => {
                const el = e.currentTarget as HTMLDetailsElement;
                setOpenSections(prev => ({ ...prev, [id]: el.open }));
            }}
        >
            <summary className="cursor-pointer list-none select-none">
                <div className="flex items-center justify-between gap-3 py-2">
                    <h3 className="text-base sm:text-lg font-bold text-ave-dark-blue dark:text-slate-100">{title}</h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                        {(openSections[id] ?? !isMobile) ? 'Ascunde' : 'Arată'}
                    </span>
                </div>
            </summary>
            <div className="pt-3 pb-4">
                {children}
            </div>
        </details>
    );

    const Field = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
        <div className="mb-4">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="block text-base text-gray-900 dark:text-slate-200 mt-1 break-words">{value || '-'}</span>
        </div>
    );

    const LongField = ({ label, value }: { label: string, value: string | undefined | null }) => (
        <div className="mb-5">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">{label}</span>
            <div className="text-base text-gray-900 dark:text-slate-200 whitespace-pre-wrap bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border dark:border-slate-700">
                {value || '-'}
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <Section id="a" title="A. Informații Generale">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Nume" value={formData.nume} />
                    <Field label="Prenume" value={formData.prenume} />
                    <Field label="Email" value={formData.email} />
                    <Field label="Telefon" value={formData.telefon} />
                </div>
            </Section>

            <Section id="b" title="B. Experiență Profesională">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Data început funcție" value={`${formData.functieInceputLuna} ${formData.functieInceputAn}`} />
                    <Field label="Ani activitate în sistem" value={formData.aniActivitateSistem} />
                    <Field label="Ani conducere" value={formData.aniConducereAcumulati} />
                    <Field label="Mod ocupare funcție" value={formData.modOcupareFunctie} />
                    {formData.modOcupareDetalii && <Field label="Detalii mod ocupare" value={formData.modOcupareDetalii} />}
                </div>
            </Section>

            <Section id="c" title="C. Unitate de Învățământ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                    <Field label="Denumire" value={formData.denumireUnitate} />
                    <Field label="Județ" value={formData.judetUnitate} />
                    <Field label="Localitate" value={formData.localitateUnitate} />
                    <Field label="Regiune" value={formData.regiuneUnitate} />
                    <Field label="Website" value={formData.websiteUnitate} />
                    <Field label="Personalitate Juridică" value={formData.arePersonalitateJuridica === 'da' ? 'Da' : 'Nu'} />
                    {formData.unitateParinte && <Field label="Unitate Părinte" value={formData.unitateParinte} />}
                </div>
                <div className="mb-4">
                     <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Niveluri de învățământ</span>
                     <div className="flex flex-wrap gap-2">
                        {Object.entries(formData.niveluriInvatamant || {})
                            .filter(([_, checked]) => checked)
                            .map(([level]) => (
                                <span key={level} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                    {level}
                                </span>
                            ))}
                     </div>
                </div>
                <Field label="Adresă" value={formData.adresaUnitate} />
            </Section>

            <Section id="d" title="D. Statistici (2024-2025)">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Field label="Elevi Înscriși" value={formData.statistici.eleviInscrisi} />
                    <Field label="Elevi Romi" value={formData.statistici.eleviRomi} />
                    <Field label="Elevi CES" value={formData.statistici.eleviCES} />
                    <Field label="Elevi Dezavantajați" value={formData.statistici.eleviDezavantajati} />
                    <Field label="Bursă Socială" value={formData.statistici.eleviBursaSociala} />
                    <Field label="Navetiști" value={formData.statistici.eleviNavetisti} />
                    <Field label="Abandon Școlar" value={formData.statistici.eleviAbandonScolar} />
                </div>
                <div className="mt-4 pt-4 border-t dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Personal Didactic Titular" value={formData.statistici.personalDidacticTitular} />
                    <Field label="Personal Didactic Suplinitor" value={formData.statistici.personalDidacticSuplinitor} />
                    <Field label="Personal Nedidactic" value={formData.statistici.personalNedidactic} />
                </div>
            </Section>

            <Section id="e" title="E. Categorii de Participare">
                 <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.categorii || {})
                        .filter(([_, checked]) => checked)
                        .map(([cat]) => (
                            <span key={cat} className="px-3 py-1 bg-ave-blue text-white rounded-full text-sm">
                                {cat}
                            </span>
                        ))}
                 </div>
            </Section>

            {formData.proiecteNarative && (
                <Section id="f" title="F. Proiecte Narative">
                    {['inovare', 'egalitate', 'antreprenoriat'].map((type) => {
                        const project = formData.proiecteNarative[type as keyof typeof formData.proiecteNarative];
                        if (!project) return null;
                        
                        const titles: Record<string, string> = {
                            inovare: 'Inovare și Digitalizare',
                            egalitate: 'Egalitate de Șanse',
                            antreprenoriat: 'Antreprenoriat'
                        };

                        return (
                            <div key={type} className="mb-6 last:mb-0 border dark:border-slate-600 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 font-bold text-ave-dark-blue dark:text-slate-100">
                                    {titles[type] || type}
                                </div>
                                <div className="p-4 space-y-4">
                                    <LongField label="Model de Intervenție" value={project.modelInterventie} />
                                    <LongField label="Schimbări Produse" value={project.schimbariProduse} />
                                    <LongField label="Strategie Comunicare" value={project.strategieComunicare} />
                                    <LongField label="Riscuri Gestionate" value={project.riscuriGestionate} />
                                    <LongField label="Indicatori Măsurați" value={project.indicatoriMasurati} />
                                    <LongField label="Continuitate" value={project.continuitate} />
                                    <LongField label="Învățături" value={project.invataturi} />
                                    <LongField label="Relație Autorități" value={project.relatieAutoritati} />
                                </div>
                            </div>
                        );
                    })}
                </Section>
            )}

            <Section id="g" title="G. Prezență Online & Recomandări">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Field label="LinkedIn" value={formData.linkedinProfile} />
                    <Field label="Facebook" value={formData.facebookProfile} />
                    <Field label="Alt Profil" value={formData.otherProfile} />
                </div>
                
                <h4 className="font-bold text-sm text-gray-700 dark:text-slate-300 mb-3">Recomandări</h4>
                {formData.recomandari && formData.recomandari.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.recomandari.map((rec, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded border dark:border-slate-700">
                                <p className="font-bold text-sm text-gray-900 dark:text-slate-200">{rec.nume}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{rec.functie}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{rec.telefon}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded text-[10px]">{rec.tip}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Nu există recomandări.</p>
                )}
            </Section>
        </div>
    );
};

export default CandidateSubmissionView;
