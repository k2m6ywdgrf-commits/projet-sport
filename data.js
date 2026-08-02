/* ════════════════════════════════════════════════════════════════
   PULSE — Données de référence : niveaux, badges, défis, échauffements,
   base d'exercices, fiches coach, poses du mannequin de démonstration.
   Ce fichier ne contient que des données ; toute la logique est dans app.js.
   ════════════════════════════════════════════════════════════════ */

/* Palette par groupe musculaire (dot de couleur + camembert de répartition) */
const ZONE={
  y:{l:'Pectoraux', c:'#f0b429'},
  w:{l:'Épaules',   c:'#63b3ed'},
  b:{l:'Triceps',   c:'#2dd4bf'},
  p:{l:'Dos',       c:'#7c93ff'},
  g:{l:'Abdos',     c:'#34d399'},
  h:{l:'Full-Body', c:'#c084fc'},
  c:{l:'Cardio',    c:'#fb923c'},
  j:{l:'Jambes',    c:'#f472b6'}
};

const LVL=[
  {a:1, b:4,   n:'DÉBUTANT'},
  {a:5, b:9,   n:'RÉGULIER'},
  {a:10,b:14,  n:'CONFIRMÉ'},
  {a:15,b:19,  n:'ATHLÈTE'},
  {a:20,b:29,  n:'ÉLITE'},
  {a:30,b:999, n:'VÉTÉRAN'}
];
const getLN=l=>(LVL.find(x=>l>=x.a&&l<=x.b)||LVL[0]).n;

const BADGES={
  first_blood:{i:'🩸',n:'Premier Pas',d:'Première séance'},
  ten:{i:'🔟',n:'Régulier',d:'10 séances'},
  fifty:{i:'🌟',n:'50 Séances',d:'50 séances'},
  hundred:{i:'💯',n:'Centenaire',d:'100 séances'},
  j100:{i:'🐰',n:'Petit Lapin',d:'100 sauts à la corde'},
  j1k:{i:'🦘',n:'Kangourou',d:'1000 sauts à la corde'},
  j10k:{i:'🚀',n:'Endurant',d:'10000 sauts à la corde'},
  r5k:{i:'💥',n:'5000 Reps',d:'Atteins 5000 répétitions'},
  r20k:{i:'🏛️',n:'20000 Reps',d:'Atteins 20000 répétitions'},
  l3:{i:'🔰',n:'Premiers Progrès',d:'Atteins le niveau 3'},
  l5:{i:'⭐',n:'Confirmé',d:'Atteins le niveau 5'},
  l10:{i:'🌙',n:'Solide',d:'Atteins le niveau 10'},
  l20:{i:'👑',n:'Élite',d:'Atteins le niveau 20'},
  l30:{i:'🌌',n:'Vétéran',d:'Atteins le niveau 30'},
  s5:{i:'🔥',n:'En Feu',d:'5 séances consécutives'},
  s7:{i:'📅',n:'Semaine Parfaite',d:'7 séances consécutives'},
  s10:{i:'💎',n:'Diamant',d:'10 séances consécutives'},
  s30:{i:'♾️',n:'Invincible',d:'30 séances consécutives'},
  restday:{i:'🛌',n:'Repos Mérité',d:'Un jour de repos après une belle série — la récupération fait partie de l’entraînement'},
  amrap:{i:'⚡',n:'Premier AMRAP',d:'1ère session AMRAP'},
  amrap10:{i:'🌊',n:'Habitué de l’AMRAP',d:'10 sessions AMRAP'},
  amrap30:{i:'🏄',n:'Endurant',d:'AMRAP de 30 min'},
  mat:{i:'🧘',n:'Guerrier du Sol',d:'5 séances tapis de sol'},
  mat20:{i:'🥷',n:'Maître du Sol',d:'20 séances tapis de sol'},
  ch:{i:'🎯',n:'Sur Objectif',d:'1 défi hebdo complété'},
  ch3:{i:'🏅',n:'Triple Défi',d:'3 défis complétés'},
  long60:{i:'⏰',n:'Marathonien',d:'Séance de 60+ min'},
  early:{i:'🌅',n:'Lève-Tôt',d:'Séance avant 8h'},
  night:{i:'🦉',n:'Noctambule',d:'Séance après 22h'},
  variety:{i:'🎨',n:'Touche-à-Tout',d:'Utilise les 3 modes'},
  xp1k:{i:'🔋',n:'1000 XP',d:'Accumule 1000 XP'},
  xp10k:{i:'⚛️',n:'10000 XP',d:'Accumule 10000 XP'},
  bonus:{i:'🔓',n:'Mouvements Avancés',d:'Atteins le niveau 10'}
};

const CH_TPL=[
  {d:'Complète 3 séances cette semaine',t:'sess',v:3},
  {d:'Réalise 200 répétitions',t:'reps',v:200},
  {d:'Saute 500 fois à la corde',t:'jumps',v:500},
  {d:'Complète 5 séances',t:'sess',v:5},
  {d:'Accumule 400 répétitions',t:'reps',v:400},
  {d:'Saute 1000 fois à la corde',t:'jumps',v:1000},
  {d:'Fais une session AMRAP',t:'amrap',v:1},
  {d:'Une séance de 20 minutes ou plus',t:'long',v:1},
  {d:'600 répétitions cette semaine',t:'reps',v:600},
  {d:'4 séances cette semaine',t:'sess',v:4}
];

const WU=[
  {n:'Rotations des épaules',t:'Grands cercles lents avant/arrière',s:20},
  {n:'Cercles de bras',t:'Bras tendus, grands cercles alternés',s:20},
  {n:'Flexions du cou',t:"Tête d'un côté puis de l'autre",s:15}
];
const WU_POOL={
  base:[
    {n:'Rotations des épaules',t:'Grands cercles lents avant/arrière',s:20},
    {n:'Flexions du cou',t:"Tête d'un côté puis de l'autre",s:15}
  ],
  push:[
    {n:'Mobilité des poignets',t:'Paumes au sol, transfert de poids avant/arrière puis cercles',s:25},
    {n:'Cercles de bras',t:'Bras tendus, grands cercles alternés',s:20}
  ],
  core:[
    {n:'Rotations du buste',t:'Mains sur les hanches, rotation lente',s:20},
    {n:'Chat-Vache',t:'Dos rond puis creux, enchaîne lentement',s:20}
  ],
  legs:[
    {n:'Balancers de jambe',t:'Appui sur un mur, balance la jambe avant/arrière',s:20},
    {n:'Fentes marchées',t:'Grandes fentes lentes, buste droit',s:20}
  ],
  cardio:[
    {n:'Marche sur place',t:'Genoux levés, bras balancés',s:20},
    {n:'Sauts légers',t:'Petits rebonds sur la pointe des pieds',s:15}
  ]
};
const CD_POOL={
  base:[{n:'Respiration profonde',t:'Inspire 4s, expire 4s, relâche les épaules',s:30}],
  push:[
    {n:'Étirement pectoraux',t:'Bras écarté, tourne doucement le buste',s:25},
    {n:'Étirement triceps',t:'Coude plié derrière la tête, maintiens',s:20}
  ],
  core:[
    {n:'Posture de l’enfant',t:'Bras tendus devant, front vers le sol',s:30},
    {n:'Étirement lombaires',t:'Genoux sur la poitrine, allongé sur le dos',s:25}
  ],
  legs:[
    {n:'Étirement quadriceps',t:'Talon vers la fesse, bassin en rétroversion',s:25},
    {n:'Étirement ischio-jambiers',t:'Jambe tendue devant, buste vers le pied',s:25}
  ],
  cardio:[
    {n:'Marche lente',t:'Reviens progressivement à un rythme calme',s:30},
    {n:'Étirement mollets',t:'Pied avant fléchi, jambe arrière tendue',s:20}
  ]
};

/* ════════ BASE D'EXERCICES ════════
   z = groupe musculaire (voir ZONE) — r = reps/durée par défaut — s = séries
   tf = repère pieds (pompes debout) — tk = repère genoux (variante accessible) */
