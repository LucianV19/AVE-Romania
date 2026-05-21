import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import HomeView from './components/HomeView';
import JuratAccessView from './components/JuratAccessView';
import AdminAccessView from './components/AdminAccessView';
import JudgeView from './components/JudgeView';
import LeaderboardView from './components/LeaderboardView';
import AdminView from './components/AdminView';
import DocumentationView from './components/DocumentationView';
import FormularApp from './formular/App';
import { View, Candidat, Jurat, Assignment, AuditLog, Stage, Category, Criterion, User, UserRole, Admin, DocumentationContent, Regiune } from './types';
import { CANDIDATI, JURATI, ASSIGNMENTS, AUDIT_LOGS, STAGES, CATEGORIES, CRITERIA, ADMINI, DEFAULT_DOCUMENTATION_CONTENT } from './constants';
import { useNotifications } from './components/contexts/NotificationContext';

const App: React.FC = () => {
  const { notify } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  // Combined user list for dropdown
  const VIEWER_USER: User = { id: 'viewer', nume: 'Vizitator', rol: UserRole.VIEWER };
  const ALL_USERS: User[] = [VIEWER_USER, ...JURATI, ...ADMINI];

  // App states with mock data initialization
  const [currentUser, setCurrentUser] = useState<User>(VIEWER_USER);
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
      if (!savedValue) return defaultValue;
      try {
        return JSON.parse(savedValue) as T;
      } catch {
        return defaultValue;
      }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    let loadedUser: User | undefined;
    const savedUserRaw = localStorage.getItem('currentUser');
    if (savedUserRaw) {
      try {
        const u = JSON.parse(savedUserRaw) as User;
        if (u && u.id && u.nume && u.rol) loadedUser = u;
      } catch {}
    }
    if (loadedUser) setCurrentUser(loadedUser);
    
    const savedDevMode = localStorage.getItem('isDevMode');
    if (savedDevMode === 'true') setIsDevMode(true);

    const loadedCandidates = loadData('candidates', CANDIDATI).map(c => {
      // Force update submissionText from constants for demo candidates
      const constantCandidate = CANDIDATI.find(cc => cc.id === c.id);
      if (constantCandidate && constantCandidate.submissionText) {
        let extendedData = c.extendedData;
        if (!extendedData) {
          try {
            extendedData = JSON.parse(constantCandidate.submissionText);
          } catch {}
        }
        // ALWAYS overwrite submissionText from constants to ensure fresh data
        return { 
            ...c, 
            submissionText: constantCandidate.submissionText,
            // Also try to parse it into extendedData immediately if missing
            extendedData
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
    localStorage.setItem('isAnonymized', String(isAnonymized));
    localStorage.setItem('isDevMode', String(isDevMode));
  }, [candidates, judges, assignments, auditLogs, stages, categories, criteria, docContent, currentUser, isAnonymized, isDevMode]);

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
      if (currentUser.rol !== UserRole.ADMIN && !isDevMode) return;
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
                    foto_url: reg.foto_url
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
  }, [categories, currentUser.id, currentUser.rol, isDevMode, judges]);

  const ExternalRedirect: React.FC<{ to: string }> = ({ to }) => {
    useEffect(() => {
      window.location.assign(to);
    }, [to]);
    return <div className="min-h-screen flex items-center justify-center p-6 text-gray-600 dark:text-slate-300">Se redirecționează...</div>;
  };

  const JURAT_FORM_URL =
    import.meta.env.DEV
      ? (import.meta.env.VITE_JURAT_DEV_URL as string | undefined) || 'http://localhost:3002/formular-jurat/'
      : '/formular-jurat/';

  const pathForView = (view: View) => {
    switch (view) {
      case View.HOME:
        return '/';
      case View.FORMULAR:
        return '/director';
      case View.JURAT_ACCESS:
        return '/jurat';
      case View.JURAT_FORM:
        return '/jurat/register';
      case View.ADMIN_ACCESS:
        return '/admin/login';
      case View.JUDGE:
        return '/judge';
      case View.ADMIN:
        return '/admin';
      case View.LEADERBOARD:
        return '/leaderboard';
      case View.DOCUMENTATION:
        return '/docs';
      default:
        return '/';
    }
  };

  const handleSetView = (view: View) => {
    navigate(pathForView(view));
  };

  const handleAuthNavigate = (view: View, user?: User) => {
    if (user) setCurrentUser(user);
    handleSetView(view);
  };

  const currentView: View = (() => {
    const p = location.pathname;
    if (p === '/') return View.HOME;
    if (p.startsWith('/director')) return View.FORMULAR;
    if (p === '/jurat') return View.JURAT_ACCESS;
    if (p.startsWith('/jurat/register')) return View.JURAT_FORM;
    if (p.startsWith('/admin/login')) return View.ADMIN_ACCESS;
    if (p.startsWith('/admin')) return View.ADMIN;
    if (p.startsWith('/judge')) return View.JUDGE;
    if (p.startsWith('/leaderboard')) return View.LEADERBOARD;
    if (p.startsWith('/docs')) return View.DOCUMENTATION;
    return View.HOME;
  })();

  const showHeader = (() => {
    const p = location.pathname;
    if (p === '/') return false;
    if (p === '/jurat') return false;
    if (p.startsWith('/admin/login')) return false;
    if (p.startsWith('/director')) return false;
    if (p.startsWith('/jurat/register')) return false;
    return true;
  })();

  const commonProps = {
    candidates,
    judges,
    assignments,
    stages,
    categories,
    criteria,
  };

  const devJudge: Jurat = (JURATI[0] as Jurat | undefined) ?? {
    id: 'dev-judge',
    nume: 'Jurat (Dev)',
    rol: UserRole.JUDGE,
  };

  const devAdmin: Admin = (ADMINI[0] as Admin | undefined) ?? {
    id: 'dev-admin',
    nume: 'Admin (Dev)',
    rol: UserRole.ADMIN,
  };

  const judgeElement =
    currentUser.rol === UserRole.JUDGE || isDevMode ? (
      <JudgeView
        {...commonProps}
        currentJudge={(currentUser.rol === UserRole.JUDGE ? (currentUser as Jurat) : devJudge)}
        setAssignments={setAssignments}
        isAnonymized={isAnonymized}
        onNavigate={handleSetView}
      />
    ) : (
      <Navigate to="/jurat" replace />
    );

  const adminElement =
    currentUser.rol === UserRole.ADMIN || isDevMode ? (
      <AdminView
        {...commonProps}
        auditLogs={auditLogs}
        setCandidates={setCandidates}
        setAssignments={setAssignments}
        setStages={setStages}
        setCategories={setCategories}
        setCriteria={setCriteria}
        setJudges={setJudges}
        addAuditLog={addAuditLog}
        currentUser={(currentUser.rol === UserRole.ADMIN ? (currentUser as Admin) : devAdmin)}
        isAnonymized={isAnonymized}
        setIsAnonymized={setIsAnonymized}
      />
    ) : (
      <Navigate to="/admin/login" replace />
    );

  return (
    <div className="bg-gray-100/50 dark:bg-slate-900 min-h-screen">
      {showHeader && (
        <Header
          currentView={currentView}
          setView={handleSetView}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          allUsers={ALL_USERS}
          isDevMode={isDevMode}
          setIsDevMode={setIsDevMode}
        />
      )}
      <main className={showHeader ? 'container mx-auto p-4 sm:p-6 lg:p-8' : ''}>
        <Routes>
          <Route
            path="/"
            element={<HomeView onNavigate={handleSetView} isDevMode={isDevMode} setIsDevMode={setIsDevMode} />}
          />
          <Route path="/director" element={<FormularApp onHome={() => navigate('/')} />} />
          <Route path="/jurat" element={<JuratAccessView onNavigate={handleAuthNavigate} onGoHome={() => navigate('/')} />} />
          <Route path="/jurat/register" element={<ExternalRedirect to={JURAT_FORM_URL} />} />
          <Route path="/admin/login" element={<AdminAccessView onNavigate={handleAuthNavigate} onGoHome={() => navigate('/')} />} />
          <Route path="/judge" element={judgeElement} />
          <Route
            path="/leaderboard"
            element={<LeaderboardView {...commonProps} setCandidates={setCandidates} currentUser={currentUser} />}
          />
          <Route path="/admin" element={adminElement} />
          <Route
            path="/docs"
            element={<DocumentationView docContent={docContent} setDocContent={setDocContent} currentUser={currentUser} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
