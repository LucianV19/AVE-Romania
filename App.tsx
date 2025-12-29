import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import JuratAccessView from './components/JuratAccessView';
import AdminAccessView from './components/AdminAccessView';
import JudgeView from './components/JudgeView';
import LeaderboardView from './components/LeaderboardView';
import AdminView from './components/AdminView';
import DocumentationView from './components/DocumentationView';
import FormularApp from './formular/App';
import JuratFormApp from './formular-jurat/App';
import { View, Candidat, Jurat, Assignment, AuditLog, Stage, Category, Criterion, User, UserRole, Admin, DocumentationContent, Regiune } from './types';
import { CANDIDATI, JURATI, ASSIGNMENTS, AUDIT_LOGS, STAGES, CATEGORIES, CRITERIA, ADMINI, DEFAULT_DOCUMENTATION_CONTENT } from './constants';
import { useNotifications } from './components/contexts/NotificationContext';

const App: React.FC = () => {
  const { notify } = useNotifications();
  // Combined user list for dropdown
  const ALL_USERS: User[] = [...JURATI, ...ADMINI];

  // App states with mock data initialization
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [currentUser, setCurrentUser] = useState<User>(ADMINI[0]);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(false);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<Candidat[]>(CANDIDATI);
  const [judges, setJudges] = useState<Jurat[]>(JURATI);
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AUDIT_LOGS);
  const [stages, setStages] = useState<Stage[]>(STAGES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [criteria, setCriteria] = useState<Criterion[]>(CRITERIA);
  const [docContent, setDocContent] = useState<DocumentationContent>(DEFAULT_DOCUMENTATION_CONTENT);

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log${Date.now()}`,
      timestamp: new Date(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Load initial data from localStorage with fallback to mock data
  useEffect(() => {
    const loadData = function<T>(key: string, defaultValue: T): T {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : defaultValue;
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const savedUserRaw = localStorage.getItem('currentUser');
    if (savedUserRaw) {
      try {
        const u = JSON.parse(savedUserRaw) as User;
        if (u && u.id && u.nume && u.rol) setCurrentUser(u);
      } catch {}
    }
    const savedViewRaw = localStorage.getItem('activeView');
    if (savedViewRaw && Object.values(View).includes(savedViewRaw as View)) {
      setActiveView(savedViewRaw as View);
    }
    
    const savedDevMode = localStorage.getItem('isDevMode');
    if (savedDevMode === 'true') setIsDevMode(true);

    const loadedCandidates = loadData('candidates', CANDIDATI).map(c => {
      // Force update submissionText from constants for demo candidates
      const constantCandidate = CANDIDATI.find(cc => cc.id === c.id);
      if (constantCandidate && constantCandidate.submissionText) {
        // ALWAYS overwrite submissionText from constants to ensure fresh data
        return { 
            ...c, 
            submissionText: constantCandidate.submissionText,
            // Also try to parse it into extendedData immediately if missing
            extendedData: c.extendedData || JSON.parse(constantCandidate.submissionText)
        };
      }
      return c;
    });
    const loadedJudges = loadData('judges', JURATI);
    const loadedAssignments = loadData('assignments', ASSIGNMENTS).map(a => ({
      ...a,
      lastModified: new Date(a.lastModified)
    }));
    const loadedAuditLogs = loadData('auditLogs', AUDIT_LOGS).map(l => ({
      ...l,
      timestamp: new Date(l.timestamp)
    }));
    const loadedStages = loadData('stages', STAGES);
    const loadedCategories = loadData('categories', CATEGORIES);
    const loadedCriteria = loadData('criteria', CRITERIA);
    const loadedDoc = loadData('documentationContent', DEFAULT_DOCUMENTATION_CONTENT);

    setCandidates(loadedCandidates);
    setJudges(loadedJudges);
    setAssignments(loadedAssignments);
    setAuditLogs(loadedAuditLogs);
    setStages(loadedStages);
    setCategories(loadedCategories);
    setCriteria(loadedCriteria);
    setDocContent(loadedDoc);
  }, []);

  useEffect(() => {
    localStorage.setItem('candidates', JSON.stringify(candidates));
    localStorage.setItem('judges', JSON.stringify(judges));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('stages', JSON.stringify(stages));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('criteria', JSON.stringify(criteria));
    localStorage.setItem('documentationContent', JSON.stringify(docContent));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('activeView', activeView);
    localStorage.setItem('isAnonymized', String(isAnonymized));
    localStorage.setItem('isDevMode', String(isDevMode));
  }, [candidates, judges, assignments, auditLogs, stages, categories, criteria, docContent, currentUser, activeView, isAnonymized, isDevMode]);

  useEffect(() => {
    const categoryIdMap: Record<string, string> = {
      inovare: 'cat1',
      egalitate: 'cat2',
      antreprenoriat: 'cat3',
      cat1: 'cat1',
      cat2: 'cat2',
      cat3: 'cat3',
    };

    const toRegiune = (value: unknown): Regiune => {
      if (typeof value === 'string' && (Object.values(Regiune) as string[]).includes(value)) {
        return value as Regiune;
      }
      return Regiune.BUCURESTI_ILFOV;
    };

    const extractCategoryIds = (formData: any): string[] => {
      const raw = formData?.categorii;
      const selected: string[] = [];

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        Object.entries(raw).forEach(([key, value]) => {
          if (value === true) selected.push(categoryIdMap[key] ?? key);
        });
      }

      if (Array.isArray(raw)) {
        raw.forEach((key: unknown) => {
          if (typeof key === 'string') selected.push(categoryIdMap[key] ?? key);
        });
      }

      if (selected.length === 0) {
        const pn = formData?.proiecteNarative;
        if (pn && typeof pn === 'object') {
          (['inovare', 'egalitate', 'antreprenoriat'] as const).forEach(k => {
            const v = pn[k];
            if (v && typeof v === 'object') selected.push(categoryIdMap[k]);
          });
        }
      }

      return Array.from(new Set(selected)).filter(Boolean);
    };

    const checkForNewSubmissions = () => {
      // 1. Check for Candidate Submissions
      const isPending = localStorage.getItem('galaSubmissionPending') === 'true';
      if (isPending) {
        const submittedFormData = localStorage.getItem('galaFormData');
        if (submittedFormData) {
          try {
            const formData = JSON.parse(submittedFormData);

            const categorieIds = extractCategoryIds(formData);
            const regiune = toRegiune(formData?.regiuneUnitate ?? formData?.regiune);
            const numeComplet = [formData?.prenume, formData?.nume].filter(Boolean).join(' ').trim() || 'Candidat din formular';
            const scoala = (formData?.denumireUnitate ?? formData?.scoala ?? '').toString();
            const titlu = categories.find(c => c.id === categorieIds[0])?.nume ?? (formData?.functie ?? '').toString();

            const newCandidate: Candidat = {
              id: `c-${Date.now()}`,
              nume: numeComplet,
              titlu,
              scoala,
              regiune,
              categorieIds: categorieIds.length > 0 ? categorieIds : ['cat1'],
              submissionText: JSON.stringify(formData, null, 2)
            };

            setCandidates(prev => [...prev, newCandidate]);

            addAuditLog({
              adminId: currentUser.id,
              actiune: 'Creare Candidat din Formular',
              detalii: {
                candidatId: newCandidate.id,
                numeCandidat: newCandidate.nume,
                motiv: 'Candidat adăugat din formularul de înscriere'
              }
            });
            
            notify('Candidat Nou', `S-a înscris candidatul ${newCandidate.nume}`, 'success');

            localStorage.removeItem('galaSubmissionPending');
            localStorage.removeItem('galaFormData');
          } catch (error) {
            console.error('Failed to process form submission:', error);
          }
        }
      }

      // 2. Check for Jury Registrations
      const juryRegistrationsRaw = localStorage.getItem('juryRegistrations');
      if (juryRegistrationsRaw) {
        try {
          const registrations = JSON.parse(juryRegistrationsRaw);
          if (Array.isArray(registrations) && registrations.length > 0) {
            let addedCount = 0;
            const newJudges: Jurat[] = [];

            registrations.forEach((reg: any) => {
               // Check if judge already exists by ID (assuming ID is preserved) or Email (if we had email in Jurat type)
               // Since Jurat type only has ID and Nume, and ID is generated in form, we use ID.
               // However, to avoid re-adding if page reloads, we need to know if this registration was processed.
               // We can filter out processed ones or clear the localStorage after processing.
               // But keeping localStorage might be good for backup.
               // Let's check if a judge with this ID exists.
               const exists = judges.some(j => j.id === reg.id);
               if (!exists) {
                 const numeComplet = [reg.prenume, reg.nume].filter(Boolean).join(' ').trim();
                 const newJudge: Jurat = {
                    id: reg.id,
                    nume: numeComplet,
                    rol: UserRole.JUDGE,
                    email: reg.email,
                    telefon: reg.telefon,
                    profesie: reg.profesie,
                    organizatie: reg.organizatie,
                    experienta: reg.experienta,
                    domeniu_expertiza: reg.domeniu_expertiza,
                    ani_experienta: reg.ani_experienta,
                    linkedin_url: reg.linkedin_url,
                    facebook_url: reg.facebook_url,
                    instagram_url: reg.instagram_url,
                    motivatie: reg.motivatie,
                    foto_url: reg.foto_url,
                    password: reg.password
                 };
                 newJudges.push(newJudge);
                 addedCount++;
               }
            });

            if (addedCount > 0) {
                setJudges(prev => [...prev, ...newJudges]);
                addAuditLog({
                    adminId: currentUser.id,
                    actiune: 'Înregistrare Jurat Nou',
                    detalii: {
                        motiv: `S-au înregistrat ${addedCount} jurați noi din formular.`
                    }
                });
                notify('Jurat Nou', `S-au înregistrat ${addedCount} jurați noi`, 'success');
                // Note: We don't clear juryRegistrations to keep a record, 
                // but we rely on ID check to avoid duplicates in state.
                // However, on fresh load, 'judges' state comes from localStorage['judges'] + constants.
                // So if we add to 'judges' state, it gets saved to localStorage['judges'].
                // Next reload, they are in 'judges'.
                // So the check `judges.some(j => j.id === reg.id)` should work fine.
            }
          }
        } catch (e) {
            console.error("Error processing jury registrations", e);
        }
      }
    };

    checkForNewSubmissions();
    const interval = setInterval(checkForNewSubmissions, 5000);
    return () => clearInterval(interval);
  }, [categories, currentUser.id]);

  const handleSetView = (view: View) => {
    // Only switch user role if absolutely necessary
    if (view === View.ADMIN && currentUser.rol !== UserRole.ADMIN) {
        const adminUser = ALL_USERS.find(u => u.rol === UserRole.ADMIN);
        if(adminUser) {
          setCurrentUser(adminUser);
          // Save current user preference to localStorage
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
        }
    } else if (view === View.JUDGE && currentUser.rol !== UserRole.JUDGE) {
        const judgeUser = ALL_USERS.find(u => u.rol === UserRole.JUDGE);
        if(judgeUser) {
          setCurrentUser(judgeUser);
          // Save current user preference to localStorage
          localStorage.setItem('currentUser', JSON.stringify(judgeUser));
        }
    }
    // Save active view preference to localStorage
    localStorage.setItem('activeView', view);
    setActiveView(view);
  }
  
  const renderView = () => {
    const commonProps = {
        candidates,
        judges,
        assignments,
        stages,
        categories,
        criteria,
    }

    switch (activeView) {
      case View.HOME:
        return <HomeView 
                    onNavigate={handleSetView}
                    isDevMode={isDevMode}
                    setIsDevMode={setIsDevMode}
                />;
      case View.JURAT_ACCESS:
        return <JuratAccessView 
                    onNavigate={handleSetView}
                    onGoHome={() => handleSetView(View.HOME)}
                />;
      case View.ADMIN_ACCESS:
        return <AdminAccessView 
                    onNavigate={handleSetView}
                    onGoHome={() => handleSetView(View.HOME)}
                />;
      case View.JUDGE:
        if (currentUser.rol !== UserRole.JUDGE) {
            return <div className="text-center p-10"><p className="text-red-600 dark:text-red-400">Nu aveți permisiuni pentru a accesa această pagină.</p></div>
        }
        return <JudgeView 
                    {...commonProps}
                    currentJudge={currentUser as Jurat} 
                    setAssignments={setAssignments}
                    isAnonymized={isAnonymized}
                />;
      case View.LEADERBOARD:
        return <LeaderboardView 
                    {...commonProps}
                    setCandidates={setCandidates}
                    currentUser={currentUser}
                />;
      case View.ADMIN:
         if (currentUser.rol !== UserRole.ADMIN) {
            return <div className="text-center p-10"><p className="text-red-600 dark:text-red-400">Nu aveți permisiuni pentru a accesa această pagină.</p></div>
        }
        return <AdminView 
                    {...commonProps} 
                    auditLogs={auditLogs}
                    setCandidates={setCandidates}
                    setAssignments={setAssignments}
                    setStages={setStages}
                    setCategories={setCategories}
                    setCriteria={setCriteria}
                    setJudges={setJudges}
                    addAuditLog={addAuditLog}
                    currentUser={currentUser as Admin}
                    isAnonymized={isAnonymized}
                    setIsAnonymized={setIsAnonymized}
                />;
      case View.DOCUMENTATION:
        return <DocumentationView 
            docContent={docContent}
            setDocContent={setDocContent}
            currentUser={currentUser}
        />;
      case View.FORMULAR:
        return <FormularApp />;
      case View.JURAT_FORM:
        return <JuratFormApp />;
      default:
        return <p>Vedere invalidă</p>;
    }
  };

  return (
    <div className="bg-gray-100/50 dark:bg-slate-900 min-h-screen">
      {activeView !== View.HOME && activeView !== View.JURAT_ACCESS && activeView !== View.ADMIN_ACCESS && activeView !== View.FORMULAR && activeView !== View.JURAT_FORM && (
        <Header
          currentView={activeView}
          setView={handleSetView}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          allUsers={ALL_USERS}
          isDevMode={isDevMode}
          setIsDevMode={setIsDevMode}
        />
      )}
      <main className={activeView === View.HOME || activeView === View.JURAT_ACCESS || activeView === View.ADMIN_ACCESS || activeView === View.FORMULAR || activeView === View.JURAT_FORM ? '' : 'container mx-auto p-4 sm:p-6 lg:p-8'}>
        {renderView()}
      </main>
    </div>
  );
};

export default App;