const EX={
  board_pecs:{n:"Pompes Grand Angle",z:"y",r:"8-12",s:3,tf:"Mains écartées, coudes vers l'extérieur.",tk:"Sur les genoux, mains écartées."},
  board_standard:{n:"Pompes Standard",z:"y",r:"10-15",s:3,tf:"Mains à largeur d'épaules, gainage strict.",tk:"Sur les genoux, corps aligné."},
  board_shoulders:{n:"Pompes Épaules",z:"w",r:"6-10",s:3,tf:"Fesses relevées, poids vers l'avant.",tk:"Hanches levées, incline le buste."},
  board_triceps:{n:"Pompes Triceps",z:"b",r:"8-12",s:3,tf:"Coudes serrés contre les côtes.",tk:"Genoux au sol, coudes collés."},
  archer:{n:"Archer Push-Up",z:"y",r:"4-7",s:3,tf:"Bras tendu d'un côté, flexion de l'autre.",tk:"Même geste, contrôle maximal.",unlock:{req:'board_standard',min:60}},
  pike:{n:"Pike Push-Up",z:"w",r:"6-10",s:3,tf:"Hanches en V, descends la tête vers le sol.",tk:"Position en V sur les genoux.",unlock:{req:'board_shoulders',min:40}},
  pseudo:{n:"Pseudo-Planche",z:"y",r:"3-6",s:3,tf:"Corps penché en avant, doigts vers les pieds.",tk:"Sur les genoux, incline le torse.",unlock:{req:'board_pecs',min:60}},
  diamond:{n:"Diamond Push-Up",z:"b",r:"8-12",s:3,tf:"Mains en losange, coudes serrés.",tk:"Mêmes mains, contrôle parfait.",unlock:{req:'board_triceps',min:40}},
  ab_wheel:{n:"Roue Abdominale",z:"g",r:"6-10",s:3,tf:"Déploiement contrôlé, ventre rentré.",tk:"Déploiement partiel sur les genoux."},
  jump_rope:{n:"Corde à Sauter",z:"c",r:"50 Sauts",s:3,tf:"Sauts légers sur la pointe des pieds.",tk:"Petits sauts rythmés."},
  bands:{n:"Élastique Fitness",z:"w",r:"12-15",s:3,tf:"Tension continue, ouvre la poitrine.",tk:"Reste droit, amplitude complète."},
  band_row:{n:"Rowing Élastique",z:"p",r:"12-15",s:3,tf:"Buste droit, tire les coudes vers l'arrière en serrant les omoplates.",tk:"Assis, même geste pour isoler le dos."},
  band_facepull:{n:"Tirage Visage Élastique",z:"p",r:"15-20",s:3,tf:"Élastique à hauteur d'épaule, tire vers le visage en écartant les coudes.",tk:"Assis, même geste, coudes toujours hauts."},
  mat_plank:{n:"Planche",z:"g",r:"30s",s:3,tf:"Corps droit, abdos serrés, respiration régulière.",tk:"Sur les genoux si besoin.",timed:true,durBase:30},
  mat_splank:{n:"Planche Latérale",z:"g",r:"20s",s:3,tf:"Hanches levées, corps aligné tête-pieds.",tk:"Genou du bas au sol.",timed:true,durBase:20,unlock:{req:'mat_plank',min:20}},
  mat_mountain:{n:"Mountain Climbers",z:"h",r:"20 reps",s:3,tf:"Rythme rapide, hanches basses.",tk:"Rythme modéré."},
  mat_burpee:{n:"Burpees",z:"h",r:"8 reps",s:3,tf:"Explosivité au saut, contrôle à la descente.",tk:"Sans saut final.",unlock:{req:'mat_mountain',min:30}},
  mat_crunch:{n:"Crunchs",z:"g",r:"20 reps",s:3,tf:"Expire en montant, ne tire pas sur la nuque.",tk:"Amplitude réduite."},
  mat_bicycle:{n:"Crunch Vélo",z:"g",r:"16 reps",s:3,tf:"Rotation lente et complète.",tk:"Pieds au sol."},
  mat_legraise:{n:"Élévations de Jambes",z:"g",r:"12 reps",s:3,tf:"Lombaires plaquées au sol, jambes tendues.",tk:"Genoux légèrement fléchis."},
  mat_superman:{n:"Superman",z:"p",r:"12 reps",s:3,tf:"Dos et fessiers contractés, tiens 2s.",tk:"Amplitude partielle."},
  mat_glute:{n:"Pont Fessier",z:"j",r:"15 reps",s:3,tf:"Pousse avec les talons, contracte les fessiers.",tk:"Amplitude normale."},
  mat_russian:{n:"Russian Twist",z:"g",r:"20 reps",s:3,tf:"Pieds décollés, rotation maximale.",tk:"Pieds au sol."},
  mat_hollow:{n:"Hollow Body Hold",z:"g",r:"20s",s:3,tf:"Bas du dos au sol, bras et jambes à 45°.",tk:"Genoux fléchis.",timed:true,durBase:20,unlock:{req:'mat_plank',min:30}},
  mat_inchworm:{n:"Inchworm",z:"h",r:"8 reps",s:3,tf:"Marche avec les mains jusqu'en planche et reviens.",tk:"Genoux fléchis.",unlock:{req:'mat_mountain',min:20}},
  mac_bike:{n:"Vélo Intensif",z:"c",r:"15 min",s:1,tf:"Résistance élevée, fractionné 30s/30s.",tk:"Rythme modéré."},
  mac_elliptical:{n:"Elliptique",z:"c",r:"20 min",s:1,tf:"Bras et jambes actifs à fond.",tk:"Vitesse constante."},
  mac_treadmill:{n:"Tapis de Course",z:"c",r:"15 min",s:1,tf:"Inclinaison 3%, alternance course/marche.",tk:"Marche rapide."},
  mat_squat:{n:"Squats",z:"j",r:"15-20",s:3,tf:"Poids sur les talons, genoux dans l'axe des pieds.",tk:"Amplitude réduite, mains devant."},
  mat_lunge:{n:"Fentes Alternées",z:"j",r:"12-16",s:3,tf:"Buste droit, genou avant derrière la pointe du pied.",tk:"Fentes statiques, amplitude réduite."},
  mat_wallsit:{n:"Chaise (Wall Sit)",z:"j",r:"30s",s:3,tf:"Dos plaqué au mur, cuisses parallèles au sol.",tk:"Angle plus ouvert.",timed:true,durBase:30},
  mat_calf:{n:"Extensions Mollets",z:"j",r:"20-25",s:3,tf:"Amplitude maximale, 1s en haut, descente lente.",tk:"Appui contre un mur."},
  mat_jumpsquat:{n:"Squats Sautés",z:"j",r:"10-14",s:3,tf:"Extension explosive, réception souple sur genoux fléchis.",tk:"Squats simples avec montée sur pointes.",unlock:{req:'mat_squat',min:30}}
};
Object.keys(EX).forEach(k=>EX[k].k=k);// la clé voyage avec l'objet (fiches de mouvement, unlock, PR)

