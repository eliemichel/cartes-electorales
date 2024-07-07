"""
This script is a bit messy, because it handles data that is a bit messy itself.
"""

from pathlib import Path
import json
import csv
from dataclasses import dataclass, field
from typing import List, Dict
from collections import defaultdict
from urllib.request import urlretrieve

#---------------------------------------------

def main():
    #return main_fix_bv_inconnus()
    # Pour aider au développement des étapes suivantes, on peut extraire un
    # sous-ensemble des bureaux de vote.
    contours_bureau_de_vote = loadBureauxDeVote(use_subset=False)

    # On traite les résultats pour en faire un json plus facile à indexer par
    # identifiant de bureau de vote plutôt qu'une longue liste.
    bvid_to_result, bvlabel_to_result = loadResultats()

    # Crée un nouveau GeoJSON qui contient les résultats pour chaque bureau.
    # Exporte aussi la liste des bureaux dont l'identifiant n'a pas été trouvé.
    (
        contours_avec_resultats,
        bv_inconnus,
    ) = consolidateResults(contours_bureau_de_vote, bvid_to_result, bvlabel_to_result)

    #f0 = contours_avec_resultats["features"][0]["properties"]
    #print(json.dumps(f0, indent=2))

    exportJsonData(contours_avec_resultats, "contours_avec_resultats.geojson")
    #exportJsonData({ "bv_inconnus": bv_inconnus }, "bv_inconnus.json")

#---------------------------------------------

def main_fix_bv_inconnus():
    bv_inconnus = loadJsonData("../bv_inconnus.json")["bv_inconnus"]
    resultats_bureau_de_vote = loadCsvData("resultats-provisoires-par-bureau-de-votevmn.csv")

    # Prepare database
    name_to_index = resultats_bureau_de_vote["column_name_to_index"]
    libelle_commune_idx = name_to_index['Libellé commune']
    libelle_departement_idx = name_to_index['Libellé département']
    code_bv_idx = name_to_index['Code BV']
    """
    for row_idx, row in enumerate(resultats_bureau_de_vote["data"]):
        pass
    """

    for bv in bv_inconnus:
        print(bv)
        target_departement = bv["nomDepartement"]
        target_circo = bv["nomCirconscription"]
        target_commune = bv["nomCommune"]
        target_bv_num = bv["numeroBureauVote"]

        fix_table = {
            "Béon": "Culoz-Béon",
        }
        target_commune = fix_table.get(target_commune, target_commune)

        trouvé = False
        all_communes = set()
        for row_idx, row in enumerate(resultats_bureau_de_vote["data"]):
            commune = row[libelle_commune_idx]
            departement = row[libelle_departement_idx]
            bv_num = row[code_bv_idx]
            if departement == target_departement:
                all_communes.add(commune)
                if commune == target_commune and bv_num == target_bv_num:
                    print(f"Trouvé ! {row}")
                    trouvé = True

        if not trouvé:
            print(f"Toutes les communes du département '{target_departement}' :")
            all_communes = sorted(all_communes)
            for c in all_communes:
                m = " (match !)" if c == target_commune else ""
                print(f" - {c}{m}")
            return
        else:
            print()

#---------------------------------------------

DATA_ROOT = Path(__file__).parent.parent.joinpath("data")

def loadJsonData(filename):
    with open(DATA_ROOT.joinpath("raw", filename), encoding="utf-8") as f:
        return json.load(f)

def exportJsonData(data, filename):
    with open(DATA_ROOT.joinpath(filename), "w", encoding="utf-8") as f:
        return json.dump(data, f)

def loadCsvData(filename):
    with open(DATA_ROOT.joinpath("raw", filename), encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=';', quotechar='"')
        it = iter(reader)

        column_index_to_name = next(it)
        column_name_to_index = {
            column_name: index
            for index, column_name in enumerate(column_index_to_name)
        }
        return {
            "column_index_to_name": column_index_to_name,
            "column_name_to_index": column_name_to_index,
            "data": list(it),
        }

#---------------------------------------------

