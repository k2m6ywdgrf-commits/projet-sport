# Photos du coach — départ / arrivée

Ce dossier reçoit **deux images par exercice** : la position de départ et la
position d'arrivée. Dès qu'une paire est déposée et déclarée, la fiche du
mouvement l'affiche à la place du schéma, avec un bouton pour revenir au schéma.

Tant qu'un exercice n'a pas ses photos, il garde son schéma vectoriel — qui
reste la seule source couvrant les 31 exercices, hors ligne et sans téléchargement.

## Déclarer une paire

1. Déposer les deux fichiers ici (`.webp` de préférence, sinon `.png`).
2. Les enregistrer dans `index.html`, objet `PHOTO` :

```js
const PHOTO={
  mat_squat: {s:'squat_depart.webp', e:'squat_arrivee.webp'},
  board_standard: {s:'pompe_depart.webp', e:'pompe_arrivee.webp'},
};
```

Si un fichier est absent ou illisible, la paire est retirée automatiquement et
la fiche retombe sur le schéma. Aucun trou possible dans l'affichage.

## Générer les images

Les rendus doivent montrer **le même personnage** d'une image à l'autre, sinon
l'app ressemble à un catalogue de mannequins différents. C'est le point
difficile : les générateurs d'images dérivent d'une image à l'autre.

**Méthode qui marche le mieux :** fournir l'image de référence en entrée
(*image de référence* / *character reference* / *img2img* selon l'outil) pour
chaque génération, et ne changer que la description de la pose.

### Description du personnage (à garder identique à chaque fois)

> Mannequin 3D masculin, musclé, peau blanc cassé lisse et mate. Tête chauve
> entièrement lisse, **sans visage**. Tee-shirt de sport bleu marine à manches
> raglan courtes, avec « COACH » écrit en lettres bâton gris clair sur la
> poitrine. Short de sport gris moyen, avec un cuissard de compression gris
> foncé dépassant sous l'ourlet. Manchons de compression gris aux mollets.
> Chaussures de running bleu marine à semelle blanche. Rendu 3D photoréaliste,
> éclairage doux venant du haut, ombre portée au sol discrète.

### Description de la pose (à changer)

Ajouter à la suite, par exemple :

- départ squat → *« debout, pieds largeur d'épaules, bras tendus devant à hauteur d'épaules, vu de profil »*
- arrivée squat → *« en squat profond, cuisses parallèles au sol, buste incliné vers l'avant, bras tendus devant, vu de profil »*

### Cadrage

- **Vue de profil** pour tout ce qui se juge sur la profondeur ou l'alignement :
  squats, fentes, pompes, planches, gainages, crunchs, chaise.
- **Vue de face** pour ce qui se juge sur la symétrie : écartés élastique,
  corde à sauter, jumping jacks, sauts.
- Personnage entier, centré, même distance de caméra d'une image à l'autre —
  sinon il change de taille entre départ et arrivée.

### Format

- **Fond transparent** de préférence (PNG ou WebP). Un fond bleu marine passera
  bien en thème sombre mais fera une tache en thème jour.
- Format portrait, ~800 × 1000 px suffit largement.
- Compresser en WebP qualité ~80 : viser < 80 Ko par image. À 62 images,
  ça reste sous 5 Mo au total.

## Les 31 exercices

| Clé | Vue | Départ | Arrivée |
|---|---|---|---|
| `board_pecs` | profil | planche haute, mains très écartées | poitrine près du sol, coudes à 45° |
| `board_standard` | profil | planche haute, mains largeur d'épaules | poitrine près du sol |
| `board_shoulders` | profil | bassin haut en V inversé | sommet du crâne près du sol |
| `board_triceps` | profil | planche haute, mains serrées | descente, coudes le long du corps |
| `archer` | profil | planche haute, bras très écartés | poids sur un bras, l'autre tendu |
| `pike` | profil | V inversé, jambes tendues | tête près du sol entre les mains |
| `pseudo` | profil | mains au niveau des hanches, buste penché | descente contrôlée |
| `diamond` | profil | mains en losange | poitrine vers les mains |
| `ab_wheel` | profil | à genoux, roue près des genoux | corps déroulé, bras tendus devant |
| `jump_rope` | face | debout, corde derrière les talons | en l'air, corde au-dessus de la tête |
| `bands` | face | bras tendus devant, élastique tendu | bras écartés en croix |
| `mat_plank` | profil | gainage sur avant-bras (une seule image suffit) | — |
| `mat_splank` | profil | gainage latéral (une seule image) | — |
| `mat_mountain` | profil | planche haute | un genou ramené sous la poitrine |
| `mat_burpee` | face/profil | debout | en planche, puis saut bras levés |
| `mat_crunch` | profil | allongé sur le dos, genoux fléchis | épaules décollées |
| `mat_bicycle` | profil | dos au sol, un genou ramené | jambes inversées |
| `mat_legraise` | profil | jambes tendues au sol | jambes à la verticale |
| `mat_superman` | profil | à plat ventre | bras et jambes décollés |
| `mat_glute` | profil | dos au sol, genoux fléchis | bassin levé, corps aligné |
| `mat_russian` | profil | assis, buste incliné en arrière | rotation du buste sur le côté |
| `mat_hollow` | profil | position banane tenue (une seule image) | — |
| `mat_inchworm` | profil | debout penché, mains au sol | planche haute |
| `mat_squat` | profil | debout, bras devant | squat profond |
| `mat_lunge` | profil | debout | fente, deux genoux à 90° |
| `mat_wallsit` | profil | chaise contre un mur (une seule image) | — |
| `mat_calf` | profil | debout à plat | sur la pointe des pieds |
| `mat_jumpsquat` | profil/face | squat bas | en l'air, bras levés |
| `mac_bike` | profil | assis sur un vélo d'appartement | pédale opposée en bas |
| `mac_elliptical` | profil | debout sur un elliptique, foulée avant | foulée inverse |
| `mac_treadmill` | profil | course sur tapis, appui avant | appui inverse |

Pour les quatre gainages tenus (`mat_plank`, `mat_splank`, `mat_hollow`,
`mat_wallsit`), une seule image suffit : déclarer uniquement `s`, sans `e`.
