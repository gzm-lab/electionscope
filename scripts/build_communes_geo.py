#!/usr/bin/env python3
"""
Télécharge le GeoJSON communes IGN (AdminExpress COG 2024)
et produit un TopoJSON par département dans public/data/geo/communes_dept_XX.topojson
"""

import json
import os
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from collections import defaultdict

OUT_DIR = os.path.join(os.path.dirname(__file__), "../public/data/geo")
os.makedirs(OUT_DIR, exist_ok=True)

# Source : découpage administratif simplifié par opendatafrance / etalab
# communes-100m.geojson = communes simplifiées à 100m de tolérance (~25 MB)
COMMUNES_URL = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-version-simplifiee.geojson"

COMMUNES_LOCAL = "/tmp/communes-france.geojson"

def download_communes():
    if os.path.exists(COMMUNES_LOCAL):
        print(f"  → Déjà téléchargé : {COMMUNES_LOCAL}")
        return
    print(f"  → Téléchargement communes GeoJSON...")
    urllib.request.urlretrieve(COMMUNES_URL, COMMUNES_LOCAL)
    size = os.path.getsize(COMMUNES_LOCAL) / 1024 / 1024
    print(f"  → Téléchargé : {size:.1f} MB")

def load_geojson(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_dept_code(commune_code):
    """Extrait le code département depuis le code INSEE commune (5 chars)"""
    if commune_code.startswith("97"):
        return commune_code[:3]  # DOM : 971, 972, ...
    return commune_code[:2]

def split_by_dept(geojson):
    """Sépare les features par département"""
    by_dept = defaultdict(list)
    for feature in geojson["features"]:
        code = feature["properties"].get("code") or feature["properties"].get("INSEE_COM") or ""
        if not code:
            continue
        dept = get_dept_code(code)
        # Normalise les propriétés
        feature["properties"] = {
            "code": code,
            "nom": feature["properties"].get("nom") or feature["properties"].get("NOM_COM") or "",
        }
        by_dept[dept].append(feature)
    return by_dept

GEO2TOPO  = "/home/ubuntu/.hermes/node/bin/geo2topo"
TOPOSIMPLIFY = "/home/ubuntu/.hermes/node/bin/toposimplify"

def write_topojson(dept, features):
    """Écrit un TopoJSON pour un département donné"""
    out_path = os.path.join(OUT_DIR, f"communes_dept_{dept}.topojson")

    # Déjà généré ?
    if os.path.exists(out_path):
        return False

    # Écrire GeoJSON temporaire
    tmp_geojson = f"/tmp/communes_dept_{dept}.geojson"
    with open(tmp_geojson, "w") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f)

    # Convertir en TopoJSON avec geo2topo
    result = subprocess.run(
        [GEO2TOPO, f"communes={tmp_geojson}", "-o", out_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ✗ Dept {dept}: {result.stderr}")
        return False

    # Simplifier avec toposimplify (préserve la topologie)
    simplified = out_path.replace(".topojson", "_tmp.topojson")
    result2 = subprocess.run(
        [TOPOSIMPLIFY, "-P", "0.01", "-f", out_path, "-o", simplified],
        capture_output=True, text=True
    )
    if result2.returncode == 0:
        os.replace(simplified, out_path)

    os.unlink(tmp_geojson)
    size_kb = os.path.getsize(out_path) / 1024
    return size_kb

def main():
    print("=== Build TopoJSON communes par département ===\n")

    print("1. Téléchargement GeoJSON communes...")
    download_communes()

    print("\n2. Chargement et parsing...")
    gj = load_geojson(COMMUNES_LOCAL)
    total = len(gj["features"])
    print(f"  → {total} communes chargées")

    print("\n3. Découpage par département...")
    by_dept = split_by_dept(gj)
    depts = sorted(by_dept.keys())
    print(f"  → {len(depts)} départements détectés")

    print("\n4. Génération des TopoJSON...")
    generated = 0
    skipped = 0
    errors = 0
    total_kb = 0

    for dept in depts:
        features = by_dept[dept]
        result = write_topojson(dept, features)
        if result is False:
            # Vérifie si c'était un skip (fichier existant)
            out_path = os.path.join(OUT_DIR, f"communes_dept_{dept}.topojson")
            if os.path.exists(out_path):
                skipped += 1
                print(f"  ↷ Dept {dept}: déjà présent ({len(features)} communes)")
            else:
                errors += 1
                print(f"  ✗ Dept {dept}: erreur")
        else:
            generated += 1
            total_kb += result
            print(f"  ✓ Dept {dept}: {len(features)} communes → {result:.0f} KB")

    print(f"\n=== Résumé ===")
    print(f"  Générés : {generated}")
    print(f"  Déjà présents : {skipped}")
    print(f"  Erreurs : {errors}")
    print(f"  Total taille : {total_kb/1024:.1f} MB")
    print(f"  Sortie : {OUT_DIR}/")

    # Générer un index JSON des départements disponibles
    index = sorted([
        f.replace("communes_dept_", "").replace(".topojson", "")
        for f in os.listdir(OUT_DIR)
        if f.endswith(".topojson")
    ])
    index_path = os.path.join(OUT_DIR, "index.json")
    with open(index_path, "w") as f:
        json.dump({"depts": index}, f)
    print(f"  Index : {index_path} ({len(index)} depts)")

if __name__ == "__main__":
    main()