def loadBureauxDeVote(use_subset = False):
    # Pour aider au développement des étapes suivantes, on peut extraire un
    # sous-ensemble des bureaux de vote.
    if use_subset:
        # Le sous-ensemble est mis en cache dans le fichier suivant pour éviter
        # de le recalculer à chaque fois:
        subset_filename = "contours-france-entiere-latest-v2-subset.geojson"
        if not DATA_ROOT.joinpath(subset_filename).exists():
            contours_bureau_de_vote = loadJsonData("contours-france-entiere-latest-v2.geojson")
            contours_bureau_de_vote_subset = extractCircoSubset(contours_bureau_de_vote)
            exportJsonData(contours_bureau_de_vote_subset, subset_filename)
            return contours_bureau_de_vote_subset
        else:
            return loadJsonData("../" + subset_filename)
    else:
        return loadJsonData("contours-france-entiere-latest-v2.geojson")

#---------------------------------------------

def loadResultats():
    # On traite les résultats pour en faire un json plus facile à indexer par
    # identifiant de bureau de vote plutôt qu'une longue liste.
    bvid_to_result_filename = "bvid_to_result.json"
    bvlabel_to_result_filename = "bvlabel_to_result.json"
    if not DATA_ROOT.joinpath(bvid_to_result_filename).exists() or not DATA_ROOT.joinpath(bvlabel_to_result_filename).exists():
        resultats_bureau_de_vote = loadCsvData("resultats-provisoires-par-bureau-de-votevmn.csv")
        bvid_to_result, bvlabel_to_result = buildBvidToResults(resultats_bureau_de_vote)
        exportJsonData(bvid_to_result, bvid_to_result_filename)
        exportJsonData(bvlabel_to_result, bvlabel_to_result_filename)
    else:
        bvid_to_result = loadJsonData("../" + bvid_to_result_filename)
        bvlabel_to_result = loadJsonData("../" + bvlabel_to_result_filename)
    return bvid_to_result, bvlabel_to_result

#---------------------------------------------

def extractCircoSubset(geojson, max_item_count = 1000):
    return {
        "type": geojson["type"],
        "features": geojson["features"][:max_item_count],
    }

#---------------------------------------------

def buildBvidToResults(resultats_bureau_de_vote):
    name_to_index = resultats_bureau_de_vote["column_name_to_index"]
    code_commune_idx = name_to_index['Code commune']
    code_bv_idx = name_to_index['Code BV']

    libelle_commune_idx = name_to_index['Libellé commune']
    libelle_departement_idx = name_to_index['Libellé département']

    inscrits_idx = name_to_index["Inscrits"]
    votants_idx = name_to_index["Votants"]
    blancs_idx = name_to_index["Blancs"]
    nuls_idx = name_to_index["Nuls"]

    nuance_idx_offset = name_to_index['Nuance candidat 1']
    nom_idx_offset = name_to_index['Nom candidat 1']
    prenom_idx_offset = name_to_index['Prénom candidat 1']
    voix_idx_offset = name_to_index['Voix 1']
    pourcentage_idx_offset = name_to_index['% Voix/inscrits 1']
    idx_stride = name_to_index['Nuance candidat 2'] - nuance_idx_offset

    bvid_to_result = {}
    bvlabel_to_result = {}
    for row_idx, row in enumerate(resultats_bureau_de_vote["data"]):
        # transform into json
        scores = []
        for i in range(19):
            nuance = row[nuance_idx_offset + i * idx_stride]
            nom = row[nom_idx_offset + i * idx_stride]
            prenom = row[prenom_idx_offset + i * idx_stride]
            voix = row[voix_idx_offset + i * idx_stride]
            pourcentage = row[pourcentage_idx_offset + i * idx_stride]
            if voix == '':
                break
            scores.append({
                "nuance": nuance,
                "nom": nom,
                "prenom": prenom,
                "voix": int(voix),
                "pourcentage": pourcentage,
            })
        scores.sort(key = lambda x: -x["voix"])

        results = {
            "inscrits": row[inscrits_idx],
            "votants": row[votants_idx],
            "blancs": row[blancs_idx],
            "nuls": row[nuls_idx],
            "scores": scores,
        }

        # Store in LUT
        code_commune = row[code_commune_idx]
        code_bv = row[code_bv_idx]
        bvid = f"{code_commune}_{code_bv}"
        bvid_to_result[bvid] = results

        # Back-up
        libelle_commune = row[libelle_commune_idx]
        libelle_departement = row[libelle_departement_idx]
        bvlabel = f"{libelle_departement.lower()}_{libelle_commune.lower()}_{code_bv}"
        bvlabel_to_result[bvlabel] = results

    return bvid_to_result, bvlabel_to_result

