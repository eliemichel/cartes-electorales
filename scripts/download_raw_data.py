from pathlib import Path
from urllib.request import urlretrieve

#---------------------------------------------

# (url, local file)
sources = [
    (
        # Résultats par bureau de vote
        "https://www.data.gouv.fr/fr/datasets/r/6813fb28-7ec0-42ff-a528-2bc3d82d7dcd",
        "resultats-provisoires-par-bureau-de-votevmn.csv",
    ),
    (
        # Contours
        "https://www.data.gouv.fr/fr/datasets/r/f98165a7-7c37-4705-a181-bcfc943edc73",
        "contours-france-entiere-latest-v2.geojson",
    ),
]

#---------------------------------------------

def main():
    for url, local_file in sources:
        downloadDataset(url, local_file)

#---------------------------------------------

RAW_DATA_ROOT = Path(__file__).parent.parent.joinpath("data", "raw")

def downloadDataset(url, local_file):
    target_path = RAW_DATA_ROOT.joinpath(local_file)
    if not target_path.exists():
        print(f"Downloading '{url}' to '{target_path}'...")
        urlretrieve(url, target_path)

#---------------------------------------------

if __name__ == '__main__':
    main()

