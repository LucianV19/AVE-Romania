import React, { useState, useRef } from 'react';
import { FormData, FormErrors, ProiectNarativ } from '../../types';
import { CATEGORII_PROIECT } from '../../constants';
import InputField from '../InputField';
import DocumentIcon from '../icons/DocumentIcon';
import TrashIcon from '../icons/TrashIcon';

interface Props {
  data: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (category: keyof FormData['proiecteNarative'], files: FileList | null) => void;
  handleFileRemove: (category: keyof FormData['proiecteNarative'], fileId: string) => void;
  errors: FormErrors;
  userName?: string;
}

const narativFields: { id: keyof Omit<ProiectNarativ, 'documenteJustificative'>, label: string, placeholder: string, maxLength: number }[] = [
    { id: 'modelInterventie', label: 'Model de intervenție', placeholder: 'Descrieți pe larg modelul de intervenție...', maxLength: 5000 },
    { id: 'schimbariProduse', label: 'Schimbări produse', placeholder: 'Ce schimbări concrete a produs proiectul dumneavoastră?', maxLength: 3000 },
    { id: 'strategieComunicare', label: 'Strategie de comunicare', placeholder: 'Cum ați comunicat proiectul în interiorul și exteriorul școlii?', maxLength: 2000 },
    { id: 'riscuriGestionate', label: 'Riscuri gestionate', placeholder: 'Ce riscuri ați întâmpinat și cum le-ați gestionat?', maxLength: 2000 },
    { id: 'indicatoriMasurati', label: 'Indicatori măsurați', placeholder: 'Ce indicatori ați folosit pentru a măsura succesul?', maxLength: 2000 },
    { id: 'continuitate', label: 'Continuitate', placeholder: 'Cum asigurați continuitatea proiectului?', maxLength: 1500 },
    { id: 'invataturi', label: 'Învățături', placeholder: 'Care sunt principalele lecții învățate?', maxLength: 1500 },
    { id: 'relatieAutoritati', label: 'Relația cu autoritățile', placeholder: 'Cum a fost colaborarea cu autoritățile locale/județene?', maxLength: 1500 },
];

const FileUploader: React.FC<{
    category: keyof FormData['proiecteNarative'];
    projectData: ProiectNarativ;
    onFileChange: (category: keyof FormData['proiecteNarative'], files: FileList | null) => void;
    onFileRemove: (category: keyof FormData['proiecteNarative'], fileId: string) => void;
}> = ({ category, projectData, onFileChange, onFileRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileChange(category, files);
        }
    };
    
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(category, e.target.files);
    };

    return (
        <div className="mt-6">
             <label className="block text-brand-text-light font-medium text-sm">Documente justificative</label>
             <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 text-center ${isDragging ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500'}`}
             >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    onChange={handleFileInputChange}
                    className="hidden"
                />
                <p className="text-brand-text-light text-sm">Trageți și plasați fișiere aici, sau faceți clic pentru a selecta.</p>
                <p className="text-xs text-gray-400 mt-1">Puteți încărca mai multe documente.</p>
             </div>
             
             {projectData.documenteJustificative.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-brand-text-light">Fișiere încărcate:</p>
                    <ul className="space-y-3">
                        {projectData.documenteJustificative.map(file => (
                            <li key={file.id} className="bg-white/5 p-2 rounded-md animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <DocumentIcon className="text-brand-text-light flex-shrink-0" />
                                        <span className="text-sm text-brand-white truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => onFileRemove(category, file.id)}
                                        disabled={file.progress !== undefined && file.progress < 100}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Șterge fișierul ${file.name}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                {file.progress !== undefined && file.progress < 100 && (
                                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                                        <div 
                                            className="bg-green-500 h-1.5 rounded-full transition-all duration-150" 
                                            style={{ width: `${file.progress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
             )}
        </div>
    );
};

const Step6_ProiecteNarative: React.FC<Props> = ({ data, handleChange, handleFileChange, handleFileRemove, errors, userName }) => {
    const selectedCategories = Object.entries(data.categorii)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key as keyof FormData['proiecteNarative']);

    if (selectedCategories.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 tabIndex={-1} className="text-3xl font-bold text-brand-white focus:outline-none mb-4">Pasul 6: Descriere Proiecte</h2>
                <p className="text-brand-text-light">Nu ați selectat nicio categorie în pasul anterior. Puteți continua sau vă puteți întoarce pentru a adăuga un proiect.</p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="text-center mb-8">
                <h2 tabIndex={-1} id="proiecte-narative-section" className="text-3xl font-bold text-brand-white focus:outline-none">Pasul 6: Descriere Proiecte</h2>
                {userName && (
                    <p className="text-lg text-brand-text-light mt-2 animate-fade-in">
                        Descrie-ne proiectele tale, {userName}. Aceasta este inima aplicației tale.
                    </p>
                )}
            </div>

            <div className="space-y-12">
                {selectedCategories.map(categoryKey => {
                    const categoryInfo = CATEGORII_PROIECT.find(c => c.id === categoryKey);
                    const projectData = data.proiecteNarative[categoryKey];
                    if (!categoryInfo || !projectData) return null;
                    
                    const formConnection = { data, errors, handleChange };

                    return (
                        <div key={categoryKey} className="bg-white/5 p-4 sm:p-6 rounded-lg border border-gray-700">
                             <h3 className="text-2xl font-bold text-green-400 mb-2">{categoryInfo.label}</h3>
                             <p className="text-sm text-brand-text-light mb-6">{categoryInfo.description}</p>
                             
                             <div className="space-y-6">
                                {narativFields.map(field => (
                                    <InputField
                                        key={field.id}
                                        as="textarea"
                                        id={`${categoryKey}-${field.id}`}
                                        name={`proiecteNarative.${categoryKey}.${field.id}`}
                                        label={field.label}
                                        form={formConnection}
                                        placeholder={field.placeholder}
                                        required
                                        maxLength={field.maxLength}
                                    />
                                ))}
                                <FileUploader 
                                    category={categoryKey}
                                    projectData={projectData}
                                    onFileChange={handleFileChange}
                                    onFileRemove={handleFileRemove}
                                />
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Step6_ProiecteNarative;