/* ════════ FICHES COACH (muscles ciblés, points clés, erreurs, respiration, régression) ════════ */
const DEMO={
  board_pecs:{a:'pu',m:'Pectoraux (faisceau externe), deltoïdes antérieurs',c:['Mains sur les repères les plus écartés, environ 1,5x la largeur des épaules.','Coudes à 45 degrés du buste, jamais à 90.','Descends jusqu\'à ce que la poitrine frôle la planche.','Corps en une seule ligne : nuque, dos, bassin, talons.'],e:['Coudes en croix (perpendiculaires au corps) : agressif pour l\'épaule.','Bassin qui s\'affaisse ou qui pointe vers le haut.','Amplitude partielle : tu perds l\'essentiel du travail.'],b:'Inspire en descendant, expire en poussant.',x:'Sur les genoux, ou mains surélevées sur un support.',bd:{p:'y1',note:'Poignées sur la paire JAUNE du haut (2 trous par poignée), colonne côté poignées. Ce sont les pectoraux qui encaissent.'}},
  board_standard:{a:'pu',m:'Pectoraux, triceps, gainage complet',c:['Mains à la largeur des épaules, juste sous les épaules.','Serre les fessiers et rentre les côtes : le buste ne doit pas cambrer.','Regard 20 cm devant les mains, nuque neutre.','Pousse le sol loin de toi en haut du mouvement.'],e:['Tête qui plonge en avant avant la poitrine.','Fesses qui montent en premier.','Rebond en bas : casse la tension.'],b:'Inspire en descendant, expire en poussant.',x:'Sur les genoux, même placement de mains.',bd:{p:'y2',note:'Poignées sur la paire JAUNE du bas (2 trous par poignée), colonne côté poignées. Largeur d\'épaules, alignées sous les épaules.'}},
  board_shoulders:{a:'pike',m:'Deltoïdes antérieurs et latéraux, triceps',c:['Bassin haut, corps en V inversé.','Descends le sommet du crâne vers le sol, entre les mains.','Coudes vers l\'avant, pas vers l\'extérieur.','Plus les pieds sont proches des mains, plus c\'est dur.'],e:['Dos rond : garde la poitrine ouverte.','Descendre le menton au lieu du sommet du crâne.'],b:'Inspire en descendant, expire en poussant.',x:'Pieds plus loin des mains, ou pompes inclinées.',bd:{p:'w1',note:'Poignées sur la paire BLANCHE, en haut du disque (2 trous par poignée, seule position possible) : les mains partent devant les épaules pour cibler les deltoïdes.'}},
  board_triceps:{a:'pu',m:'Triceps, pectoraux internes',c:['Coudes serrés le long du corps pendant toute la descente.','Mains proches l\'une de l\'autre, sous le sternum.','Descends lentement, remonte en poussant fort.'],e:['Coudes qui s\'écartent : tu retombes sur les pectoraux.','Vitesse excessive qui casse le contrôle.'],b:'Inspire en descendant, expire en poussant.',x:'Sur les genoux, coudes toujours serrés.',bd:{p:'o1',note:'Poignées sur la paire ORANGE, en bas du disque (2 trous par poignée, seule position possible) : coudes naturellement guidés le long du corps.'}},
  archer:{a:'pu',m:'Pectoraux, triceps, gainage — variante unilatérale avancée',c:['Mains très écartées, un bras reste tendu pendant toute la répétition.','Descends du côté du bras fléchi, hanche stable.','Le bras tendu glisse légèrement vers l\'extérieur en accompagnement.','Alterne les côtés à chaque répétition.'],e:['Bassin qui pivote au lieu de rester face au sol.','Vouloir aller trop vite avant d\'avoir la force nécessaire : mieux vaut peu de répétitions propres que beaucoup de sales.'],b:'Inspire en descendant, expire en poussant.',x:'Reviens à la pompe grand angle classique quelques séances de plus.'},
  pike:{a:'pike',m:'Deltoïdes, triceps — prépare au poirier',c:['Hanches hautes, jambes tendues si possible.','Descends la tête entre les mains, regard vers les pieds.','Pousse fort pour revenir en position haute.'],e:['Plier les coudes vers l\'extérieur.','Perdre la position en V en cours de mouvement.'],b:'Inspire en descendant, expire en poussant.',x:'Reviens aux pompes épaules classiques, pieds proches des mains.'},
  pseudo:{a:'pu',m:'Pectoraux, épaules, poignets — forte charge sur l\'avant-bras',c:['Mains tournées, doigts pointés vers les pieds.','Penche tout le corps vers l\'avant, épaules devant les mains.','Garde les coudes proches du corps.','Vas-y progressivement : les poignets ont besoin de temps pour s\'adapter.'],e:['Douleur de poignet : arrête immédiatement, ce n\'est jamais normal.','Vouloir un grand angle d\'inclinaison trop tôt.'],b:'Inspire en descendant, expire en poussant.',x:'Sur les genoux, incline le torse progressivement, séance après séance.'},
  diamond:{a:'pu',m:'Triceps (faisceau externe), pectoraux internes',c:['Pouces et index qui se touchent, forme de losange sous le sternum.','Coudes serrés le long du corps.','Descente lente et contrôlée.'],e:['Écarter les coudes pour compenser la difficulté.','Douleur au poignet : élargis légèrement les mains.'],b:'Inspire en descendant, expire en poussant.',x:'Sur les genoux, mêmes mains en losange.'},
  ab_wheel:{a:'abwheel',m:'Gainage profond, grand droit de l\'abdomen, dos',c:['Genoux au sol, roue sous les épaules.','Déploie en gardant les abdos gainés, sans creuser le bas du dos.','Ne va pas plus loin que ce que tu peux contrôler au retour.','Reviens en tirant avec les abdos, pas avec le dos.'],e:['Cambrer le bas du dos : la première cause de lombalgie sur cet exercice.','Chuter au lieu de contrôler le retour.'],b:'Inspire en déployant, expire en revenant.',x:'Réduis l\'amplitude du déploiement de moitié.'},
  jump_rope:{a:'jumprope',m:'Mollets, cardio, coordination',c:['Sauts petits et légers, sur la pointe des pieds.','Coudes proches du corps, ce sont les poignets qui font tourner la corde.','Regarde devant toi, pas tes pieds.'],e:['Sauter trop haut : ça fatigue pour rien et casse le rythme.','Sauter à pieds joints raide, genoux bloqués.'],b:'Respiration libre et régulière, calée sur le rythme des sauts.',x:'Mime le geste sans corde pour travailler le rythme.'},
  bands:{a:'bands',m:'Deltoïdes, pectoraux, gainage — résistance variable',c:['Tension légère dès le départ, ne jamais relâcher complètement.','Ouvre la poitrine en écartant les bras, omoplates serrées en fin de geste.','Reste droit, ne te penche pas en arrière pour t\'aider.'],e:['Relâcher d\'un coup en fin de mouvement : contrôle aussi le retour.','Épaules qui remontent vers les oreilles.'],b:'Expire en ouvrant, inspire en revenant.',x:'Choisis un élastique moins tendu ou réduis l\'amplitude.'},
  band_row:{a:'bandrow',m:'Grand dorsal, rhomboïdes, trapèzes moyens, biceps',c:['Fixe l\'élastique devant toi à hauteur de poitrine, bras tendus, tension déjà présente.','Tire les coudes vers l\'arrière en serrant les omoplates, pas juste en pliant les bras.','Coudes proches du corps, pas écartés vers l\'extérieur.','Contrôle le retour, ne laisse jamais l\'élastique claquer en avant.'],e:['Dos qui s\'arrondit pendant la traction : le bas du dos encaisse à ta place.','Tirer avec les bras seuls sans serrer les omoplates : le dos ne travaille pas vraiment.','Buste qui se balance à chaque répétition pour tricher l\'amplitude.'],b:'Expire en tirant, inspire en revenant.',x:'Réduis la tension de l\'élastique ou l\'amplitude du tirage.'},
  band_facepull:{a:'bandfp',m:'Deltoïdes postérieurs, rhomboïdes, trapèzes moyens — clé pour la santé des épaules',c:['Élastique fixé à hauteur d\'épaule, bras tendus devant toi.','Tire vers ton visage en écartant les coudes vers l\'extérieur, pouces vers les oreilles.','Serre les omoplates en fin de mouvement, tiens 1 seconde.','Coudes toujours plus hauts que les mains.'],e:['Tirer vers le ventre au lieu du visage : ça sollicite le dos, pas les épaules arrière.','Coudes qui tombent bas : l\'exercice perd tout son intérêt.','Aller trop vite : c\'est un mouvement de contrôle, pas d\'élan.'],b:'Expire en tirant, inspire en revenant lentement.',x:'Réduis la tension de l\'élastique ou l\'amplitude.'},
  mat_plank:{a:'plank',m:'Gainage complet (abdos, lombaires, épaules)',c:['Corps aligné des talons à la nuque, comme une planche.','Regarde le sol, nuque dans le prolongement du dos.','Serre les abdos et les fessiers pendant tout le maintien.'],e:['Bassin qui s\'affaisse : la première cause de douleur lombaire ici.','Fesses trop hautes : tu perds le travail des abdos.'],b:'Respiration régulière, ne bloque jamais.',x:'Sur les genoux, ou réduis la durée.'},
  mat_splank:{a:'splank',m:'Obliques, gainage latéral',c:['Corps aligné en une seule ligne, vu de face comme de profil.','Hanche du bas légèrement décollée du sol au départ.','Épaule directement au-dessus du coude d\'appui.'],e:['Hanche qui s\'affaisse vers le sol.','Épaule qui monte vers l\'oreille.'],b:'Respiration régulière, ne bloque jamais.',x:'Genou du bas posé au sol pour plus de stabilité.'},
  mat_mountain:{a:'mountain',m:'Abdos, cardio, coordination',c:['Position de planche haute, mains sous les épaules.','Ramène les genoux vers la poitrine en alternance, rythme soutenu.','Garde les hanches basses tout du long.'],e:['Hanches qui remontent : tu perds le gainage.','Rythme trop rapide qui casse la forme.'],b:'Respiration rapide et régulière, calée sur le rythme.',x:'Ralentis le rythme, un pied à la fois bien posé.'},
  mat_burpee:{a:'burpee',m:'Corps entier, cardio, explosivité',c:['Squat, poser les mains, jeter les pieds en planche.','Une pompe optionnelle, puis ramène les pieds.','Extension complète en position haute (avec ou sans saut).'],e:['Bas du dos qui s\'affaisse en position planche.','Réception raide au sol après le saut.'],b:'Expire sur l\'effort (saut ou extension), inspire en te repositionnant.',x:'Sans saut final, ni pompe : juste le mouvement de base.'},
  mat_crunch:{a:'crunch',m:'Grand droit de l\'abdomen',c:['Mains aux tempes ou croisées sur la poitrine, jamais tirer sur la nuque.','Décolle uniquement les omoplates du sol.','Contracte en expirant, redescends en contrôlant.'],e:['Tirer sur la tête avec les mains pour se hisser.','Amplitude excessive qui sollicite les hanches plus que les abdos.'],b:'Expire en montant, inspire en descendant.',x:'Réduis l\'amplitude au strict décollement des épaules.'},
  mat_bicycle:{a:'bicycle',m:'Grand droit et obliques',c:['Coude qui va chercher le genou opposé, jambes en alternance.','Bas du dos plaqué au sol tout du long.','Mouvement lent et contrôlé, pas un pédalage rapide.'],e:['Vitesse excessive : le mouvement devient inefficace.','Tirer sur la nuque avec les mains.'],b:'Expire à chaque rotation.',x:'Garde les pieds au sol, rotation du buste seule.'},
  mat_legraise:{a:'legraise',m:'Bas du grand droit de l\'abdomen, fléchisseurs de hanche',c:['Lombaires plaquées au sol pendant tout le mouvement.','Jambes tendues (ou légèrement fléchies), descente lente.','Ne descends que jusqu\'où le bas du dos reste au sol.'],e:['Le bas du dos qui se cambre dès que les jambes descendent : c\'est le signal pour réduire l\'amplitude.','Utiliser l\'élan plutôt que le contrôle.'],b:'Expire en montant, inspire en descendant.',x:'Genoux fléchis pour réduire le bras de levier.'},
  mat_superman:{a:'superman',m:'Érecteurs du rachis, fessiers, dos',c:['Allongé sur le ventre, bras et jambes tendus.','Soulève bras et jambes ensemble, regard vers le sol.','Tiens 2 secondes en haut, contracte fessiers et dos.'],e:['Hyperextension excessive de la nuque, regarde vers le sol.','Mouvement saccadé au lieu d\'un contrôle net.'],b:'Expire en montant, inspire en redescendant.',x:'Amplitude partielle, ou lève bras et jambes en alternance.'},
  mat_glute:{a:'glute',m:'Fessiers, ischio-jambiers',c:['Pieds à plat, largeur de hanches, genoux à 90 degrés.','Pousse avec les talons, pas la pointe des pieds.','Contracte fort les fessiers en position haute, tiens 1 seconde.'],e:['Cambrer le bas du dos plutôt que de pousser avec les fessiers.','Amplitude incomplète en haut du mouvement.'],b:'Expire en montant, inspire en descendant.',x:'Amplitude réduite, tiens la position basse plus longtemps.'},
  mat_russian:{a:'russian',m:'Obliques, gainage rotatif',c:['Buste incliné à 45°, pieds décollés si possible.','Rotation complète d\'un côté puis de l\'autre, mains jointes.','Garde le dos droit, pas arrondi.'],e:['Aller trop vite pour compenser un manque de contrôle.','Dos qui s\'arrondit pendant la rotation.'],b:'Expire à chaque rotation.',x:'Pieds au sol pour plus de stabilité.'},
  mat_hollow:{a:'hollow',m:'Gainage complet, très exigeant sur les abdos profonds',c:['Bas du dos plaqué au sol en permanence, c\'est la clé de l\'exercice.','Bras et jambes tendus à 45°, corps en forme de banane.','Si le dos décolle, remonte les jambes jusqu\'à ce qu\'il replaque.'],e:['Bas du dos qui décolle : signal immédiat pour réduire l\'amplitude.','Retenir sa respiration au lieu de respirer normalement.'],b:'Respiration régulière et fluide, ne bloque jamais.',x:'Genoux fléchis et bras le long du corps pour réduire l\'intensité.'},
  mat_inchworm:{a:'inchworm',m:'Ischio-jambiers, épaules, gainage — mobilité et force',c:['Pieds joints, plie le buste vers l\'avant, mains au sol.','Marche avec les mains jusqu\'à la position de planche haute.','Marche ensuite les pieds vers les mains, jambes aussi tendues que possible.'],e:['Genoux qui plient trop tôt pour compenser le manque de souplesse.','Bas du dos qui s\'affaisse en position planche.'],b:'Respiration libre, calée sur le rythme du mouvement.',x:'Genoux fléchis pendant toute la marche.'},
  mac_bike:{a:'bike',m:'Quadriceps, ischio-jambiers, cardio à faible impact',c:['Réglage de selle : jambe presque tendue en bas du pédalage.','Garde le dos droit, épaules relâchées.','Alterne les phases d\'effort et de récupération.'],e:['Selle trop basse : mauvais rendement et stress sur les genoux.','S\'agripper au guidon avec tension dans les épaules.'],b:'Respiration régulière, calée sur l\'intensité de l\'effort.',x:'Résistance plus faible, rythme régulier.'},
  mac_elliptical:{a:'ellip',m:'Corps entier, cardio à faible impact',c:['Pousse et tire avec bras et jambes de façon coordonnée.','Garde le buste stable, sans t\'affaler sur les poignées.','Alterne le sens de pédalage pour varier le travail.'],e:['S\'appuyer tout le poids du corps sur les bras.','Foulée trop courte qui limite l\'amplitude de travail.'],b:'Respiration régulière, expire toutes les 2 à 3 foulées.',x:'Résistance plus faible, amplitude naturelle.'},
  mac_treadmill:{a:'tread',m:'Corps entier, cardio, endurance',c:['Regard à l\'horizon, pas sur tes pieds.','Foulée courte et fréquente plutôt que longue.','Cours au milieu du tapis, sans t\'accrocher aux barres.'],e:['S\'accrocher aux poignées en montée.','Attaquer le sol avec le talon loin devant soi.'],b:'Respiration régulière, expire tous les 2 à 3 appuis.',x:'Marche rapide inclinée à 5-8%.'},
  mat_squat:{a:'squat',m:'Quadriceps, fessiers, ischio-jambiers',c:['Poids sur les talons, genoux dans l\'axe des pieds.','Descends comme pour t\'asseoir, buste droit.','Pousse le sol pour remonter, fessiers contractés en haut.'],e:['Genoux qui rentrent vers l\'intérieur.','Talons qui décollent du sol.'],b:'Inspire en descendant, expire en remontant.',x:'Amplitude réduite, mains tendues devant pour l\'équilibre.'},
  mat_lunge:{a:'lunge',m:'Quadriceps, fessiers, équilibre',c:['Grand pas en avant, buste droit tout du long.','Le genou avant reste au-dessus de la cheville, pas au-delà de la pointe du pied.','Descends jusqu\'à ce que le genou arrière frôle le sol.'],e:['Genou avant qui dépasse largement la pointe du pied.','Buste qui se penche en avant pendant la descente.'],b:'Inspire en descendant, expire en remontant.',x:'Fentes statiques (sans alterner), amplitude réduite.'},
  mat_wallsit:{a:'wallsit',m:'Quadriceps, gainage isométrique',c:['Dos entièrement plaqué au mur.','Cuisses parallèles au sol, genoux à 90 degrés.','Poids réparti sur toute la plante des pieds.'],e:['Genoux qui dépassent la pointe des pieds.','Bas du dos qui se décolle du mur.'],b:'Respiration régulière, ne bloque jamais.',x:'Angle de genoux plus ouvert (moins profond).'},
  mat_calf:{a:'calf',m:'Mollets (gastrocnémien, soléaire)',c:['Monte le plus haut possible sur la pointe des pieds.','Tiens 1 seconde en haut, contracte fort.','Redescends lentement jusqu\'à sentir l\'étirement.'],e:['Rebondir au lieu de contrôler la descente.','Amplitude trop courte qui limite le travail.'],b:'Expire en montant, inspire en descendant.',x:'Amplitude réduite, appui léger contre un mur pour l\'équilibre.'},
  mat_jumpsquat:{a:'jumpsquat',m:'Quadriceps, fessiers, puissance explosive',c:['Squat classique, puis extension explosive vers le haut.','Réception souple, genoux fléchis, comme pour amortir une chute.','Enchaîne directement dans le squat suivant.'],e:['Réception jambes tendues : très traumatisant pour les genoux.','Genoux qui rentrent vers l\'intérieur à la réception.'],b:'Expire à l\'impulsion, inspire à la réception.',x:'Squats simples avec une montée sur la pointe des pieds, sans saut.'}
};

