#!/usr/bin/env python3
"""
Construit public/data/socioeco_communes.json

Sources (toutes dans /tmp/socioeco_cache/) :
  filosofi.zip       → cc_filosofi_2020_COM.csv  → MED20/12=revenue, TP6020=poverty
  rp_emploi_2020.zip → base-cc-emploi-pop-active-2020_v2.CSV → P20_CHOM1564/C20_ACT1564=unemployment
  bpe2024.zip        → BPE24.csv → D265=medecins, D307=pharmacies, A504=fast_food
  pop_legale.zip     → donnees_communes.csv → PMUN=population
  rugby (téléchargé) → new_code=commune rugby

Résultat : { "75056": { revenue, poverty, unemployment, medecins_per_100k,
                        pharmacies_per_100k, fast_food_per_100k, rugby_clubs_per_100k } }
"""

import csv, io, json, os, urllib.request, zipfile
from collections import defaultdict

CACHE = "/tmp/socioeco_cache"
OUT   = "/home/ubuntu/electionscope/public/data/socioeco_communes.json"

def flt(v, default=None):
    if v is None: return default
    v = str(v).strip().replace(",", ".").replace(" ", "").replace("\xa0", "")
    if v in ("", "s", "nd", "na", "n.d.", "NS"): return default
    try: return float(v)
    except: return default

# ── 1. Population légale ─────────────────────────────────────────────────────
print("1. Population légale...")
pop = {}
arr_remap = {}  # code arrondissement → code commune parent
# Paris 75101-75120 → 75056, Marseille 13201-13216 → 13055, Lyon 69381-69389 → 69123
for i in range(1,21):  arr_remap[f"751{str(i).zfill(2)}"] = "75056"
for i in range(1,17):  arr_remap[f"132{str(i).zfill(2)}"] = "13055"
for i in range(81,90): arr_remap[f"693{str(i).zfill(2)}"] = "69123"

with zipfile.ZipFile(f"{CACHE}/pop_legale.zip") as z:
    with z.open("donnees_communes.csv") as f:
        for line in io.TextIOWrapper(f, encoding="latin-1", errors="replace"):
            cols = line.rstrip("\r\n").split(";")
            if len(cols) < 9 or cols[5] == "CODCOM": continue
            codcom = cols[6].strip()
            pmun   = cols[8].strip()
            try:
                p = int(pmun)
                # Fusionne arrondissements vers commune parent
                target = arr_remap.get(codcom, codcom)
                pop[target] = pop.get(target, 0) + p
            except: pass
print(f"   {len(pop)} communes")

# ── 2. Filosofi 2020 — revenue + poverty ─────────────────────────────────────
print("2. Filosofi 2020...")
filosofi = {}   # code → {revenue, poverty}
with zipfile.ZipFile(f"{CACHE}/filosofi.zip") as z:
    with z.open("cc_filosofi_2020_COM.csv") as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding="latin-1", errors="replace"), delimiter=";")
        for r in reader:
            code = r["CODGEO"].strip()
            med  = flt(r.get("MED20"))
            pauv = flt(r.get("TP6020"))
            filosofi[code] = {
                "revenue": round(med / 12, 0) if med is not None else None,
                "poverty": pauv
            }
ok = sum(1 for v in filosofi.values() if v["revenue"] is not None)
print(f"   {len(filosofi)} communes, {ok} avec revenu")

# ── 3. RP emploi 2020 — chômage ──────────────────────────────────────────────
print("3. RP emploi 2020 (chômage)...")
chomage = {}    # code → taux %
with zipfile.ZipFile(f"{CACHE}/rp_emploi_2020.zip") as z:
    with z.open("base-cc-emploi-pop-active-2020_v2.CSV") as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding="latin-1", errors="replace"), delimiter=";")
        for r in reader:
            code = r["CODGEO"].strip()
            act  = flt(r.get("C20_ACT1564"))    # actifs recensés
            chom = flt(r.get("P20_CHOM1564"))   # chômeurs estimés
            if act and act > 0 and chom is not None:
                chomage[code] = round(chom / act * 100, 1)
            else:
                chomage[code] = None
ok = sum(1 for v in chomage.values() if v is not None)
print(f"   {len(chomage)} communes, {ok} avec taux chômage")

