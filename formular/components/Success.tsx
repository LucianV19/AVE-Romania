

import React from 'react';
import FacebookIcon from './icons/FacebookIcon';
import LinkedInIcon from './icons/LinkedInIcon';

interface SuccessProps {
  userName?: string;
}

const Success: React.FC<SuccessProps> = ({ userName }) => {
  const shareUrl = encodeURIComponent("https://ave-romania.ro/gala-premiilor-pentru-directorii-anului-2026/");
  const shareText = encodeURIComponent("Tocmai mi-am depus candidatura pentru Gala Premiilor pentru Directorii Anului 2026! #DirectorulAnului2026 #AVERomania");

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;

  const buttonBaseStyle = "flex items-center justify-center gap-3 w-full sm:w-auto text-sm font-bold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg";
  const facebookStyle = "bg-[#1877F2] hover:bg-[#166bda] text-white focus:ring-[#1877F2]";
  const linkedInStyle = "bg-[#0A66C2] hover:bg-[#095ab0] text-white focus:ring-[#0A66C2]";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-bg to-[#16213e] animate-fade-in">
      <div className="bg-brand-bg/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-8 sm:p-12 text-center max-w-lg w-full">
        
        <div className="inline-block border border-brand-text-light/50 p-2 mb-6">
          <p className="text-sm font-bold tracking-wider text-brand-text-light">GALA PREMIILOR</p>
          <p className="text-xs text-brand-text-light/80">PENTRU DIRECTORII ANULUI --- 2026</p>
        </div>

        <div className="mx-auto flex items-center justify-center h-24 w-24 mb-6">
          <svg className="w-full h-full" viewBox="0 0 52 52">
            <circle className="animate-draw-circle text-green-500/30" cx="26" cy="26" r="25" stroke="currentColor" strokeWidth="2" fill="none" />
            <path className="animate-draw-check text-green-400" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-brand-white mb-4">
          {userName ? `Felicitări, ${userName}!` : 'Înscriere Trimisă!'}
        </h2>
        
        <div className="text-brand-text-light text-base space-y-4">
            <p>
                Vă mulțumim{userName && `, ${userName},`} pentru înscrierea la <strong>Gala Premiilor pentru Directorii Anului 2026</strong>! Candidatura dumneavoastră a fost înregistrată cu succes.
            </p>
            <p>
                Veți fi contactat în curând de către echipa noastră pentru următorii pași. Până atunci, vă invităm să aflați mai multe despre misiunea noastră pe{' '}
                <a 
                  href="https://ave-romania.ro" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-white hover:underline font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-button/50 rounded"
                >
                    site-ul oficial AVE România
                </a>.
            </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700/50">
          <p className="text-sm font-semibold text-brand-text-light mb-4">
              Spune-le și altora despre candidatura ta!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className={`${buttonBaseStyle} ${facebookStyle}`}>
                  <FacebookIcon />
                  <span>Partajează pe Facebook</span>
              </a>
              <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className={`${buttonBaseStyle} ${linkedInStyle}`}>
                  <LinkedInIcon />
                  <span>Partajează pe LinkedIn</span>
              </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Success;