#---------------------------------------------

nuance_to_color = {
    "extreme_droite": "#240688",
    "droite": "#0644df",
    "centre": "#fbaf05",
    "gauche": "#f62e66",
    "extreme_gauche": "#c50000",
    "autre": "#808080",
}

normalize_nuance = {
    # Violet
    "EXD": "extreme_droite",
    "REC": "extreme_droite",
    "UXD": "extreme_droite",
    "RN": "extreme_droite",
    "DSV": "extreme_droite",

    # Bleu
    "LR": "droite",
    "DVD": "droite",

    # Jaune
    "REN": "centre",
    "MDM": "centre",
    "ENS": "centre",
    "HOR": "centre",
    "UDI": "centre",
    "DVC": "centre",

    # Rose
    "UG": "gauche",
    "DVG": "gauche",
    "SOC": "gauche",
    "FI": "gauche",
    "COM": "gauche",
    "VEC": "gauche",
    "RDG": "gauche",

    # Rouge
    "EXG": "extreme_gauche",

    # Autre
    "DIV": "autre",
    "REG": "gauche",
    "ECO": "gauche",
}

def consolidateResults(contours_bureau_de_vote, bvid_to_result, bvlabel_to_result):
    bv_inconnus = []

    def add_results(props):
        bvid = props["codeBureauVote"]
        result = bvid_to_result.get(bvid)
        if result is None:
            print(f"WARNING: Could not find Bureau de Vote with ID {bvid}")
            libelle_departement = props["nomDepartement"].lower()
            libelle_commune = props["nomCommune"].lower()
            code_bv = props["numeroBureauVote"]
            bvlabel = f"{libelle_departement}_{libelle_commune}_{code_bv}"
            result = bvlabel_to_result.get(bvlabel)
            if result is None:
                print(f"ERROR: Could not find Bureau de Vote with LABEL {bvlabel}")
                print(props)
                bv_inconnus.append(props.copy())
        if result is None:
            return props
        props = props.copy()
        première_nuance = result["scores"][0]["nuance"]
        if première_nuance not in normalize_nuance:
            print(result["scores"][0])
            print(f"Nuance '{première_nuance}' Not found")
        else:
            props["color"] = nuance_to_color[normalize_nuance[première_nuance]]
        #props["result"] = result

        props["scores"] = result["scores"]
        props["inscrits"] = int(result["inscrits"])
        props["votants"] = int(result["votants"])
        props["bulletins_blancs"] = int(result["blancs"])
        props["bulletins_nuls"] = int(result["nuls"])

        props["bulletins_extreme_gauche"] = 0
        props["bulletins_gauche"] = 0
        props["bulletins_centre"] = 0
        props["bulletins_droite"] = 0
        props["bulletins_extreme_droite"] = 0
        props["bulletins_autre"] = 0
        for entry in result["scores"]:
            nuance = entry["nuance"]
            if nuance not in normalize_nuance:
                print(entry)
                print(f"Nuance '{nuance}' Not found")
                continue
            normal_nuance = normalize_nuance[nuance]
            props["bulletins_" + normal_nuance] += int(entry["voix"])

        return props

    return (
        filterGeojsonProperties(contours_bureau_de_vote, add_results),
        bv_inconnus,
    )

#---------------------------------------------

def filterGeojsonProperties(geojson, filterProperties):
    return {
        "type": geojson["type"],
        "features": [
            {
                "type": entry["type"],
                "geometry": entry["geometry"],
                "properties": filterProperties(entry["properties"]),
            }
            for entry in geojson["features"]
        ],
    }

#---------------------------------------------

if __name__ == '__main__':
    main()
