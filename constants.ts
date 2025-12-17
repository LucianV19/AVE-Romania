import { Jurat, Candidat, Assignment, Status, Regiune, Stage, Category, Criterion, AuditLog, UserRole, Admin, DocumentationContent } from './types';

export const JURATI: Jurat[] = [
  { id: 'j1', nume: 'Elena Popescu', rol: UserRole.JUDGE, stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j2', nume: 'Mihai Ionescu', rol: UserRole.JUDGE, stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j3', nume: 'Andreea Vasilescu', rol: UserRole.JUDGE, stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j4', nume: 'Cristian Stan', rol: UserRole.JUDGE, stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j5', nume: 'Adrian Marinescu', rol: UserRole.JUDGE, email: 'adrian.marinescu@example.com', profesie: 'Manager', organizatie: 'EduCorp', stages: ['etapa1', 'etapa2'] },
  { id: 'j6', nume: 'Bianca Tudor', rol: UserRole.JUDGE, email: 'bianca.tudor@example.com', profesie: 'Consultant', organizatie: 'Business Solutions', stages: ['etapa1', 'etapa3'] },
  { id: 'j7', nume: 'Claudiu Munteanu', rol: UserRole.JUDGE, email: 'claudiu.munteanu@example.com', profesie: 'Profesor Universitar', organizatie: 'Universitatea X', stages: ['etapa2', 'etapa4'] },
  { id: 'j8', nume: 'Diana Grigore', rol: UserRole.JUDGE, email: 'diana.grigore@example.com', profesie: 'HR Director', organizatie: 'Company Y', stages: ['etapa1'] },
  { id: 'j9', nume: 'Eugen Voicu', rol: UserRole.JUDGE, email: 'eugen.voicu@example.com', profesie: 'Antreprenor', organizatie: 'Startup Z', stages: ['etapa2'] },
  { id: 'j10', nume: 'Florina Rusu', rol: UserRole.JUDGE, email: 'florina.rusu@example.com', profesie: 'Psiholog', organizatie: 'Cabinet Individual', stages: ['etapa3'] },
  { id: 'j11', nume: 'Gabriel Dinu', rol: UserRole.JUDGE, email: 'gabriel.dinu@example.com', profesie: 'Director ONG', organizatie: 'Fundatia Speranta', stages: ['etapa4'] },
  { id: 'j12', nume: 'Horia Petrescu', rol: UserRole.JUDGE, email: 'horia.petrescu@example.com', profesie: 'Inspector Scolar', organizatie: 'ISJ', stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j13', nume: 'Ioana Dascalu', rol: UserRole.JUDGE, email: 'ioana.dascalu@example.com', profesie: 'Jurnalist', organizatie: 'Media Group', stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
  { id: 'j14', nume: 'Justina Albu', rol: UserRole.JUDGE, email: 'justina.albu@example.com', profesie: 'Trainer', organizatie: 'Training Center', stages: ['etapa1', 'etapa2', 'etapa3', 'etapa4'] },
];

export const ADMINI: Admin[] = [
    { id: 'a1', nume: 'Admin Principal', rol: UserRole.ADMIN }
]

export const CANDIDATI: Candidat[] = [
  // Categoria Inovare & Antreprenoriat
  { 
    id: 'c1', 
    nume: 'Ana Georgescu', 
    titlu: 'Directorul Anului pentru Inovare', 
    scoala: 'Liceul Teoretic "Ion Creangă"', 
    regiune: Regiune.BUCURESTI_ILFOV, 
    categorieIds: ['cat1', 'cat3'], 
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true, 'etapa4': true }, 
    submissionText: JSON.stringify({
      nume: "Georgescu",
      prenume: "Ana",
      email: "ana.georgescu@ioncreanga.ro",
      telefon: "0722123456",
      functieInceputAn: "2018",
      functieInceputLuna: "Septembrie",
      aniActivitateSistem: "15",
      modOcupareFunctie: "Concurs",
      aniConducereAcumulati: "6",
      denumireUnitate: 'Liceul Teoretic "Ion Creangă"',
      judetUnitate: "București",
      localitateUnitate: "București",
      regiuneUnitate: "București-Ilfov",
      websiteUnitate: "www.ioncreanga.ro",
      adresaUnitate: "Strada Cuza Vodă 51, București",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Liceal": true, "Gimnazial": true },
      statistici: {
        eleviInscrisi: "1200",
        eleviRomi: "10",
        eleviCES: "5",
        eleviDezavantajati: "50",
        eleviBursaSociala: "100",
        eleviNavetisti: "0",
        eleviAbandonScolar: "2",
        personalDidacticTitular: "80",
        personalDidacticSuplinitor: "10",
        personalNedidactic: "15"
      },
      categorii: { "cat1": true, "cat3": true },
      proiecteNarative: {
        inovare: {
          modelInterventie: "Implementarea unui sistem de management digital al clasei bazat pe Google Classroom și tablete pentru fiecare elev. Am creat un hub de resurse digitale accesibil non-stop.",
          schimbariProduse: "Creșterea cu 30% a implicării elevilor la orele de științe. Reducerea timpului administrativ pentru profesori cu 5 ore/săptămână.",
          strategieComunicare: "Newsletter săptămânal către părinți cu progresul digital. Workshop-uri lunare deschise comunității.",
          riscuriGestionate: "Rezistența inițială a corpului profesoral la tehnologie a fost gestionată prin sesiuni de mentorat peer-to-peer.",
          indicatoriMasurati: "Număr de lecții digitale create (500+), rată de utilizare a platformei (95%).",
          continuitate: "Proiectul este acum inclus în bugetul anual al școlii pentru mentenanță și upgrade.",
          invataturi: "Formarea continuă este cheia succesului, nu doar dotarea cu echipamente.",
          relatieAutoritati: "Parteneriat strâns cu Primăria Sectorului 4 pentru finanțare suplimentară."
        },
        antreprenoriat: {
          modelInterventie: "Club de robotică și antreprenoriat 'Future Makers'. Elevii creează produse pe care le vând la târguri caritabile.",
          schimbariProduse: "Elevii au învățat să facă un plan de afaceri și să lucreze în echipă. Au strâns 5000 EUR pentru dotarea laboratorului.",
          strategieComunicare: "Campanii pe social media gestionate de elevi. Parteneriate media locale.",
          riscuriGestionate: "Lipsa mentorilor din business a fost rezolvată prin parteneriate cu companii IT locale.",
          indicatoriMasurati: "Profit generat, număr de produse vândute, competențe dobândite (autoevaluare).",
          continuitate: "Clubul va deveni asociație de elevi cu personalitate juridică.",
          invataturi: "Elevii au nevoie de autonomie reală pentru a inova.",
          relatieAutoritati: "Colaborare cu Inspectoratul Școlar pentru recunoașterea activității ca practică."
        }
      },
      linkedinProfile: "linkedin.com/in/ana-georgescu",
      facebookProfile: "facebook.com/ana.georgescu.edu",
      otherProfile: "",
      recomandari: [
        { nume: "Maria Ionescu", functie: "Inspector General", telefon: "0723000000", tip: "Nesubordonat" },
        { nume: "Dan Popa", functie: "Președinte Asociație Părinți", telefon: "0723111111", tip: "Nesubordonat" },
        { nume: "Elena Radu", functie: "Profesor Merito", telefon: "0723222222", tip: "Subordonat" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },
  { 
    id: 'c3', 
    nume: 'Eva Matei', 
    titlu: 'Directorul Anului pentru Inovare', 
    scoala: 'Colegiul Economic "Octav Onicescu"', 
    regiune: Regiune.NORD_EST, 
    categorieIds: ['cat1'], 
    promotions: { 'etapa1': true, 'etapa2': true }, 
    submissionText: JSON.stringify({
      nume: "Matei",
      prenume: "Eva",
      email: "eva.matei@colegiuleconomic.ro",
      telefon: "0744555666",
      functieInceputAn: "2015",
      functieInceputLuna: "Ianuarie",
      aniActivitateSistem: "20",
      modOcupareFunctie: "Concurs",
      aniConducereAcumulati: "8",
      denumireUnitate: 'Colegiul Economic "Octav Onicescu"',
      judetUnitate: "Botoșani",
      localitateUnitate: "Botoșani",
      regiuneUnitate: "Nord-Est",
      websiteUnitate: "www.ceoo.ro",
      adresaUnitate: "Bulevardul Mihai Eminescu 12, Botoșani",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Liceal": true, "Profesional": true },
      statistici: {
        eleviInscrisi: "800",
        eleviRomi: "5",
        eleviCES: "2",
        eleviDezavantajati: "150",
        eleviBursaSociala: "200",
        eleviNavetisti: "300",
        eleviAbandonScolar: "15",
        personalDidacticTitular: "60",
        personalDidacticSuplinitor: "5",
        personalNedidactic: "10"
      },
      categorii: { "cat1": true },
      proiecteNarative: {
        inovare: {
          modelInterventie: "Digitalizarea completă a secretariatului și a comunicării cu părinții. Implementarea catalogului electronic.",
          schimbariProduse: "Transparență totală în notare. Părinții primesc notificări în timp real. Reducerea birocrației.",
          strategieComunicare: "Ședințe lunare online cu părinții. Grupuri de WhatsApp oficiale pe clase.",
          riscuriGestionate: "Lipsa de competențe digitale a unor părinți - am organizat cursuri de seară pentru ei.",
          indicatoriMasurati: "Număr de accesări ale catalogului, feedback-ul părinților (sondaje).",
          continuitate: "Sistemul este scalabil și poate fi replicat în alte școli din județ.",
          invataturi: "Comunicarea constantă elimină neînțelegerile.",
          relatieAutoritati: "Proiect pilot susținut de ISJ Botoșani."
        }
      },
      linkedinProfile: "",
      facebookProfile: "facebook.com/colegiuleconomic.botosani",
      otherProfile: "",
      recomandari: [
        { nume: "Ioan Sbu", functie: "Primar", telefon: "0744111222", tip: "Nesubordonat" },
        { nume: "Alina M", functie: "Director Adjunct", telefon: "0744333444", tip: "Subordonat" },
        { nume: "Stefan V", functie: "Reprezentant Elevi", telefon: "0744555666", tip: "Fost elev" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },
  { 
    id: 'c5', 
    nume: 'Carmen Stanciu', 
    titlu: 'Directorul Anului pentru Inovare', 
    scoala: 'Școala Gimnazială "Avram Iancu"', 
    regiune: Regiune.NORD_VEST, 
    categorieIds: ['cat1'], 
    promotions: {}, 
    submissionText: JSON.stringify({
      nume: "Stanciu",
      prenume: "Carmen",
      email: "carmen.stanciu@avramiancu.ro",
      telefon: "0755888999",
      functieInceputAn: "2021",
      functieInceputLuna: "Septembrie",
      aniActivitateSistem: "10",
      modOcupareFunctie: "Numire",
      aniConducereAcumulati: "2",
      denumireUnitate: 'Școala Gimnazială "Avram Iancu"',
      judetUnitate: "Cluj",
      localitateUnitate: "Cluj-Napoca",
      regiuneUnitate: "Nord-Vest",
      websiteUnitate: "www.sc-avramiancu.ro",
      adresaUnitate: "Strada Observatorului 1, Cluj-Napoca",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Primar": true, "Gimnazial": true },
      statistici: {
        eleviInscrisi: "950",
        eleviRomi: "0",
        eleviCES: "10",
        eleviDezavantajati: "20",
        eleviBursaSociala: "40",
        eleviNavetisti: "0",
        eleviAbandonScolar: "0",
        personalDidacticTitular: "50",
        personalDidacticSuplinitor: "5",
        personalNedidactic: "8"
      },
      categorii: { "cat1": true },
      proiecteNarative: {
        inovare: {
          modelInterventie: "Clase în aer liber și grădină senzorială. Integrarea educației ecologice în toate materiile.",
          schimbariProduse: "Copiii sunt mai relaxați și mai atenți. A crescut interesul pentru biologie și protecția mediului.",
          strategieComunicare: "Blogul 'Școala Verde'. Ziua Porților Deschise în grădină.",
          riscuriGestionate: "Vremea nefavorabilă - am amenajat un pavilion acoperit.",
          indicatoriMasurati: "Timpul petrecut afară, starea de bine a elevilor.",
          continuitate: "Extinderea grădinii cu o seră hidroponică.",
          invataturi: "Natura este cel mai bun profesor.",
          relatieAutoritati: "Parteneriat cu Grădina Botanică."
        }
      },
      linkedinProfile: "linkedin.com/in/carmen-stanciu",
      facebookProfile: "",
      otherProfile: "instagram.com/scoala_verde",
      recomandari: [
        { nume: "Prof. Dr. X", functie: "Universitar", telefon: "0755111222", tip: "Nesubordonat" },
        { nume: "Inv. Y", functie: "Invățător", telefon: "0755333444", tip: "Subordonat" },
        { nume: "Parinte Z", functie: "Membru CA", telefon: "0755555666", tip: "Nesubordonat" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },

  // Categoria Egalitate de Sanse
  { 
    id: 'c2', 
    nume: 'Bogdan Dumitrescu', 
    titlu: 'Directorul Anului pentru Egalitate de Sanse', 
    scoala: 'Colegiul Național "Andrei Șaguna"', 
    regiune: Regiune.CENTRU, 
    categorieIds: ['cat2'], 
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true, 'etapa4': true }, 
    submissionText: JSON.stringify({
      nume: "Dumitrescu",
      prenume: "Bogdan",
      email: "bogdan.dumitrescu@saguna.ro",
      telefon: "0766123123",
      functieInceputAn: "2010",
      functieInceputLuna: "Octombrie",
      aniActivitateSistem: "25",
      modOcupareFunctie: "Concurs",
      aniConducereAcumulati: "14",
      denumireUnitate: 'Colegiul Național "Andrei Șaguna"',
      judetUnitate: "Brașov",
      localitateUnitate: "Brașov",
      regiuneUnitate: "Centru",
      websiteUnitate: "www.saguna.ro",
      adresaUnitate: "Piața Unirii 1, Brașov",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Gimnazial": true, "Liceal": true },
      statistici: {
        eleviInscrisi: "1100",
        eleviRomi: "2",
        eleviCES: "0",
        eleviDezavantajati: "10",
        eleviBursaSociala: "30",
        eleviNavetisti: "50",
        eleviAbandonScolar: "0",
        personalDidacticTitular: "70",
        personalDidacticSuplinitor: "0",
        personalNedidactic: "12"
      },
      categorii: { "cat2": true },
      proiecteNarative: {
        egalitate: {
          modelInterventie: "Programul 'Șaguniști pentru Șaguniști' - fond de solidaritate pentru elevii cu venituri mici. Meditații gratuite oferite de profesori voluntari.",
          schimbariProduse: "Niciun elev nu a abandonat școala din motive financiare în ultimii 5 ani. Media notelor bursierilor sociali a crescut cu 1.5 puncte.",
          strategieComunicare: "Discreție totală pentru beneficiari. Transparență totală pentru donatori.",
          riscuriGestionate: "Stigmatizarea beneficiarilor - am anonimizat complet procesul de acordare a ajutorului.",
          indicatoriMasurati: "Suma strânsă, număr de beneficiari, rezultatele lor școlare.",
          continuitate: "Fondul este alimentat constant de asociația de alumni.",
          invataturi: "Solidaritatea comunității este o resursă imensă neexploatată.",
          relatieAutoritati: "Nu am solicitat sprijinul autorităților pentru acest proiect privat."
        }
      },
      linkedinProfile: "linkedin.com/in/bogdan-dumitrescu",
      facebookProfile: "",
      otherProfile: "",
      recomandari: [
        { nume: "Acad. Ionel V", functie: "Academician", telefon: "0766000111", tip: "Fost elev" },
        { nume: "Prof. Ana M", functie: "Profesor", telefon: "0766000222", tip: "Subordonat" },
        { nume: "Director Z", functie: "Director Partener", telefon: "0766000333", tip: "Nesubordonat" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },
  { 
    id: 'c4', 
    nume: 'David Antonescu', 
    titlu: 'Directorul Anului pentru Egalitate de Sanse', 
    scoala: 'Liceul Tehnologic "Constantin Brâncuși"', 
    regiune: Regiune.SUD_VEST_OLTENIA, 
    categorieIds: ['cat2'], 
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true }, 
    submissionText: JSON.stringify({
      nume: "Antonescu",
      prenume: "David",
      email: "david.antonescu@brancusi.ro",
      telefon: "0777999888",
      functieInceputAn: "2019",
      functieInceputLuna: "Noiembrie",
      aniActivitateSistem: "12",
      modOcupareFunctie: "Delegare",
      aniConducereAcumulati: "4",
      denumireUnitate: 'Liceul Tehnologic "Constantin Brâncuși"',
      judetUnitate: "Dolj",
      localitateUnitate: "Craiova",
      regiuneUnitate: "Sud-Vest Oltenia",
      websiteUnitate: "www.liceulbrancusi.ro",
      adresaUnitate: "Calea București 200, Craiova",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Liceal": true, "Profesional": true },
      statistici: {
        eleviInscrisi: "600",
        eleviRomi: "50",
        eleviCES: "15",
        eleviDezavantajati: "200",
        eleviBursaSociala: "250",
        eleviNavetisti: "150",
        eleviAbandonScolar: "25",
        personalDidacticTitular: "40",
        personalDidacticSuplinitor: "15",
        personalNedidactic: "8"
      },
      categorii: { "cat2": true },
      proiecteNarative: {
        egalitate: {
          modelInterventie: "Campanie 'O meserie, un viitor'. Parteneriate cu firme locale pentru stagii de practică plătite și angajare la absolvire pentru elevii romi și din medii defavorizate.",
          schimbariProduse: "Rata de angajare a absolvenților a crescut de la 20% la 60%. Abandonul școlar a scăzut cu 10% la clasele profesionale.",
          strategieComunicare: "Întâlniri directe în comunitățile de romi. Povești de succes ale absolvenților promovate local.",
          riscuriGestionate: "Prejudecățile angajatorilor - am organizat sesiuni de mediere și garanții din partea școlii.",
          indicatoriMasurati: "Număr de elevi în practică, număr de elevi angajați.",
          continuitate: "Contracte pe 3 ani cu principalii angajatori.",
          invataturi: "Motivația financiară (salariul) este cel mai bun argument anti-abandon.",
          relatieAutoritati: "Colaborare bună cu AJOFM Dolj."
        }
      },
      linkedinProfile: "",
      facebookProfile: "facebook.com/david.antonescu",
      otherProfile: "",
      recomandari: [
        { nume: "Ing. Popescu", functie: "Manager Fabrica", telefon: "0777111222", tip: "Nesubordonat" },
        { nume: "Lider Comunitate", functie: "Mediator", telefon: "0777333444", tip: "Nesubordonat" },
        { nume: "Prof. Ionescu", functie: "Diriginte", telefon: "0777555666", tip: "Subordonat" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },
  
  // Categoria Antreprenoriat
  { 
    id: 'c6', 
    nume: 'Mihai Popa', 
    titlu: 'Directorul Anului pentru Antreprenoriat', 
    scoala: 'Liceul de Arte "Hariclea Darclée"', 
    regiune: Regiune.SUD_EST, 
    categorieIds: ['cat3'], 
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true, 'etapa4': true }, 
    submissionText: JSON.stringify({
      nume: "Popa",
      prenume: "Mihai",
      email: "mihai.popa@artebraila.ro",
      telefon: "0788123456",
      functieInceputAn: "2016",
      functieInceputLuna: "Februarie",
      aniActivitateSistem: "18",
      modOcupareFunctie: "Concurs",
      aniConducereAcumulati: "7",
      denumireUnitate: 'Liceul de Arte "Hariclea Darclée"',
      judetUnitate: "Brăila",
      localitateUnitate: "Brăila",
      regiuneUnitate: "Sud-Est",
      websiteUnitate: "www.liceuldarclee.ro",
      adresaUnitate: "Piața Traian 1, Brăila",
      arePersonalitateJuridica: "da",
      niveluriInvatamant: { "Gimnazial": true, "Liceal": true },
      statistici: {
        eleviInscrisi: "500",
        eleviRomi: "5",
        eleviCES: "0",
        eleviDezavantajati: "30",
        eleviBursaSociala: "50",
        eleviNavetisti: "10",
        eleviAbandonScolar: "1",
        personalDidacticTitular: "60",
        personalDidacticSuplinitor: "10",
        personalNedidactic: "10"
      },
      categorii: { "cat3": true },
      proiecteNarative: {
        antreprenoriat: {
          modelInterventie: "Galeria de Artă și Magazinul Online al Elevilor. Elevii își expun și vând lucrările (pictură, grafică, ceramică) legal, prin asociația școlii.",
          schimbariProduse: "Elevii învață valoarea muncii lor, marketing, pricing și fiscalitate. Școala obține fonduri pentru materiale.",
          strategieComunicare: "Vernisaje lunare cu invitați din mediul de afaceri. Instagram shop.",
          riscuriGestionate: "Aspecte legale privind vânzarea de către minori - am lucrat cu juriști pro-bono pentru cadrul legal.",
          indicatoriMasurati: "Vânzări totale, număr de lucrări expuse, vizitatori la galerie.",
          continuitate: "Platforma online rulează autonom.",
          invataturi: "Artistul trebuie să fie și antreprenor în secolul 21.",
          relatieAutoritati: "Primăria ne-a oferit spațiul pentru galerie gratuit."
        }
      },
      linkedinProfile: "linkedin.com/in/mihai-popa-art",
      facebookProfile: "facebook.com/artebraila",
      otherProfile: "etsy.com/shop/darcleeart",
      recomandari: [
        { nume: "Critic de Artă", functie: "Curator", telefon: "0788111222", tip: "Nesubordonat" },
        { nume: "Om de Afaceri", functie: "Sponsor", telefon: "0788333444", tip: "Nesubordonat" },
        { nume: "Prof. Ateliere", functie: "Șef Catedră", telefon: "0788555666", tip: "Subordonat" }
      ],
      acordGDPR: true,
      acordRegulament: true
    })
  },
  {
    id: 'c7',
    nume: 'Ion Popa',
    titlu: 'Directorul Anului pentru Inovare',
    scoala: 'Liceul Teoretic "Traian"',
    regiune: Regiune.BUCURESTI_ILFOV,
    categorieIds: ['cat1'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Popa", prenume: "Ion", categorii: { "cat1": true }, acordGDPR: true })
  },
  {
    id: 'c8',
    nume: 'Maria Ionescu',
    titlu: 'Directorul Anului pentru Egalitate de Sanse',
    scoala: 'Colegiul National "Unirea"',
    regiune: Regiune.SUD_EST,
    categorieIds: ['cat2'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Ionescu", prenume: "Maria", categorii: { "cat2": true }, acordGDPR: true })
  },
  {
    id: 'c9',
    nume: 'Vasile Radu',
    titlu: 'Directorul Anului pentru Antreprenoriat',
    scoala: 'Liceul Tehnologic "Auto"',
    regiune: Regiune.SUD_VEST_OLTENIA,
    categorieIds: ['cat3'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Radu", prenume: "Vasile", categorii: { "cat3": true }, acordGDPR: true })
  },
  {
    id: 'c10',
    nume: 'Elena Dumitru',
    titlu: 'Directorul Anului pentru Inovare',
    scoala: 'Scoala Gimnaziala nr 1',
    regiune: Regiune.NORD_EST,
    categorieIds: ['cat1'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Dumitru", prenume: "Elena", categorii: { "cat1": true }, acordGDPR: true })
  },
  {
    id: 'c11',
    nume: 'George Stoica',
    titlu: 'Directorul Anului pentru Egalitate de Sanse',
    scoala: 'Liceul de Arta',
    regiune: Regiune.CENTRU,
    categorieIds: ['cat2'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Stoica", prenume: "George", categorii: { "cat2": true }, acordGDPR: true })
  },
  {
    id: 'c12',
    nume: 'Daniela Florea',
    titlu: 'Directorul Anului pentru Antreprenoriat',
    scoala: 'Colegiul National "Horea"',
    regiune: Regiune.CENTRU,
    categorieIds: ['cat3'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Florea", prenume: "Daniela", categorii: { "cat3": true }, acordGDPR: true })
  },
  {
    id: 'c13',
    nume: 'Stefan Voinea',
    titlu: 'Directorul Anului pentru Inovare',
    scoala: 'Liceul Teoretic "Ovidius"',
    regiune: Regiune.SUD_EST,
    categorieIds: ['cat1'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Voinea", prenume: "Stefan", categorii: { "cat1": true }, acordGDPR: true })
  },
  {
    id: 'c14',
    nume: 'Roxana Nistor',
    titlu: 'Directorul Anului pentru Egalitate de Sanse',
    scoala: 'Scoala Gimnaziala "Dacia"',
    regiune: Regiune.NORD_VEST,
    categorieIds: ['cat2'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Nistor", prenume: "Roxana", categorii: { "cat2": true }, acordGDPR: true })
  },
  {
    id: 'c15',
    nume: 'Alexandru Manea',
    titlu: 'Directorul Anului pentru Antreprenoriat',
    scoala: 'Colegiul National "Banatul"',
    regiune: Regiune.VEST,
    categorieIds: ['cat3'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Manea", prenume: "Alexandru", categorii: { "cat3": true }, acordGDPR: true })
  },
  {
    id: 'c16',
    nume: 'Cristina Lazar',
    titlu: 'Directorul Anului pentru Inovare',
    scoala: 'Liceul Teoretic "Mihai Eminescu"',
    regiune: Regiune.SUD_MUNTENIA,
    categorieIds: ['cat1'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Lazar", prenume: "Cristina", categorii: { "cat1": true }, acordGDPR: true })
  },
  {
    id: 'c17',
    nume: 'Marian Diaconu',
    titlu: 'Directorul Anului pentru Egalitate de Sanse',
    scoala: 'Seminarul Teologic',
    regiune: Regiune.NORD_EST,
    categorieIds: ['cat2'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Diaconu", prenume: "Marian", categorii: { "cat2": true }, acordGDPR: true })
  },
  {
    id: 'c18',
    nume: 'Simona Barbu',
    titlu: 'Directorul Anului pentru Antreprenoriat',
    scoala: 'Liceul "Carol I"',
    regiune: Regiune.SUD_MUNTENIA,
    categorieIds: ['cat3'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Barbu", prenume: "Simona", categorii: { "cat3": true }, acordGDPR: true })
  },
  {
    id: 'c19',
    nume: 'Paul Enache',
    titlu: 'Directorul Anului pentru Inovare',
    scoala: 'Scoala Gimnaziala "Avram Iancu"',
    regiune: Regiune.NORD_VEST,
    categorieIds: ['cat1'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Enache", prenume: "Paul", categorii: { "cat1": true }, acordGDPR: true })
  },
  {
    id: 'c20',
    nume: 'Raluca Preda',
    titlu: 'Directorul Anului pentru Egalitate de Sanse',
    scoala: 'Colegiul National "Spiru Haret"',
    regiune: Regiune.SUD_VEST_OLTENIA,
    categorieIds: ['cat2'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Preda", prenume: "Raluca", categorii: { "cat2": true }, acordGDPR: true })
  },
  {
    id: 'c21',
    nume: 'Victor Cojocaru',
    titlu: 'Directorul Anului pentru Antreprenoriat',
    scoala: 'Liceul Teoretic "Nicolae Iorga"',
    regiune: Regiune.NORD_EST,
    categorieIds: ['cat3'],
    promotions: { 'etapa1': true, 'etapa2': true, 'etapa3': true },
    submissionText: JSON.stringify({ nume: "Cojocaru", prenume: "Victor", categorii: { "cat3": true }, acordGDPR: true })
  },
];


export const CATEGORIES: Category[] = [
  { id: 'cat1', nume: 'Directorul Anului pentru Inovare' },
  { id: 'cat2', nume: 'Directorul Anului pentru Egalitate de Sanse' },
  { id: 'cat3', nume: 'Directorul Anului pentru Antreprenoriat' },
];

export const STAGES: Stage[] = [
  { id: 'etapa1', nume: 'Etapa 1 - Validarea înscrierilor', activ: true, isCurrent: true },
  { id: 'etapa2', nume: 'Etapa 2 - Etapa Preliminară', activ: true },
  { id: 'etapa3', nume: 'Etapa 3 - Jurizarea Regională', activ: true },
  { id: 'etapa4', nume: 'Etapa 4 - Jurizarea Națională', activ: true },
  { id: 'etapa5', nume: 'Etapa 5 - Finala', activ: true },
  { id: 'etapa_finala', nume: 'Clasament Final', activ: true },
];

export const CRITERIA: Criterion[] = [
  // Criterii pentru Etapa Regionala - Structura: 4 variante (1-13, 1-8, 1-5, 1-3)
  { id: 'crit1_reg', etapaId: 'etapa3', categorieId: 'cat1', nume: 'Viziune Strategică Regională', descriere: 'Evaluează capacitatea directorului de a dezvolta și implementa o viziune strategică adaptată contextului regional.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_reg', etapaId: 'etapa3', categorieId: 'cat1', nume: 'Impact Comunitar Local', descriere: 'Măsoară impactul inițiativelor directorului asupra comunității locale.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_reg', etapaId: 'etapa3', categorieId: 'cat1', nume: 'Inovare în Management', descriere: 'Gradul de inovare în practicile de management.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_reg', etapaId: 'etapa3', categorieId: 'cat1', nume: 'Sustenabilitate Resurse', descriere: 'Eficiența utilizării resurselor.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_reg_cat2', etapaId: 'etapa3', categorieId: 'cat2', nume: 'Incluziune și Diversitate', descriere: 'Strategii pentru promovarea incluziunii.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_reg_cat2', etapaId: 'etapa3', categorieId: 'cat2', nume: 'Sprijin Grupuri Vulnerabile', descriere: 'Programe dedicate elevilor din medii dezavantajate.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_reg_cat2', etapaId: 'etapa3', categorieId: 'cat2', nume: 'Parteneriate Sociale', descriere: 'Colaborări cu ONG-uri și instituții sociale.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_reg_cat2', etapaId: 'etapa3', categorieId: 'cat2', nume: 'Impact Măsurabil', descriere: 'Rezultate concrete în reducerea abandonului școlar.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_reg_cat3', etapaId: 'etapa3', categorieId: 'cat3', nume: 'Educație Antreprenorială', descriere: 'Integrarea conceptelor de antreprenoriat în curriculum.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_reg_cat3', etapaId: 'etapa3', categorieId: 'cat3', nume: 'Proiecte Elevi', descriere: 'Susținerea inițiativelor de afaceri ale elevilor.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_reg_cat3', etapaId: 'etapa3', categorieId: 'cat3', nume: 'Parteneriate Business', descriere: 'Relația cu mediul de afaceri local.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_reg_cat3', etapaId: 'etapa3', categorieId: 'cat3', nume: 'Sustenabilitate Financiară', descriere: 'Atragerea de fonduri extrabugetare.', scorMin: 1, scorMax: 3 },
  
  // Criterii pentru Etapa Nationala - Structura identica cu Etapa Regionala (1-13, 1-8, 1-5, 1-3)
  { id: 'crit1_nat', etapaId: 'etapa4', categorieId: 'cat1', nume: 'Inovație Strategică Națională', descriere: 'Potențialul de scalare și replicare a inovațiilor la nivel național.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_nat', etapaId: 'etapa4', categorieId: 'cat1', nume: 'Sustenabilitate și Durabilitate', descriere: 'Durabilitatea proiectelor pe termen lung.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_nat', etapaId: 'etapa4', categorieId: 'cat1', nume: 'Originalitate și Unicitate', descriere: 'Gradul de noutate al soluțiilor propuse.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_nat', etapaId: 'etapa4', categorieId: 'cat1', nume: 'Eficiență Operațională', descriere: 'Raportul cost-beneficiu al inițiativelor.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_nat_cat2', etapaId: 'etapa4', categorieId: 'cat2', nume: 'Leadership Educațional Național', descriere: 'Impactul leadershipului asupra sistemului educațional național.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_nat_cat2', etapaId: 'etapa4', categorieId: 'cat2', nume: 'Politici Incluzive', descriere: 'Contribuția la politici educaționale incluzive.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_nat_cat2', etapaId: 'etapa4', categorieId: 'cat2', nume: 'Parteneriate Strategice', descriere: 'Colaborări cu instituții naționale.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_nat_cat2', etapaId: 'etapa4', categorieId: 'cat2', nume: 'Impact Sistemic', descriere: 'Schimbări produse la nivel de sistem.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_nat_cat3', etapaId: 'etapa4', categorieId: 'cat3', nume: 'Scalabilitate Model', descriere: 'Potențialul de extindere a modelului antreprenorial.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_nat_cat3', etapaId: 'etapa4', categorieId: 'cat3', nume: 'Impact Economic Național', descriere: 'Valoarea economică generată la scară largă.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_nat_cat3', etapaId: 'etapa4', categorieId: 'cat3', nume: 'Inovație în Business', descriere: 'Abordări inovatoare în generarea de venituri.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_nat_cat3', etapaId: 'etapa4', categorieId: 'cat3', nume: 'Reziliență Financiară', descriere: 'Capacitatea de adaptare la schimbări economice.', scorMin: 1, scorMax: 3 },

  // Criterii pentru Etapa Finala - Structura identica cu Etapa Regionala (1-13, 1-8, 1-5, 1-3)
  { id: 'crit1_fin_cat1', etapaId: 'etapa5', categorieId: 'cat1', nume: 'Prezentare Finală și Carismă', descriere: 'Calitatea prezentării în fața juriului final.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_fin_cat1', etapaId: 'etapa5', categorieId: 'cat1', nume: 'Viziune și Impact Strategic Global', descriere: 'Claritatea viziunii pe termen lung.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_fin_cat1', etapaId: 'etapa5', categorieId: 'cat1', nume: 'Răspunsuri la Întrebări', descriere: 'Capacitatea de a argumenta și răspunde spontan.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_fin_cat1', etapaId: 'etapa5', categorieId: 'cat1', nume: 'Prezență Scenică', descriere: 'Impresia generală și atitudinea.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_fin_cat2', etapaId: 'etapa5', categorieId: 'cat2', nume: 'Prezentare Finală și Carismă', descriere: 'Calitatea prezentării în fața juriului final.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_fin_cat2', etapaId: 'etapa5', categorieId: 'cat2', nume: 'Viziune și Impact Strategic Global', descriere: 'Claritatea viziunii pe termen lung.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_fin_cat2', etapaId: 'etapa5', categorieId: 'cat2', nume: 'Răspunsuri la Întrebări', descriere: 'Capacitatea de a argumenta și răspunde spontan.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_fin_cat2', etapaId: 'etapa5', categorieId: 'cat2', nume: 'Prezență Scenică', descriere: 'Impresia generală și atitudinea.', scorMin: 1, scorMax: 3 },

  { id: 'crit1_fin_cat3', etapaId: 'etapa5', categorieId: 'cat3', nume: 'Prezentare Finală și Carismă', descriere: 'Calitatea prezentării în fața juriului final.', scorMin: 1, scorMax: 13 },
  { id: 'crit2_fin_cat3', etapaId: 'etapa5', categorieId: 'cat3', nume: 'Viziune și Impact Strategic Global', descriere: 'Claritatea viziunii pe termen lung.', scorMin: 1, scorMax: 8 },
  { id: 'crit3_fin_cat3', etapaId: 'etapa5', categorieId: 'cat3', nume: 'Răspunsuri la Întrebări', descriere: 'Capacitatea de a argumenta și răspunde spontan.', scorMin: 1, scorMax: 5 },
  { id: 'crit4_fin_cat3', etapaId: 'etapa5', categorieId: 'cat3', nume: 'Prezență Scenică', descriere: 'Impresia generală și atitudinea.', scorMin: 1, scorMax: 3 },
];

export const ASSIGNMENTS: Assignment[] = [
  // ETAPA 3 - Regionala (Scor Final = Suma notelor)
  // Categoria 1
  { id: 'a1', candidatId: 'c1', juratId: 'j1', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 11, 'crit2_reg': 7, 'crit3_reg': 4, 'crit4_reg': 3 }, scorFinal: 25, observatii: {'crit1_reg': 'Foarte bine!'}, lastModified: new Date() },
  { id: 'a2', candidatId: 'c1', juratId: 'j2', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 10, 'crit2_reg': 6, 'crit3_reg': 4, 'crit4_reg': 2 }, scorFinal: 22, observatii: {}, lastModified: new Date() },
  { id: 'a3', candidatId: 'c2', juratId: 'j1', etapaId: 'etapa3', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat2': 12, 'crit2_reg_cat2': 7, 'crit3_reg_cat2': 5, 'crit4_reg_cat2': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a4', candidatId: 'c2', juratId: 'j3', etapaId: 'etapa3', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat2': 11, 'crit2_reg_cat2': 7, 'crit3_reg_cat2': 4, 'crit4_reg_cat2': 3 }, scorFinal: 25, observatii: {}, lastModified: new Date() },
  { id: 'a5', candidatId: 'c3', juratId: 'j2', etapaId: 'etapa3', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a6', candidatId: 'c3', juratId: 'j4', etapaId: 'etapa3', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a7', candidatId: 'c4', juratId: 'j3', etapaId: 'etapa3', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat2': 11, 'crit2_reg_cat2': 7, 'crit3_reg_cat2': 4, 'crit4_reg_cat2': 2 }, scorFinal: 24, observatii: {}, lastModified: new Date() },
  { id: 'a8', candidatId: 'c6', juratId: 'j4', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 12, 'crit2_reg_cat3': 7, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  
  // ETAPA 4 - Nationala
  // Categoria Inovare - Ana Georgescu (câștigător)
  { id: 'a9', candidatId: 'c1', juratId: 'j1', etapaId: 'etapa4', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_nat': 12, 'crit2_nat': 7, 'crit3_nat': 5, 'crit4_nat': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a10', candidatId: 'c1', juratId: 'j2', etapaId: 'etapa4', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_nat': 11, 'crit2_nat': 8, 'crit3_nat': 4, 'crit4_nat': 2 }, scorFinal: 25, observatii: {}, lastModified: new Date() },
  
  // Categoria Egalitate de Sanse - Bogdan Dumitrescu (câștigător) vs David Antonescu (locul 2)
  { id: 'a11', candidatId: 'c2', juratId: 'j3', etapaId: 'etapa4', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat2': 13, 'crit2_nat_cat2': 8, 'crit3_nat_cat2': 5, 'crit4_nat_cat2': 3 }, scorFinal: 29, observatii: {}, lastModified: new Date() },
  { id: 'a12', candidatId: 'c2', juratId: 'j4', etapaId: 'etapa4', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat2': 12, 'crit2_nat_cat2': 7, 'crit3_nat_cat2': 5, 'crit4_nat_cat2': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a13', candidatId: 'c4', juratId: 'j1', etapaId: 'etapa4', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat2': 11, 'crit2_nat_cat2': 7, 'crit3_nat_cat2': 4, 'crit4_nat_cat2': 2 }, scorFinal: 24, observatii: {}, lastModified: new Date() },
  { id: 'a14', candidatId: 'c4', juratId: 'j2', etapaId: 'etapa4', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat2': 10, 'crit2_nat_cat2': 6, 'crit3_nat_cat2': 4, 'crit4_nat_cat2': 2 }, scorFinal: 22, observatii: {}, lastModified: new Date() },
  
  // Categoria Antreprenoriat - Mihai Popa (câștigător)
  { id: 'a15', candidatId: 'c6', juratId: 'j3', etapaId: 'etapa4', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat3': 12, 'crit2_nat_cat3': 7, 'crit3_nat_cat3': 5, 'crit4_nat_cat3': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a16', candidatId: 'c6', juratId: 'j4', etapaId: 'etapa4', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_nat_cat3': 11, 'crit2_nat_cat3': 8, 'crit3_nat_cat3': 4, 'crit4_nat_cat3': 2 }, scorFinal: 25, observatii: {}, lastModified: new Date() },
  
  // ETAPA 5 - Finala
  { id: 'a17', candidatId: 'c1', juratId: 'j1', etapaId: 'etapa5', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a18', candidatId: 'c1', juratId: 'j2', etapaId: 'etapa5', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a19', candidatId: 'c2', juratId: 'j3', etapaId: 'etapa5', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a20', candidatId: 'c2', juratId: 'j4', etapaId: 'etapa5', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a21', candidatId: 'c6', juratId: 'j1', etapaId: 'etapa5', categorieId: 'cat3', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a22', candidatId: 'c6', juratId: 'j4', etapaId: 'etapa5', categorieId: 'cat3', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  
  // Assignments for new candidates and judges (Etapa 3 - Regionala)
  // c7 (cat1) -> j5, j6
  { id: 'a23', candidatId: 'c7', juratId: 'j5', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 12, 'crit2_reg': 7, 'crit3_reg': 5, 'crit4_reg': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a24', candidatId: 'c7', juratId: 'j6', etapaId: 'etapa3', categorieId: 'cat1', status: Status.IN_CURS, scoruri: { 'crit1_reg': 11 }, observatii: {}, lastModified: new Date() },
  
  // c8 (cat2) -> j7, j8
  { id: 'a25', candidatId: 'c8', juratId: 'j7', etapaId: 'etapa3', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat2': 12, 'crit2_reg_cat2': 7, 'crit3_reg_cat2': 5, 'crit4_reg_cat2': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a26', candidatId: 'c8', juratId: 'j8', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c9 (cat3) -> j9, j10
  { id: 'a27', candidatId: 'c9', juratId: 'j9', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 11, 'crit2_reg_cat3': 6, 'crit3_reg_cat3': 4, 'crit4_reg_cat3': 2 }, scorFinal: 23, observatii: {}, lastModified: new Date() },
  { id: 'a28', candidatId: 'c9', juratId: 'j10', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 11, 'crit2_reg_cat3': 7, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 2 }, scorFinal: 25, observatii: {}, lastModified: new Date() },

  // c10 (cat1) -> j11, j12
  { id: 'a29', candidatId: 'c10', juratId: 'j11', etapaId: 'etapa3', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a30', candidatId: 'c10', juratId: 'j12', etapaId: 'etapa3', categorieId: 'cat1', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c11 (cat2) -> j13, j14
  { id: 'a31', candidatId: 'c11', juratId: 'j13', etapaId: 'etapa3', categorieId: 'cat2', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat2': 12, 'crit2_reg_cat2': 8, 'crit3_reg_cat2': 5, 'crit4_reg_cat2': 3 }, scorFinal: 28, observatii: {}, lastModified: new Date() },
  { id: 'a32', candidatId: 'c11', juratId: 'j14', etapaId: 'etapa3', categorieId: 'cat2', status: Status.IN_CURS, scoruri: { 'crit1_reg_cat2': 11 }, observatii: {}, lastModified: new Date() },

  // c12 (cat3) -> j5, j7
  { id: 'a33', candidatId: 'c12', juratId: 'j5', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 10, 'crit2_reg_cat3': 6, 'crit3_reg_cat3': 4, 'crit4_reg_cat3': 2 }, scorFinal: 22, observatii: {}, lastModified: new Date() },
  { id: 'a34', candidatId: 'c12', juratId: 'j7', etapaId: 'etapa3', categorieId: 'cat3', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c13 (cat1) -> j6, j8
  { id: 'a35', candidatId: 'c13', juratId: 'j6', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 11, 'crit2_reg': 7, 'crit3_reg': 4, 'crit4_reg': 3 }, scorFinal: 25, observatii: {}, lastModified: new Date() },
  { id: 'a36', candidatId: 'c13', juratId: 'j8', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 11, 'crit2_reg': 7, 'crit3_reg': 5, 'crit4_reg': 2 }, scorFinal: 25, observatii: {}, lastModified: new Date() },

  // c14 (cat2) -> j9, j11
  { id: 'a37', candidatId: 'c14', juratId: 'j9', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a38', candidatId: 'c14', juratId: 'j11', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c15 (cat3) -> j10, j12
  { id: 'a39', candidatId: 'c15', juratId: 'j10', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 12, 'crit2_reg_cat3': 7, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a40', candidatId: 'c15', juratId: 'j12', etapaId: 'etapa3', categorieId: 'cat3', status: Status.IN_CURS, scoruri: { 'crit1_reg_cat3': 11 }, observatii: {}, lastModified: new Date() },

  // c16 (cat1) -> j13, j5
  { id: 'a41', candidatId: 'c16', juratId: 'j13', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 10, 'crit2_reg': 6, 'crit3_reg': 4, 'crit4_reg': 2 }, scorFinal: 22, observatii: {}, lastModified: new Date() },
  { id: 'a42', candidatId: 'c16', juratId: 'j5', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 11, 'crit2_reg': 7, 'crit3_reg': 5, 'crit4_reg': 2 }, scorFinal: 25, observatii: {}, lastModified: new Date() },

  // c17 (cat2) -> j6, j14
  { id: 'a43', candidatId: 'c17', juratId: 'j6', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a44', candidatId: 'c17', juratId: 'j14', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c18 (cat3) -> j7, j9
  { id: 'a45', candidatId: 'c18', juratId: 'j7', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 11, 'crit2_reg_cat3': 7, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 3 }, scorFinal: 26, observatii: {}, lastModified: new Date() },
  { id: 'a46', candidatId: 'c18', juratId: 'j9', etapaId: 'etapa3', categorieId: 'cat3', status: Status.IN_CURS, scoruri: { 'crit1_reg_cat3': 11 }, observatii: {}, lastModified: new Date() },

  // c19 (cat1) -> j8, j10
  { id: 'a47', candidatId: 'c19', juratId: 'j8', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 12, 'crit2_reg': 7, 'crit3_reg': 5, 'crit4_reg': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
  { id: 'a48', candidatId: 'c19', juratId: 'j10', etapaId: 'etapa3', categorieId: 'cat1', status: Status.FINALIZAT, scoruri: { 'crit1_reg': 11, 'crit2_reg': 7, 'crit3_reg': 5, 'crit4_reg': 3 }, scorFinal: 26, observatii: {}, lastModified: new Date() },

  // c20 (cat2) -> j11, j13
  { id: 'a49', candidatId: 'c20', juratId: 'j11', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },
  { id: 'a50', candidatId: 'c20', juratId: 'j13', etapaId: 'etapa3', categorieId: 'cat2', status: Status.NEINCEPUT, scoruri: {}, observatii: {}, lastModified: new Date() },

  // c21 (cat3) -> j12, j14
  { id: 'a51', candidatId: 'c21', juratId: 'j12', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 12, 'crit2_reg_cat3': 8, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 3 }, scorFinal: 28, observatii: {}, lastModified: new Date() },
  { id: 'a52', candidatId: 'c21', juratId: 'j14', etapaId: 'etapa3', categorieId: 'cat3', status: Status.FINALIZAT, scoruri: { 'crit1_reg_cat3': 12, 'crit2_reg_cat3': 7, 'crit3_reg_cat3': 5, 'crit4_reg_cat3': 3 }, scorFinal: 27, observatii: {}, lastModified: new Date() },
];


export const AUDIT_LOGS: AuditLog[] = [
    {
        id: 'log1',
        timestamp: new Date('2025-10-15T10:00:00'),
        adminId: 'a1',
        actiune: 'Modificare Scor',
        detalii: {
            candidatId: 'c1',
            juratId: 'j1',
            criteriuId: 'crit1_reg',
            scorVechi: 80,
            scorNou: 85,
            motiv: 'Corecție eroare de transcriere.'
        }
    },
    {
        id: 'log2',
        timestamp: new Date('2025-10-16T14:30:00'),
        adminId: 'a1',
        actiune: 'Modificare Status',
        detalii: {
            candidatId: 'c2',
            etapaId: 'etapa3',
            statusVechi: Status.IN_CURS,
            statusNou: Status.FINALIZAT,
            motiv: 'Finalizare evaluare regională cu scor excepțional.'
        }
    },
    {
        id: 'log3',
        timestamp: new Date('2025-10-16T15:45:00'),
        adminId: 'a1',
        actiune: 'Modificare Etapă',
        detalii: {
            etapaId: 'etapa4',
            modificare: 'activare',
            valoareVeche: false,
            valoareNoua: true,
            motiv: 'Activare etapă națională conform calendar.',
            numarModificari: 1
        }
    },
    {
        id: 'log4',
        timestamp: new Date('2025-10-17T09:15:00'),
        adminId: 'a1',
        actiune: 'Modificare Etapă',
        detalii: {
            etapaId: 'etapa3',
            modificare: 'dezactivare',
            valoareVeche: true,
            valoareNoua: false,
            motiv: 'Închidere etapă regională conform calendar.',
            numarModificari: 1
        }
    },
    {
        id: 'log5',
        timestamp: new Date('2025-10-17T10:30:00'),
        adminId: 'a1',
        actiune: 'Modificare Criteriu',
        detalii: {
            criteriuId: 'crit1_nat',
            modificare: 'descriere',
            valoareVeche: 'Descriere veche...',
            valoareNoua: 'Descriere noua...',
            motiv: 'Ajustare descriere conform feedback juriu național.'
        }
    }
];

export const DEFAULT_DOCUMENTATION_CONTENT: DocumentationContent = {
  mainTitle: 'Documentație Platformă Jurizare',
  mainSubtitle: 'Ghid de utilizare și descrierea procesului de jurizare pentru Gala Directorii Anului.',
  overviewTitle: 'Procesul de Jurizare - O privire de ansamblu',
  overviewText: 'Platforma este concepută pentru a facilita un proces de evaluare transparent, eficient și standardizat. Procesul se desfășoară în mai multe etape, fiecare cu propriile criterii de evaluare, culminând cu desemnarea câștigătorilor pe categorii și a marelui titlu "Directorul Anului".',
  stagesTitle: 'Etapele Competiției',
  stage1_title: 'Validarea înscrierilor:',
  stage1_desc: 'Etapa inițială de verificare a eligibilității candidaților.',
  stage2_title: 'Etapa Preliminară:',
  stage2_desc: 'O primă rundă de selecție bazată pe criterii generale.',
  stage3_title: 'Jurizarea Regională:',
  stage3_desc: 'Candidații sunt evaluați în contextul regiunii lor de proveniență. Cei mai buni avansează la nivel național.',
  stage4_title: 'Jurizarea Națională:',
  stage4_desc: 'Finaliștii regionali sunt evaluați de un juriu extins pe baza unor criterii de impact național. Câștigătorii acestei etape devin finaliștii pentru marele premiu.',
  stage5_title: 'Finala:',
  stage5_desc: 'Etapa de desemnare a titlului "Directorul Anului" dintre câștigătorii pe categorii.',
  stage6_title: 'Clasament Final:',
  stage6_desc: 'Vizualizarea rezultatelor finale, inclusiv a Directorului Anului și a laureaților pe categorii.',
  criteriaTitle: 'Criterii și Punctaj',
  criteriaP1: 'Pentru fiecare etapă și categorie de premiere, sunt definite criterii de evaluare specifice. Fiecare criteriu are un punctaj maxim care reflectă importanța sa.',
  criteriaP2: 'Scorul Final pentru un candidat, într-o anumită etapă, se calculează ca suma simplă a notelor acordate pentru fiecare criteriu.',
  criteriaExampleTitle: 'Exemplu de calcul:',
  criteriaExampleLi1_title: 'Criteriu A (Max 13p):',
  criteriaExampleLi1_desc: 'Nota 12',
  criteriaExampleLi2_title: 'Criteriu B (Max 8p):',
  criteriaExampleLi2_desc: 'Nota 7',
  criteriaExampleResult: 'Scor Final = 12 + 7 = 19',
  rolesTitle: 'Rolurile Utilizatorilor',
  roleJudgeTitle: 'Jurat',
  roleJudgeP1: 'Jurații sunt responsabili pentru evaluarea candidaților care le-au fost asignați. Din Portalul Jurat, aceștia pot:',
  roleJudgeLi1: 'Vizualiza lista de candidați asignați pentru etapa curentă.',
  roleJudgeLi2: 'Filtra și căuta candidați pentru a-și organiza munca.',
  roleJudgeLi3: 'Acorda scoruri pentru fiecare criteriu de evaluare (fără a vedea media finală, vizibilă doar administratorilor).',
  roleJudgeLi4: 'Adăuga observații textuale pentru a-și justifica deciziile.',
  roleJudgeLi5: 'Salva progresul unei evaluări (status "În curs") sau o pot trimite ca finală (status "Finalizat").',
  roleAdminTitle: 'Administrator',
  roleAdminP1: 'Administratorii au control complet asupra platformei și a desfășurării competiției. Din panoul de Administrare, aceștia pot:',
  roleAdminLi1: 'Configura etapele (active vs etapa curentă), categoriile și criteriile de evaluare.',
  roleAdminLi2: 'Gestiona lista de candidați și jurați.',
  roleAdminLi3: 'Asigna manual sau automat candidați către jurați pentru fiecare etapă.',
  roleAdminLi4: 'Monitoriza și modifica scoruri (cu justificare obligatorie, înregistrată în jurnalul de audit).',
  roleAdminLi5: 'Vizualiza un jurnal de audit detaliat cu toate acțiunile critice efectuate pe platformă.',
  roleAdminLi6: 'Monitoriza progresul prin matricea de asignări (acum complet responsive și optimizată pentru dispozitive mobile) și exporta datele competiției.',
  roleAdminLi7: 'Promova candidații dintr-o etapă în alta și desemna câștigătorii finali.',
};