/* Prérequis lisibles pour l'écran de déblocage (nom du mouvement de base) */
function unlockLabel(k){const u=EX[k]&&EX[k].unlock;if(!u)return null;const base=EX[u.req];return{base:base?base.n:u.req,min:u.min};}

/* ════════ MANNEQUIN DE DÉMONSTRATION (rig SVG à angles articulaires) ════════
   Squelette à longueurs d'os fixes ; chaque pose ne donne que des angles.
   Angles en degrés, repère écran (y vers le bas) : 0 = droite, 90 = bas,
   -90 = haut, 180 = gauche. Le personnage regarde vers la gauche. */
const RIG={neck:12,torso:42,uarm:24,farm:22,thigh:28,shin:28,foot:12,headOff:18,headRx:12,headRy:14.5};
const D2R=Math.PI/180,_f=n=>n.toFixed(1);
const PT=(p,a,l)=>[p[0]+l*Math.cos(a*D2R),p[1]+l*Math.sin(a*D2R)];
const FLOOR=158;
function buildPose(o){
  const front=o.v==='front',so=front?16:7,ho=front?10:3.5;
  const hip=[150,100],sp=o.sp,pp=sp+90;
  const sh=PT(hip,sp,RIG.torso);
  const hd=o.hd!==undefined?o.hd:sp;
  const neck=PT(sh,hd,RIG.neck),head=PT(neck,hd,RIG.headOff);
  const arm=(s,a)=>{const e=PT(s,a[0],RIG.uarm);return[s,e,PT(e,a[1],RIG.farm)];};
  const leg=(s,a)=>{const k=PT(s,a[0],RIG.thigh),n=PT(k,a[1],RIG.shin);return[s,k,n,PT(n,a[2],RIG.foot)];};
  const P={head,hd,neck,sh,hip,
    armF:arm(PT(sh,pp,-so),o.aF||o.aN),armN:arm(PT(sh,pp,so),o.aN),
    legF:leg(PT(hip,pp,-ho),o.lF||o.lN),legN:leg(PT(hip,pp,ho),o.lN),
    acc:o.acc,ac:o.ac,front};
  const pts=[P.head,P.neck,P.sh,P.hip,...P.armF,...P.armN,...P.legF,...P.legN];
  const xs=pts.map(q=>q[0]);
  const ysC=pts.slice(1).map(q=>q[1]);
  const contact=Math.max(Math.max(...ysC),P.head[1]+RIG.headRy-5);
  const dy=FLOOR-contact-(o.lift||0)-2;
  const dx=150-(Math.min(...xs)+Math.max(...xs))/2;
  [P.head,P.neck,P.sh,P.hip].forEach(q=>{q[0]+=dx;q[1]+=dy;});
  [P.armF,P.armN,P.legF,P.legN].forEach(c=>c.forEach(q=>{q[0]+=dx;q[1]+=dy;}));
  return P;
}
function capsule(a,b,w1,w2){
  const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);
  if(L<0.6)return'';
  const px=-dy/L,py=dx/L,r1=w1/2,r2=w2/2;
  return`M${_f(a[0]+px*r1)},${_f(a[1]+py*r1)} L${_f(b[0]+px*r2)},${_f(b[1]+py*r2)}`
    +` A${_f(r2)},${_f(r2)} 0 0 0 ${_f(b[0]-px*r2)},${_f(b[1]-py*r2)}`
    +` L${_f(a[0]-px*r1)},${_f(a[1]-py*r1)} A${_f(r1)},${_f(r1)} 0 0 0 ${_f(a[0]+px*r1)},${_f(a[1]+py*r1)} Z`;
}
function flesh(pts,ws,bones){
  const P=[pts[0]],W=[ws[0]];
  for(let i=1;i<pts.length;i++){
    const b=bones&&bones[i-1];
    if(b){P.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*b.t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*b.t]);W.push(b.w);}
    P.push(pts[i]);W.push(ws[i]);
  }
  return{P,W};
}
function chain(pts,ws,rootR){
  let d='';const balls=[];
  for(let i=1;i<pts.length;i++)d+=capsule(pts[i-1],pts[i],ws[i-1],ws[i]);
  for(let i=1;i<pts.length-1;i++){
    const a1=Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0]);
    const a2=Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0]);
    let t=Math.abs((a2-a1)*180/Math.PI)%360;if(t>180)t=360-t;
    if(t>14)balls.push([pts[i][0],pts[i][1],ws[i]/2]);
  }
  const root=rootR?[pts[0][0],pts[0][1],rootR]:null;
  return{d,balls,root};
}
const W_ARM=[15,10,7.5],W_LEG=[20,12.5,8.5,7];
const B_ARM=[{t:.44,w:15.5},{t:.32,w:11.5}];
const B_LEG=[{t:.42,w:20.5},{t:.28,w:14.5},null];
const W_SH=32,W_WAIST=24,W_HIP=28,C_RIM='var(--figRim)',C_SHIRT='#3b4a6b',C_SHIRT2='#2d3a56';
const WEAR={short:['#9aa0a8','#6b7079'],liner:['#5f636d','#494d56'],sock:['#767c87','#585d67'],
            shoe:['#3a4767','#25304b'],sole:['#eef1f6','#b7bece']};
