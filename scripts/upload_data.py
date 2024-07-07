"""
This script automates the upload of tileset data to MapBox tileset server
See https://docs.mapbox.com/help/tutorials/get-started-mts-and-tilesets-cli/
"""

from pathlib import Path
import json
import os
from dataclasses import dataclass, field
from typing import List, Dict
from collections import defaultdict
import shutil
import shlex
import subprocess

#---------------------------------------------

DATA_ROOT = Path(__file__).parent.parent.joinpath("data")

DRY_RUN = True
USERNAME = "eliemichel"
TILESET_SOURCE_NAME = "legislative-2024-tour-1"
TILESET_DATA_FILE = DATA_ROOT.joinpath("contours_avec_resultats.geojson")
TILESET_LAYER_IDENT = "premier_candidat"
TILESET_LAYER_NAME = "premier candidat"

#---------------------------------------------

def main():
    if shutil.which("tilesets") is None:
        print("You must activate your virtualenv and/or install dependencies with pip install -r requirements.txt")
        return
    
    # Set access token
    secrets = loadJsonData(Path(__file__).parent.joinpath("secrets.json"))
    os.environ['MAPBOX_ACCESS_TOKEN'] = secrets["tileset_api_token"]

    # Upload
    runCmd(
        "tilesets",
        "upload-source",
        USERNAME,
        TILESET_SOURCE_NAME,
        str(TILESET_DATA_FILE)
    )

    # Create tileset
    runCmd(
        "tilesets",
        "create",
        f"{USERNAME}.{TILESET_LAYER_IDENT}",
        "--recipe", str(DATA_ROOT.joinpath("receipes", "legislative-2024-tour-1.json")),
        "--name", TILESET_LAYER_NAME,
    )

    # Publish
    runCmd(
        "tilesets",
        "publish",
        f"{USERNAME}.{TILESET_LAYER_IDENT}",
    )

#---------------------------------------------

def runCmd(*cmd):
    print(shlex.join(cmd))
    if not DRY_RUN:
        subprocess.run(cmd)

#---------------------------------------------

def loadJsonData(filename):
    with open(filename, encoding="utf-8") as f:
        return json.load(f)

#---------------------------------------------

if __name__ == '__main__':
    main()
