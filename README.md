Carte électorale
================

*Expérimentations autour des résultats des législatives 2024.*

Légende
-------

*Voici les détails du code couleur utilisé par la carte. Les codes de nuance politiques correspondent à ceux qui sont listés par [le ministère de l'intérieur](https://www.legifrance.gouv.fr/circulaire/id/45565?origin=list).*

Sont considérés comme **extrême gauche** (rouge):

```
EXG (Divers extrême gauche ; Lutte ouvrière, Nouveau parti anticapitaliste, Parti ouvrier indépendant)
```

Sont considérés comme **gauche** (rose):

```
COM (Parti communiste français)
FI (La France insoumise)
SOC (Parti socialiste)
RDG (Parti radical de gauche)
VEC (Les Écologistes)
DVG (Divers gauche)
UG (Union de la gauche ; candidat.e.s soutenu.e.s par plusieurs partis)
```

Sont considérés comme **centre** (violet):

```
REN (Renaissance)
MDM (Modem)
HOR (Horizons)
ENS (Ensemble)
DVC (Divers centre)
UDI (Union des démocrates et indépendants)
```

Sont considérés comme **droite** (violet):

```
LR (Les Républicains)
DVD (Divers droite)
```

Sont considérés comme **extrême droite** (violet):

```
DSV (Divers souverainiste)
RN (Rassemblement national)
REC (Reconquête)
UXD (Union de l'extrême droite)
EXD (Divers extrême droite)
```

Sont considérés comme **autre** (gris):

```
ECO (Divers écologistes)
REG (Régionalistes)
DIV (Divers)
```

Préparation des données
-----------------------

On collecte pour chaque bureau de vote des **grandeurs** et des **identités**. Les grandeurs sont les données collectées que l'on veut afficher et regrouper:

 - Nombre d'inscrits.
 - Nombre de votants.
 - Nombre de voix groupées par extrême gauche, gauche, centre, droite, extrême droite, autre.
 - Nombre de blanc/nul.

Les identités permettent de regrouper les données par géographies voisines:

 - Numéro du bureau de vote
 - Nom/Code de la commune
 - Nom/Code de la circonscription
 - Nom/Code du département