let _gid=0;
function faceSVG(){return'';}
function poseCel(pose,dx,mask){
  const P=buildPose(pose);
  const gid='cl'+(_gid++);
  const R_DELT=W_ARM[0]/2+1,R_HIP=W_LEG[0]/2+0.5;
  const mk=(pts,ws,bones,r)=>{const f=flesh(pts,ws,bones);return chain(f.P,f.W,r);};
  const far=[mk(P.armF,W_ARM,B_ARM,R_DELT),mk(P.legF,W_LEG,B_LEG,R_HIP)];
  const near=[mk(P.armN,W_ARM,B_ARM,R_DELT),mk(P.legN,W_LEG,B_LEG,R_HIP)];
  const waist=[P.sh[0]+(P.hip[0]-P.sh[0])*.56,P.sh[1]+(P.hip[1]-P.sh[1])*.56];
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const shirtBot=lerp(P.sh,P.hip,.72),shirtW=W_SH-(W_SH-W_WAIST)*.72;
  const tee=chain([P.sh,shirtBot],[W_SH-1,shirtW-1]);
  const sleeve=A=>chain([A[0],lerp(A[0],A[1],.48)],[W_ARM[0]+1.5,15.8]);
  const legwear=L=>{
    const piece=(q,k)=>`<path d="${q.d}" fill="${WEAR[k][1]}" stroke="${WEAR[k][1]}" stroke-width="2.4" stroke-linejoin="round"/><path d="${q.d}" fill="${WEAR[k][0]}"/>`;
    let w=piece(chain([lerp(L[0],L[1],.36),lerp(L[0],L[1],.66)],[W_LEG[0]+1,W_LEG[1]+4.5]),'liner');
    w+=piece(chain([lerp(L[1],L[2],.26),lerp(L[1],L[2],.95)],[W_LEG[1]+2.5,W_LEG[2]+2.5]),'sock');
    const an=Math.atan2(L[3][1]-L[2][1],L[3][0]-L[2][0])/D2R;
    const hp=PT(L[2],an+180,5),tp=PT(L[3],an,2);
    const far=d=>Math.hypot(PT(L[2],d,10)[0]-L[1][0],PT(L[2],d,10)[1]-L[1][1]);
    const dn=far(an+90)>far(an-90)?an+90:an-90;
    w+=piece(chain([PT(hp,dn,3),PT(tp,dn,3)],[6.5,5.5]),'sole');
    w+=piece(chain([hp,tp],[12,9]),'shoe');
    return w;
  };
  const body=[chain([P.sh,waist,P.hip],[W_SH,W_WAIST,W_HIP]),chain([P.sh,P.neck],[14,12.5])];
  const ovg=(a,b,rx,ry,ext)=>{const an=Math.atan2(b[1]-a[1],b[0]-a[0])/D2R,c=PT(b,an,ext||0);
    return{x:c[0],y:c[1],rx,ry,a:an};};
  const ovals=[[ovg(P.armF[1],P.armF[2],7.5,5.8,3)],[ovg(P.armN[1],P.armN[2],7.5,5.8,3)]];
  const heelC=L=>{const an=Math.atan2(L[3][1]-L[2][1],L[3][0]-L[2][0])/D2R;
    return chain([L[2],PT(L[2],an+180,4)],[8.5,6.5]);};
  const ang=Math.atan2(P.head[1]-P.neck[1],P.head[0]-P.neck[0])/D2R+90;
  const cx=P.hip[0];
  let o=mask?'':`<g transform="translate(${dx},0)">`;
  o+=mask?'':`<defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="70" y1="10" x2="230" y2="172">
<stop offset="0" stop-color="var(--figA)"/><stop offset=".4" stop-color="var(--figB)"/><stop offset=".74" stop-color="var(--figC)"/><stop offset="1" stop-color="var(--figD)"/></linearGradient>
<radialGradient id="s${gid}"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="h${gid}"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>`;
  o+=mask?'':`<ellipse cx="${_f(cx)}" cy="161" rx="52" ry="9" fill="url(#s${gid})"/>`;
  const blob=(b,g)=>b.map(o=>`<ellipse cx="${_f(o.x)}" cy="${_f(o.y)}" rx="${_f(o.rx+g)}" ry="${_f(o.ry+g)}" transform="rotate(${_f(o.a)} ${_f(o.x)} ${_f(o.y)})" fill="${g?C_RIM:`url(#${gid})`}"/>`).join('');
  const balls=(q,g)=>q.balls.map(([x,y,r])=>`<circle cx="${_f(x)}" cy="${_f(y)}" r="${_f(r+g)}" fill="${g?C_RIM:`url(#${gid})`}"/>`).join('');
  const roots=g=>list=>list.filter(q=>q.root).map(q=>`<circle cx="${_f(q.root[0])}" cy="${_f(q.root[1])}" r="${_f(q.root[2]+g)}" fill="${g?C_RIM:`url(#${gid})`}"/>`).join('');
  const grp=(list,ext)=>`<g fill="${C_RIM}" stroke="${C_RIM}" stroke-width="2.4" stroke-linejoin="round">${list.map(q=>`<path d="${q.d}"/>`).join('')}</g>${list.map(q=>balls(q,1.2)).join('')}${ext?blob(ext,1.2):''}`
    +`<g fill="url(#${gid})">${list.map(q=>`<path d="${q.d}"/>`).join('')}</g>${list.map(q=>balls(q,0)).join('')}${ext?blob(ext,0):''}${roots(0)(list)}`;
  far.push(heelC(P.legF));near.push(heelC(P.legN));
  const egg=k=>`M0,${-RIG.headRy-k} C${7+k},${-RIG.headRy-k} ${RIG.headRx+k},${-9-k*.5} ${RIG.headRx+k},${-2}`
    +` C${RIG.headRx+k},${7+k} ${6+k},${RIG.headRy+k} 0,${RIG.headRy+k}`
    +` C${-6-k},${RIG.headRy+k} ${-RIG.headRx-k},${7+k} ${-RIG.headRx-k},${-2}`
    +` C${-RIG.headRx-k},${-9-k*.5} ${-7-k},${-RIG.headRy-k} 0,${-RIG.headRy-k} Z`;
  if(mask){
    const gh=mask==='ghost',si=mask==='silh';
    const allc=[...far,...body,...near];
    let m=gh?`<g transform="translate(${dx},0)" opacity=".26" fill="var(--figRim)">`
        :si?`<g transform="translate(${dx},0)" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round">`
            :`<g transform="translate(${dx},0)" fill="#000" stroke="#000" stroke-width="7" stroke-linejoin="round">`;
    m+=allc.map(q=>`<path d="${q.d}"/>`).join('');
    allc.forEach(q=>{q.balls.forEach(([x,y,r])=>m+=`<circle cx="${_f(x)}" cy="${_f(y)}" r="${_f(r)}"/>`);
      if(q.root)m+=`<circle cx="${_f(q.root[0])}" cy="${_f(q.root[1])}" r="${_f(q.root[2])}"/>`;});
    [...ovals[0],...ovals[1]].forEach(v=>m+=`<ellipse cx="${_f(v.x)}" cy="${_f(v.y)}" rx="${_f(v.rx)}" ry="${_f(v.ry)}" transform="rotate(${_f(v.a)} ${_f(v.x)} ${_f(v.y)})"/>`);
    m+=`<g transform="translate(${_f(P.head[0])} ${_f(P.head[1])}) rotate(${_f(ang)})"><path d="${egg(gh?0:2)}"/></g>`;
    return m+`</g>`;
  }
  if(!mask){
  const wash=list=>`<g opacity=".26" fill="#101828">${list.map(q=>`<path d="${q.d}"/>`).join('')}`
    +list.map(q=>q.balls.map(([x,y,r])=>`<circle cx="${_f(x)}" cy="${_f(y)}" r="${_f(r)}"/>`).join('')).join('')+`</g>`;
  const dress=(q,c)=>`<path d="${q.d}" fill="${c}"/>`;
  o+=grp(far,ovals[0]);
  o+=dress(sleeve(P.armF),C_SHIRT2)+legwear(P.legF)+wash(far);
  o+=grp(body);
  o+=dress(tee,C_SHIRT);
  o+=`<g transform="translate(${_f(P.head[0])} ${_f(P.head[1])}) rotate(${_f(ang)})">`
    +`<path d="${egg(1.4)}" fill="${C_RIM}"/><path d="${egg(0)}" fill="url(#${gid})"/>`
    +`<ellipse cx="-4" cy="-9" rx="4" ry="4.6" transform="rotate(-18 -4 -9)" fill="url(#h${gid})"/>`
    +faceSVG(P.front)+`</g>`;
  o+=roots(0)(near);
  o+=grp(near,ovals[1]);
  o+=dress(sleeve(P.armN),C_SHIRT)+legwear(P.legN);
  {const sp=q=>`<path d="${q.d}" fill="${WEAR.short[1]}" stroke="${WEAR.short[1]}" stroke-width="2.4" stroke-linejoin="round"/><path d="${q.d}" fill="${WEAR.short[0]}"/>`;
   const legpart=L=>chain([lerp(L[0],L[1],-.06),lerp(L[0],L[1],.46)],[W_LEG[0]+2,W_LEG[0]-.5]);
   o+=sp(legpart(P.legF))+sp(legpart(P.legN));}
  }
  const ac=P.ac||'#ff8a3d',h1=P.armF[2],h2=P.armN[2];
  const line=(d,col,w)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  if(P.acc==='band'){const d=`M${_f(h1[0])},${_f(h1[1])} Q${_f((h1[0]+h2[0])/2)},${_f((h1[1]+h2[1])/2+16)} ${_f(h2[0])},${_f(h2[1])}`;o+=line(d,C_RIM,12)+line(d,ac,7);}
  if(P.acc==='rope'||P.acc==='ropeUp'){
    const up=P.acc==='ropeUp',my=up?P.head[1]-34:FLOOR+6;
    const d=`M${_f(h1[0])},${_f(h1[1])} Q${_f(cx)},${_f(my)} ${_f(h2[0])},${_f(h2[1])}`;o+=line(d,C_RIM,12)+line(d,ac,7);}
  const mach=(d,w)=>`<path d="${d}" fill="none" stroke="${C_RIM}" stroke-width="${w+4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${ac}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(P.acc==='bike'){
    const f1=P.legN[3],f2=P.legF[3],cr=[(f1[0]+f2[0])/2,(f1[1]+f2[1])/2],sd=[P.hip[0]+6,P.hip[1]+9],hb=[(h1[0]+h2[0])/2,(h1[1]+h2[1])/2];
    o+=mach(`M${_f(sd[0])},${_f(sd[1])} L${_f(cr[0])},${_f(cr[1])} L${_f(hb[0])},${_f(hb[1])} M${_f(sd[0])},${_f(sd[1])} L${_f(hb[0])},${_f(hb[1])}`
      +` M${_f(cr[0])},${_f(cr[1])} L${_f(cr[0]+4)},${FLOOR+4} M${_f(cr[0]-26)},${FLOOR+4} L${_f(cr[0]+34)},${FLOOR+4}`,5);
    o+=`<circle cx="${_f(cr[0])}" cy="${_f(cr[1])}" r="20" fill="none" stroke="${C_RIM}" stroke-width="9"/><circle cx="${_f(cr[0])}" cy="${_f(cr[1])}" r="20" fill="none" stroke="${ac}" stroke-width="5"/>`;
    o+=`<ellipse cx="${_f(sd[0])}" cy="${_f(sd[1])}" rx="15" ry="5" fill="${ac}" stroke="${C_RIM}" stroke-width="2.5"/>`;
    o+=`<circle cx="${_f(hb[0])}" cy="${_f(hb[1])}" r="7" fill="${ac}" stroke="${C_RIM}" stroke-width="2.5"/>`;
  }
  if(P.acc==='tread'){
    const y=FLOOR+4;
    o+=mach(`M60,${y} L240,${y} M232,${y} L232,${_f(P.sh[1]-6)} L206,${_f(P.sh[1]-6)}`,6);
  }
  if(P.acc==='ellip'){
    const f1=P.legN[3],f2=P.legF[3];
    o+=mach(`M${_f(h1[0])},${_f(h1[1])} L${_f(f2[0])},${_f(f2[1]-4)} M${_f(h2[0])},${_f(h2[1])} L${_f(f1[0])},${_f(f1[1]-4)}`,5);
    o+=mach(`M${_f(f1[0]-22)},${_f(FLOOR+4)} L${_f(f1[0]+26)},${_f(FLOOR+4)}`,5);
  }
  if(P.acc==='wheel'){const w=[(h1[0]+h2[0])/2,(h1[1]+h2[1])/2+4];
    o+=`<circle cx="${_f(w[0])}" cy="${_f(w[1])}" r="19" fill="${C_RIM}"/><circle cx="${_f(w[0])}" cy="${_f(w[1])}" r="16" fill="var(--bgi)"/><circle cx="${_f(w[0])}" cy="${_f(w[1])}" r="13" fill="none" stroke="${ac}" stroke-width="7"/><circle cx="${_f(w[0])}" cy="${_f(w[1])}" r="4.5" fill="${ac}"/>`;}
  o+=`</g>`;
  const sm='sm'+gid;
  o+=`<defs><linearGradient id="g${sm}" x1="0" y1="0" x2=".85" y2="1">`
    +`<stop offset="0" stop-color="#0a1020" stop-opacity="0"/><stop offset=".42" stop-color="#0a1020" stop-opacity=".05"/>`
    +`<stop offset="1" stop-color="#070d1a" stop-opacity=".4"/></linearGradient>`
    +`<mask id="${sm}" maskUnits="userSpaceOnUse" x="${dx}" y="0" width="300" height="200">`
    +`<rect x="${dx}" y="0" width="300" height="200" fill="#000"/>${poseCel(pose,dx,'silh')}</mask></defs>`
    +`<rect x="${dx}" y="0" width="300" height="200" fill="url(#g${sm})" mask="url(#${sm})"/>`;
  return o;
}
function poseTravel(a,b){
  const A=buildPose(a),B=buildPose(b);
  const j=P=>[P.head,P.sh,P.hip,P.armN[2],P.legN[3],P.legN[1]];
  const ja=j(A),jb=j(B);let m=0;
  for(let i=0;i<ja.length;i++)m=Math.max(m,Math.hypot(jb[i][0]-ja[i][0],jb[i][1]-ja[i][1]));
  return m;
}
function ghostSVG(pose,dx){return poseCel(pose,dx,'ghost');}
/* Point approximatif du groupe musculaire travaillé, pour le halo de couleur
   (voir muscleGlow). Compromis lisible plutôt qu'anatomiquement parfait :
   le but est de montrer d'un coup d'œil OÙ ça travaille. */
const lerpPt=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const midPt=(a,b)=>lerpPt(a,b,.5);
const ZONE_SPOT={
  y:P=>({p:lerpPt(P.sh,P.hip,.45),r:15}),
  w:P=>({p:P.sh,r:13}),
  b:P=>({p:midPt(P.armN[0],P.armN[1]),r:11}),
  p:P=>({p:lerpPt(P.hip,P.sh,1.05),r:14}),
  g:P=>({p:lerpPt(P.sh,P.hip,.75),r:16}),
  h:P=>({p:lerpPt(P.sh,P.hip,.5),r:19}),
  j:P=>({p:midPt(P.legN[0],P.legN[1]),r:15})
};
function muscleGlow(pose,dx,zone,color){
  const spot=ZONE_SPOT[zone];if(!spot||!color)return'';
  const s=spot(buildPose(pose));
  const cx=(s.p[0]+dx).toFixed(1),cy=s.p[1].toFixed(1),rx=s.r,ry=(s.r*.85).toFixed(1);
  return`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity=".65" style="filter:blur(6px)"/>`
    +`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="2.2" opacity=".95" style="filter:blur(.5px)"/>`;
}
function moveArrow(a,b,dx,color){
  const A=buildPose(a),B=buildPose(b);
  const j=P=>({hip:P.hip,sh:P.sh,head:P.head,hand:P.armN[2],foot:P.legN[3],knee:P.legN[1]});
  const pa=j(A),pb=j(B);
  const d=k=>Math.hypot(pb[k][0]-pa[k][0],pb[k][1]-pa[k][1]);
  let best=null;
  for(const k of['hip','sh'])if(d(k)>=11){best=(d('hip')>=d('sh')?'hip':'sh');break;}
  if(!best){let bd=13;for(const k of['foot','hand','head','knee'])if(d(k)>bd){bd=d(k);best=k;}}
  if(!best)return'';
  const p0=pa[best],p1=pb[best],L=d(best);
  const all=[];[A,B].forEach(P=>all.push(P.head,P.sh,P.hip,...P.armN,...P.legN,...P.armF,...P.legF));
  const cx=all.reduce((s,q)=>s+q[0],0)/all.length,cy=all.reduce((s,q)=>s+q[1],0)/all.length;
  const mx=(p0[0]+p1[0])/2,my=(p0[1]+p1[1])/2;
  const vx=(p1[0]-p0[0])/L,vy=(p1[1]-p0[1])/L;
  let ox=-vy,oy=vx;
  if((mx-cx)*ox+(my-cy)*oy<0){ox=-ox;oy=-oy;}
  let ext=0;all.forEach(q=>{ext=Math.max(ext,(q[0]-mx)*ox+(q[1]-my)*oy);});
  const OFF=ext+26;
  const s0=[p0[0]+ox*OFF,p0[1]+oy*OFF],s1=[p1[0]+ox*OFF,p1[1]+oy*OFF];
  const bx=[16,284],by=[16,150];
  const sx=Math.min(0,bx[1]-Math.max(s0[0],s1[0]))+Math.max(0,bx[0]-Math.min(s0[0],s1[0]));
  const sy=Math.min(0,by[1]-Math.max(s0[1],s1[1]))+Math.max(0,by[0]-Math.min(s0[1],s1[1]));
  s0[0]+=sx;s1[0]+=sx;s0[1]+=sy;s1[1]+=sy;
  const ux=(s1[0]-s0[0])/L,uy=(s1[1]-s0[1])/L;
  const hl=13,ha=Math.atan2(uy,ux);
  const tail=[s0[0]+ux*4,s0[1]+uy*4],tip=[s1[0]-ux*2,s1[1]-uy*2];
  const base=[tip[0]-hl*Math.cos(ha),tip[1]-hl*Math.sin(ha)];
  const w1=[base[0]-9*Math.cos(ha-Math.PI/2),base[1]-9*Math.sin(ha-Math.PI/2)];
  const w2=[base[0]+9*Math.cos(ha-Math.PI/2),base[1]+9*Math.sin(ha-Math.PI/2)];
  const col=color||'var(--cb)';
  return`<g transform="translate(${dx},0)" class="mvarrow" style="stroke:${col};fill:${col};color:${col}">`
    +`<path d="M${_f(tail[0])},${_f(tail[1])} L${_f(base[0])},${_f(base[1])}" fill="none"/>`
    +`<path d="M${_f(tip[0])},${_f(tip[1])} L${_f(w1[0])},${_f(w1[1])} L${_f(w2[0])},${_f(w2[1])} Z" stroke="none"/></g>`;
}

/* Poses : uniquement des angles. Vue de profil sauf mention 'front'. */
const POSE={
  pu:[{sp:194,aN:[90,90],aF:[93,87],lN:[8,8,68],lF:[10,10,70]},
      {sp:194,aN:[32,160],aF:[35,157],lN:[8,8,68],lF:[10,10,70]}],
  puk:[{sp:194,aN:[90,90],aF:[93,87],lN:[22,-18,-45],lF:[24,-16,-43]},
       {sp:194,aN:[32,160],aF:[35,157],lN:[22,-18,-45],lF:[24,-16,-43]}],
  pike:[{sp:152,aN:[90,90],aF:[93,87],lN:[60,60,72],lF:[62,62,74]},
        {sp:152,aN:[36,158],aF:[39,155],lN:[60,60,72],lF:[62,62,74]}],
  plank:[{sp:194,aN:[104,177],aF:[107,175],lN:[8,8,68],lF:[10,10,70]}],
  splank:[{sp:200,aN:[104,177],aF:[-70,-70],lN:[10,10,68],lF:[13,13,70]}],
  crunch:[{sp:181,aN:[226,158],aF:[229,161],lN:[308,62,-22],lF:[311,65,-20]},
          {sp:210,aN:[236,166],aF:[239,169],lN:[308,62,-22],lF:[311,65,-20]}],
  bicycle:[{sp:188,aN:[236,150],aF:[232,146],lN:[296,62,-26],lF:[6,6,-44]},
           {sp:188,aN:[232,146],aF:[236,150],lN:[292,58,-28],lF:[10,10,-40],hd:196}],
  legraise:[{sp:180,aN:[14,14],aF:[17,17],lN:[2,2,-58],lF:[4,4,-56]},
            {sp:180,aN:[14,14],aF:[17,17],lN:[-78,-78,-10],lF:[-76,-76,-8]}],
  hollow:[{sp:202,aN:[238,238],aF:[241,241],lN:[-26,-26,-18],lF:[-24,-24,-16]}],
  glute:[{sp:181,aN:[6,6],aF:[9,9],lN:[306,64,-22],lF:[309,67,-20]},
         {sp:157,aN:[2,2],aF:[5,5],lN:[16,86,-24],lF:[19,89,-22]}],
  superman:[{sp:186,aN:[176,176],aF:[179,179],lN:[6,6,58],lF:[8,8,60]},
            {sp:192,aN:[202,202],aF:[205,205],lN:[-16,-16,-40],lF:[-14,-14,-38]}],
  russian:[{sp:250,aN:[300,344],aF:[303,347],lN:[198,116,170],lF:[201,119,172]},
           {sp:250,aN:[236,196],aF:[239,199],lN:[198,116,170],lF:[201,119,172]}],
  mountain:[{sp:194,aN:[90,90],aF:[93,87],lN:[148,58,148],lF:[10,10,70]},
            {sp:194,aN:[90,90],aF:[93,87],lN:[10,10,70],lF:[148,58,148]}],
  burpee:[{v:'front',sp:-90,aN:[74,77],aF:[106,103],lN:[86,89,12],lF:[94,91,168]},
          {sp:194,aN:[90,90],aF:[93,87],lN:[8,8,68],lF:[10,10,70]},
          {v:'front',sp:-90,aN:[-58,-52],aF:[238,232],lN:[78,84,20],lF:[102,96,160],lift:24}],
  inchworm:[{sp:148,aN:[92,92],aF:[95,89],lN:[86,88,4],lF:[88,90,6]},
            {sp:170,aN:[92,110],aF:[95,113],lN:[64,74,26],lF:[66,76,28]},
            {sp:194,aN:[90,90],aF:[93,87],lN:[8,8,68],lF:[10,10,70]}],
  abwheel:[{sp:206,aN:[152,152],aF:[155,155],lN:[28,-24,-48],lF:[30,-22,-46],acc:'wheel',ac:'#a78bfa'},
           {sp:190,aN:[178,178],aF:[181,181],lN:[24,-22,-44],lF:[26,-20,-42],acc:'wheel',ac:'#a78bfa'}],
  bands:[{v:'front',sp:-90,aN:[6,177],aF:[174,3],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'},
         {v:'front',sp:-90,aN:[-6,-6],aF:[186,186],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'}],
  bandrow:[{v:'front',sp:-90,aN:[100,100],aF:[80,80],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'},
           {v:'front',sp:-90,aN:[-20,120],aF:[200,60],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'}],
  bandfp:[{v:'front',sp:-90,aN:[8,6],aF:[172,174],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'},
          {v:'front',sp:-90,aN:[-10,-90],aF:[190,270],lN:[84,88,12],lF:[96,92,168],acc:'band',ac:'#fb7185'}],
  jumprope:[{v:'front',sp:-90,aN:[52,28],aF:[128,152],lN:[84,88,12],lF:[96,92,168],acc:'rope',ac:'#fbbf24'},
            {v:'front',sp:-90,aN:[52,28],aF:[128,152],lN:[80,86,30],lF:[100,94,150],lift:20,acc:'ropeUp',ac:'#fbbf24'}],
  squat:[{sp:-90,aN:[101,106],aF:[83,79],lN:[88,90,4],lF:[92,90,172]},
         {sp:-114,aN:[176,176],aF:[179,179],lN:[184,74,176],lF:[187,77,178]}],
  lunge:[{sp:-90,aN:[101,106],aF:[83,79],lN:[88,90,4],lF:[92,90,172]},
         {sp:-92,aN:[100,96],aF:[103,93],lN:[168,80,176],lF:[22,112,58]}],
  wallsit:[{sp:-90,aN:[178,178],aF:[181,181],lN:[182,80,176],lF:[185,83,178]}],
  calf:[{sp:-90,aN:[101,106],aF:[83,79],lN:[88,90,4],lF:[92,90,172]},
        {sp:-90,aN:[101,106],aF:[83,79],lN:[88,88,-48],lF:[90,88,-46]}],
  jumpsquat:[{sp:-114,aN:[176,176],aF:[179,179],lN:[184,74,176],lF:[187,77,178]},
             {v:'front',sp:-90,aN:[-62,-56],aF:[242,236],lN:[80,85,24],lF:[100,95,156],lift:26},
             {sp:-106,aN:[168,168],aF:[171,171],lN:[178,72,176],lF:[181,75,178]}],
  bike:[{sp:-108,aN:[186,182],aF:[189,185],lN:[150,64,150],lF:[24,104,20],lift:34,acc:'bike',ac:'#5ee7ff'},
        {sp:-108,aN:[186,182],aF:[189,185],lN:[24,104,20],lF:[150,64,150],lift:34,acc:'bike',ac:'#5ee7ff'}],
  ellip:[{sp:-93,aN:[166,164],aF:[14,18],lN:[132,90,174],lF:[46,96,26],acc:'ellip',ac:'#a78bfa'},
         {sp:-93,aN:[14,18],aF:[166,164],lN:[46,96,26],lF:[132,90,174],acc:'ellip',ac:'#a78bfa'}],
  tread:[{sp:-97,aN:[-34,52],aF:[146,112],lN:[126,84,170],lF:[50,94,40],acc:'tread',ac:'#34d399'},
         {sp:-97,aN:[146,112],aF:[-34,52],lN:[50,94,40],lF:[126,84,170],acc:'tread',ac:'#34d399'}]
};
function polyPts(a){let s='';for(let i=0;i<a.length;i+=2)s+=(i?' ':'')+a[i]+','+a[i+1];return s;}

const HOLD={plank:1,splank:1,hollow:1,wallsit:1};
function animSVG(key,zone,color){
  const fr=POSE[key];if(!fr)return'';
  const hold=!!HOLD[key],n=hold?1:fr.length,W=300,H=200;
  const lbl=hold?['POSITION À TENIR']:(n>=3?['DÉPART','MILIEU','ARRIVÉE']:['DÉPART','ARRIVÉE']);
  let body='';
  for(let i=0;i<n;i++){
    const dx=i*W;
    body+=`<line class="floor" x1="${dx+22}" y1="161" x2="${dx+278}" y2="161"/>`;
    if(key==='wallsit'){const W2=buildPose(fr[i]),wx=Math.max(W2.sh[0],W2.hip[0])+17;
      body+=`<line class="floor" x1="${_f(dx+wx)}" y1="30" x2="${_f(dx+wx)}" y2="161"/>`;}
    if(!hold&&i>0&&!fr[i-1].lift&&!fr[i].lift&&poseTravel(fr[i-1],fr[i])>26)
      body+=ghostSVG(fr[i-1],dx);
    body+=poseCel(fr[i],dx);
    body+=muscleGlow(fr[i],dx,zone,color);
    if(!hold&&i>0)body+=moveArrow(fr[i-1],fr[i],dx,color);
    if(hold&&key!=='wallsit'){
      const P=buildPose(fr[i]),a=P.head,b=P.legN[2];
      const ex=(b[0]-a[0])*0.1,ey=(b[1]-a[1])*0.1;
      body+=`<line class="gline" x1="${_f(dx+a[0]-ex)}" y1="${_f(a[1]-ey)}" x2="${_f(dx+b[0]+ex)}" y2="${_f(b[1]+ey)}"/>`;
      body+=`<text class="glbl" x="${dx+W/2}" y="${hold?56:30}" text-anchor="middle">— une seule ligne —</text>`;
    }
    body+=`<text class="figlbl" x="${dx+W/2}" y="190" text-anchor="middle">${lbl[i]||('ÉTAPE '+(i+1))}</text>`;
    if(i<n-1)body+=`<path class="figarrow" d="M${dx+W-14},96 l28,0 m-10,-10 l10,10 l-10,10"/>`;
  }
  return`<svg viewBox="0 ${hold?38:0} ${n*W} ${hold?H-38:H}" role="img">${body}</svg>`;
}

/* ════════ PLANCHE PUSH-UP : SCHÉMA + SURBRILLANCE ════════ */
const BCOL={y:'#fbbf24',w:'#dbeafe',b:'#5ee7ff',o:'#ff8a3d'};
const BLBL={y:'Jaune — Pectoraux',w:'Blanc — Épaules',b:'Bleu — Dos / arrière',o:'Orange — Triceps'};
const B_CX=190,B_CY=110,B_R=60;
const B_COLX={y:120,b:260};
const B_COLY=[50,110,170];
const B_ARCA={w:[-145,-35],o:[35,145]};
const bpol=(deg,r)=>{const a=deg*Math.PI/180;return[B_CX+r*Math.cos(a),B_CY+r*Math.sin(a)];};
const bGroup=c=>(c==='y'||c==='b')?B_COLY.map(y=>[B_COLX[c],y]):B_ARCA[c].map(a=>bpol(a,B_R));
const BPOS={y1:{c:'y',i:[0,1]},y2:{c:'y',i:[1,2]},b1:{c:'b',i:[0,1]},b2:{c:'b',i:[1,2]},w1:{c:'w',i:[0,1]},o1:{c:'o',i:[0,1]}};
const bpair=k=>{const p=BPOS[k],g=bGroup(p.c);return[g[p.i[0]],g[p.i[1]]];};
function boardPanel(pos){
  const zone=pos?BPOS[pos].c:null;
  const bandOp=c=>!zone?'.6':(zone===c?'.88':'.2');
  let o='';
  ['y','b'].forEach(c=>{o+=`<line x1="${B_COLX[c]}" y1="${B_COLY[0]}" x2="${B_COLX[c]}" y2="${B_COLY[2]}" stroke="${BCOL[c]}" stroke-width="19" stroke-linecap="round" opacity="${bandOp(c)}"/>`;});
  ['w','o'].forEach(c=>{const[[x1,y1],[x2,y2]]=B_ARCA[c].map(a=>bpol(a,B_R));o+=`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${B_R},${B_R} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${BCOL[c]}" stroke-width="19" stroke-linecap="round" opacity="${bandOp(c)}"/>`;});
  o+=`<circle cx="${B_CX}" cy="${B_CY}" r="${B_R}" fill="#0b0d14" stroke="#000" stroke-width="3"/>`;
  o+=[[180,BCOL.y],[0,BCOL.b],[-150,BCOL.w],[-30,BCOL.w],[120,BCOL.y],[60,BCOL.y]]
     .map(([a,c])=>{const[x,y]=bpol(a,46);return`<line x1="${B_CX}" y1="${B_CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;}).join('');
  o+=`<circle cx="${B_CX}" cy="${B_CY}" r="9" fill="#191c2b" stroke="#000" stroke-width="2"/>`;
  const active=pos?new Set(BPOS[pos].i):null;
  ['y','b','w','o'].forEach(c=>{
    const sameZone=zone&&c===zone;
    bGroup(c).forEach(([x,y],i)=>{
      const isActive=sameZone&&active.has(i);
      const dim=pos&&!sameZone?'.3':'1';
      if(!isActive)o+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="#12141d" stroke="#000" stroke-width="2.5" opacity="${dim}"/>`;
      if(sameZone&&!isActive)o+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="none" stroke="${BCOL[zone]}" stroke-width="2.5" opacity=".5"/>`;
    });
  });
  if(pos){
    const[[x1,y1],[x2,y2]]=bpair(pos),col=BCOL[zone];
    o+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>`;
    [[x1,y1],[x2,y2]].forEach(([x,y])=>{
      o+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="${col}"/>`;
      o+=`<circle class="bd-hi" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="none" stroke="${col}" stroke-width="4"/>`;
    });
  }
  return o;
}
function boardSVG(pos){
  const panel=boardPanel(pos);
  return`<svg viewBox="0 0 620 220">
<rect x="6" y="14" width="608" height="192" rx="46" fill="#14161f" stroke="#000" stroke-width="3"/>
<ellipse cx="38" cy="110" rx="13" ry="38" fill="var(--bg2)" stroke="#000" stroke-width="2"/>
<ellipse cx="582" cy="110" rx="13" ry="38" fill="var(--bg2)" stroke="#000" stroke-width="2"/>
<g>${panel}</g><g transform="translate(620,0) scale(-1,1)">${panel}</g>
<line x1="310" y1="16" x2="310" y2="204" stroke="#000" stroke-width="4"/>
<rect x="301" y="46" width="18" height="46" rx="6" fill="#0b0d14" stroke="#000" stroke-width="2"/>
<rect x="301" y="128" width="18" height="46" rx="6" fill="#0b0d14" stroke="#000" stroke-width="2"/></svg>`;
}
function boardBlock(b){
  if(!b)return'';
  const zone=BPOS[b.p].c;
  const legend=['y','w','b','o'].map(c=>`<span class="blg ${zone===c?'on':''}" style="${zone===c?'color:'+BCOL[c]:''}"><i style="background:${BCOL[c]}"></i>${BLBL[c]}</span>`).join('');
  return`<div class="demo-sec"><div class="demo-t">🏋️ Position des poignées sur la planche</div>
  <div class="board-wrap">${boardSVG(b.p)}<div class="board-note" style="border-color:${BCOL[zone]}"><span style="color:${BCOL[zone]}">●</span> ${b.note}</div><div class="board-legend">${legend}</div></div></div>`;
}
