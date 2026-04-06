#!/usr/bin/env python3
"""
Télécharge et transforme les résultats électoraux communes 2002-2022
depuis data.gouv.fr (Ministère de l'Intérieur)

Formats détectés :
  2022 : CSV ; wide, 1 ligne/commune, candidats en colonnes répétées (entête 26 cols)
  2017 : CSV ; wide, 1 ligne/bureau de vote, même structure (entête 28 cols)
  2012 : CSV ; tall, 1 ligne/candidat/bureau, PAS d'entête, cols fixes
  2007 : CSV ; tall, 1 ligne/candidat/bureau, PAS d'entête (16 lignes commentaires)
  2002 : CSV ; tall, 1 ligne/candidat/bureau, PAS d'entête (16 lignes commentaires)

Sortie : public/data/communes/YYYY-tN.json
Format : { "75056": { "MACRON Emmanuel": { "pct": 27.85, "voix": 1234 } } }
"""

import csv, io, json, os, urllib.request
from collections import defaultdict

OUT_DIR   = os.path.join(os.path.dirname(__file__), "../public/data/communes")
CACHE_DIR = "/tmp/elections_raw"
os.makedirs(OUT_DIR,   exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

SOURCES = {
    "2022-t1":    "https://static.data.gouv.fr/resources/election-presidentielle-des-10-et-24-avril-2022-resultats-definitifs-du-1er-tour/20220414-152459/resultats-par-niveau-subcom-t1-france-entiere.txt",
    "2022-t2":    "https://static.data.gouv.fr/resources/election-presidentielle-des-10-et-24-avril-2022-resultats-definitifs-du-2nd-tour/20220428-142333/resultats-par-niveau-subcom-t2-france-entiere.txt",
    "2017-t1":    "https://static.data.gouv.fr/resources/election-presidentielle-des-23-avril-et-7-mai-2017-resultats-definitifs-du-1er-tour-par-bureaux-de-vote/20170427-100955/PR17_BVot_T1_FE.txt",
    "2017-t2":    "https://static.data.gouv.fr/resources/election-presidentielle-des-23-avril-et-7-mai-2017-resultats-definitifs-du-2nd-tour-par-bureaux-de-vote/20170511-093541/PR17_BVot_T2_FE.txt",
    "2012-bvot":  "https://static.data.gouv.fr/resources/election-presidentielle-2012-resultats-par-bureaux-de-vote-1/20150925-102751/PR12_Bvot_T1T2.txt",
    "2007-bvot":  "https://static.data.gouv.fr/resources/election-presidentielle-2007-resultats-par-bureaux-de-vote/20151001-154056/PR07_Bvot_T1T2.txt",
    "2002-bvot":  "https://static.data.gouv.fr/resources/election-presidentielle-2002-resultats-par-bureaux-de-vote/20150925-110503/PR02_BVot_T1T2.txt",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def fetch_cached(key):
    path = os.path.join(CACHE_DIR, f"{key}.txt")
    if os.path.exists(path):
        print(f"    cache: {os.path.getsize(path)//1024} KB")
        with open(path,'rb') as f: return f.read()
    url = SOURCES[key]
    print(f"    GET {url[:80]}...")
    req = urllib.request.Request(url, headers={"User-Agent":"ElectionScope/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    with open(path,'wb') as f: f.write(data)
    print(f"    → {len(data)//1024} KB")
    return data

def decode(raw):
    for enc in ('latin-1','utf-8-sig','utf-8','cp1252'):
        try: return raw.decode(enc)
        except: pass
    return raw.decode('latin-1', errors='replace')

def norm_code(dept, com):
    """Construit le code INSEE 5 chars"""
    dept = dept.strip().upper()
    com  = com.strip().zfill(3)
    if dept.isdigit():
        dept = dept.zfill(2)
    return dept + com

def to_results(voix_map, exp_map):
    """Voix agrégées → résultats avec %"""
    out = {}
    for code, cands in voix_map.items():
        total = exp_map.get(code, 0)
        if total == 0:
            total = sum(cands.values()) or 1
        out[code] = {
            name: {"pct": round(v/total*100, 2), "voix": v}
            for name, v in cands.items() if v > 0
        }
    return out

def save(data, key):
    path = os.path.join(OUT_DIR, f"{key}.json")
    with open(path,'w',encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',',':'))
    sz = os.path.getsize(path)//1024
    # Validation
    ex = next(iter(data.items()))
    top = sorted(ex[1].items(), key=lambda x: -x[1]['pct'])[:2]
    print(f"  ✓ {key}: {len(data)} communes, {sz} KB | ex {ex[0]}: {[(n,v['pct']) for n,v in top]}")

# ─── Parser format WIDE (2022 + 2017) ─────────────────────────────────────────
# Entête N cols fixes + blocs répétés (N°Panneau;Sexe;Nom;Prénom;Voix;%/Ins;%/Exp)
# Une ligne = une commune (2022 subcom) ou un bureau de vote (2017)

WIDE_FIXED = 19   # cols fixes avant le 1er bloc candidat (2022)
WIDE_FIXED_17 = 21  # légèrement différent pour 2017 (2 cols supplément. circo)
CAND_BLOCK  = 7   # taille d'un bloc candidat

def parse_wide(raw, year):
    """Retourne dict[code] = {nom: {pct, voix}} — agrège par commune si nécessaire"""
    text  = decode(raw)
    lines = text.split('\n')
    header = lines[0].rstrip('\r').split(';')

    # Colonnes fixes clés
    def ci(names):
        for n in names:
            for i,c in enumerate(header):
                if n.lower() in c.lower(): return i
        return -1

    i_dept = ci(['code du département','codedpt'])
    i_com  = ci(['code de la commune','codecom'])
    i_exp  = ci(['exprimés','exprimes'])

    # Trouver le premier "Nom" dans l'entête → début des blocs
    i_first_nom = next((i for i,c in enumerate(header) if c.strip().lower()=='nom'), -1)
    if i_first_nom < 0:
        print(f"    ✗ col 'Nom' introuvable. header={header[:25]}")
        return {}

    print(f"    dept={i_dept} com={i_com} exp={i_exp} first_nom={i_first_nom}")

    voix_map = defaultdict(lambda: defaultdict(int))
    exp_map  = defaultdict(int)

    for line in lines[1:]:
        row = line.rstrip('\r').split(';')
        if len(row) < i_first_nom + 3:
            continue

        dept_v = row[i_dept].strip() if i_dept >= 0 and i_dept < len(row) else ''
        com_v  = row[i_com ].strip() if i_com  >= 0 and i_com  < len(row) else ''
        if not dept_v or not com_v:
            continue
        code = norm_code(dept_v, com_v)

        exp_v = row[i_exp].strip() if i_exp >= 0 and i_exp < len(row) else '0'
        try: exp_map[code] += int(exp_v.replace(' ','').replace('\xa0',''))
        except: pass

        # Parcours les blocs candidats
        pos = i_first_nom
        while pos < len(row):
            nom = row[pos].strip() if pos < len(row) else ''
            if not nom:
                pos += CAND_BLOCK
                continue
            prenom = row[pos+1].strip() if pos+1 < len(row) else ''
            # Voix = pos+2 (après Prénom dans 2022/2017)
            voix_raw = row[pos+2].strip() if pos+2 < len(row) else '0'
            try: voix = int(voix_raw.replace(' ','').replace('\xa0',''))
            except: voix = 0
            full = f"{nom} {prenom}".strip()
            voix_map[code][full] += voix
            pos += CAND_BLOCK

    return to_results(voix_map, exp_map)

# ─── Parser format TALL (2002/2007/2012) ──────────────────────────────────────
# Pas d'entête (lignes "--" à ignorer)
# Colonnes fixes : tour;dept;com_code;com_nom;bvot;inscrits;votants;exprimes;panneau;nom;prenom;sigle;voix

COL_TOUR    = 0
COL_DEPT    = 1
COL_COM     = 2
# COL_COM_NOM = 3
COL_INSCRITS = 4  # non utilisé
COL_VOTANTS  = 5
COL_EXP      = 7
COL_PANNEAU  = 8
COL_NOM      = 9
COL_PRENOM   = 10
# COL_SIGLE  = 11
COL_VOIX     = 12

def detect_tall_format(text):
    """
    Détecte le format du fichier tall (2002/2007 vs 2012).
    2007/2002 : tour;dept;com(3);com_nom;bvot;inscrits;votants;exprimes;panneau;nom;prenom;sigle;voix  → 13 cols
    2012      : tour;dept;com(3);com_nom;circo_n;circo_l;bvot;inscrits;votants;exprimes;panneau;nom;prenom;sigle;voix → 15 cols
    Retourne dict avec les indices clés.
    """
    for line in text.split('\n'):
        line = line.rstrip('\r')
        if not line or line.startswith('--'):
            continue
        cols = line.split(';')
        n = len(cols)
        if n == 13:
            return dict(tour=0, dept=1, com=2, exp=7, panneau=8, nom=9, prenom=10, voix=12)
        elif n >= 15:
            return dict(tour=0, dept=1, com=2, exp=9, panneau=10, nom=11, prenom=12, voix=14)
        break
    # fallback
    return dict(tour=0, dept=1, com=2, exp=7, panneau=8, nom=9, prenom=10, voix=12)

def parse_tall(raw):
    """Retourne (t1_results, t2_results)"""
    text = decode(raw)
    fmt  = detect_tall_format(text)
    print(f"    Format tall détecté: {fmt}")

    voix = {"1": defaultdict(lambda: defaultdict(int)),
            "2": defaultdict(lambda: defaultdict(int))}
    exp  = {"1": defaultdict(int), "2": defaultdict(int)}

    for line in text.split('\n'):
        line = line.rstrip('\r')
        if not line or line.startswith('--'):
            continue
        cols = line.split(';')
        if len(cols) < fmt['voix'] + 1:
            continue

        t = cols[fmt['tour']].strip()
        if t not in ('1','2'):
            continue

        dept = cols[fmt['dept']].strip()
        com  = cols[fmt['com'] ].strip()
        code = norm_code(dept, com)

        nom    = cols[fmt['nom'   ]].strip().title()
        prenom = cols[fmt['prenom']].strip().title()
        full   = f"{nom} {prenom}".strip()

        try: voix_val = int(cols[fmt['voix']].strip().replace(' ',''))
        except: voix_val = 0
        try: exp_val  = int(cols[fmt['exp' ]].strip().replace(' ',''))
        except: exp_val  = 0

        voix[t][code][full] += voix_val
        exp[t][code] += exp_val  # sera recalculé de toute façon

    # Recalcule les exprimés comme somme des voix (agrégation multi-bureau fiable)
    for t in ('1','2'):
        for code in voix[t]:
            exp[t][code] = sum(voix[t][code].values())

    return to_results(voix["1"], exp["1"]), to_results(voix["2"], exp["2"])

# ─── Main ──────────────────────────────────────────────────────────────────────

def already_done(key):
    p = os.path.join(OUT_DIR, f"{key}.json")
    if os.path.exists(p):
        print(f"  ↷ {key}: déjà présent ({os.path.getsize(p)//1024} KB)")
        return True
    return False

def main():
    print("=== Build élections communes 2002-2022 ===\n")

    # 2022
    for key in ("2022-t1", "2022-t2"):
        if already_done(key): continue
        print(f"\n--- {key} ---")
        raw = fetch_cached(key)
        res = parse_wide(raw, "2022")
        if res: save(res, key)
        else: print(f"  ✗ {key}: vide")

    # 2017
    for key in ("2017-t1", "2017-t2"):
        if already_done(key): continue
        print(f"\n--- {key} ---")
        raw = fetch_cached(key)
        res = parse_wide(raw, "2017")
        if res: save(res, key)
        else: print(f"  ✗ {key}: vide")

    # 2012 / 2007 / 2002
    for year in ("2012", "2007", "2002"):
        if already_done(f"{year}-t1") and already_done(f"{year}-t2"): continue
        print(f"\n--- {year} T1+T2 ---")
        raw = fetch_cached(f"{year}-bvot")
        t1, t2 = parse_tall(raw)
        if t1: save(t1, f"{year}-t1")
        else: print(f"  ✗ {year}-t1: vide")
        if t2: save(t2, f"{year}-t2")
        else: print(f"  ✗ {year}-t2: vide")

    print("\n=== Terminé ===")
    files = sorted(f for f in os.listdir(OUT_DIR) if f.endswith('.json'))
    total = sum(os.path.getsize(os.path.join(OUT_DIR,f)) for f in files) // 1024
    print(f"  {len(files)} fichiers, {total} KB total")
    for f in files: print(f"    {f}: {os.path.getsize(os.path.join(OUT_DIR,f))//1024} KB")

if __name__ == "__main__":
    main()