# ── 4. BPE 2024 — medecins, pharmacies, fast_food ────────────────────────────
print("4. BPE 2024 (D265 médecins, D307 pharmacies, A504 fast-food)...")
bpe = defaultdict(lambda: {"D265": 0, "D307": 0, "A504": 0})
TARGET = {"D265", "D307", "A504"}

# Arrondissements → code commune parent
# Paris 75101-75120 → 75056 | Marseille 13201-13216 → 13055 | Lyon 69381-69389 → 69123
def arr_to_commune(code):
    if code[:5] in {f"751{str(i).zfill(2)}" for i in range(1,21)}: return "75056"
    if code[:5] in {f"132{str(i).zfill(2)}" for i in range(1,17)}: return "13055"
    if code[:5] in {f"693{str(i).zfill(2)}" for i in range(81,90)}: return "69123"
    return code

n_read = 0
with zipfile.ZipFile(f"{CACHE}/bpe2024.zip") as z:
    with z.open("BPE24.csv") as f:
        reader = csv.DictReader(io.TextIOWrapper(f, encoding="latin-1", errors="replace"), delimiter=";",
                                quotechar='"')
        for row in reader:
            typequ = row.get("TYPEQU", "").strip()
            if typequ not in TARGET: continue
            depcom = arr_to_commune(row.get("DEPCOM", "").strip())
            if depcom:
                bpe[depcom][typequ] += 1
            n_read += 1
print(f"   {n_read} équipements lus, {len(bpe)} communes avec au moins 1")

# ── 5. Rugby ─────────────────────────────────────────────────────────────────
print("5. Rugby...")
rugby_path = f"{CACHE}/rugby.csv"
rugby = defaultdict(int)
if os.path.exists(rugby_path):
    with open(rugby_path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            code = row.get("new_code", row.get("codecom", "")).strip()
            if code: rugby[code] += 1
    print(f"   {len(rugby)} communes avec équipement rugby (cache)")
else:
    print("   Téléchargement rugby...")
    url = "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/exports/csv?where=aps_name%20like%20%22rugby%22&limit=-1&delimiter=%3B"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ElectionScope/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(rugby_path, "wb") as f:
            f.write(data)
        reader = csv.DictReader(io.StringIO(data.decode("utf-8", errors="replace")), delimiter=";")
        for row in reader:
            code = row.get("new_code", row.get("codecom", "")).strip()
            if code: rugby[code] += 1
        print(f"   {len(rugby)} communes avec équipement rugby")
    except Exception as e:
        print(f"   ⚠ Rugby indisponible ({e}) — sera 0 partout")

# ── 6. Consolidation ─────────────────────────────────────────────────────────
print("6. Consolidation...")
result = {}
all_codes = set(pop.keys()) | set(filosofi.keys()) | set(chomage.keys())
print(f"   {len(all_codes)} codes communes au total")

for code in all_codes:
    p = pop.get(code, 0)
    f100k = (p / 100000) if p > 0 else None

    fil = filosofi.get(code, {})
    row = {
        "revenue":             fil.get("revenue"),
        "poverty":             fil.get("poverty"),
        "unemployment":        chomage.get(code),
        "medecins_per_100k":   round(bpe[code]["D265"] / f100k, 1) if f100k else 0,
        "pharmacies_per_100k": round(bpe[code]["D307"] / f100k, 1) if f100k else 0,
        "fast_food_per_100k":  round(bpe[code]["A504"] / f100k, 1) if f100k else 0,
        "rugby_clubs_per_100k": round(rugby.get(code, 0) / f100k, 1) if f100k else 0,
    }
    result[code] = row

# ── 7. Sauvegarde ─────────────────────────────────────────────────────────────
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, separators=(",", ":"))
sz = os.path.getsize(OUT) // 1024
print(f"\n✓ {OUT} — {len(result)} communes, {sz} KB")

# ── 8. Validation ─────────────────────────────────────────────────────────────
print("\nValidation:")
for code, label in [("75056","Paris"), ("13055","Marseille"), ("69123","Lyon"), ("01001","Abgt-Clémenciat")]:
    v = result.get(code, {})
    print(f"  {code} {label}: rev={v.get('revenue')} pov={v.get('poverty')} chom={v.get('unemployment')} med={v.get('medecins_per_100k')}")
