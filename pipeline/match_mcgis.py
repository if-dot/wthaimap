#!/usr/bin/env python3
"""Match our shops to the public MC-GIS licence registry (Dept. of Thai Traditional & Alternative Medicine).
Fetch: python3 pipeline/match_mcgis.py --fetch   (GET https://cannabis-gis.dtam.moph.go.th/api/geo/markers-dev?province_id=66&type=establishment)
Match: name similarity (normalised) within 400 m, or very close coordinates (<=80 m) with weak name match.
Writes shop['mcgis'] = {license_no, status, expiry, name, dist_m, match} and data/phuket/mcgis_matches.json for review."""
import json, re, math, sys, pathlib, time, urllib.request, difflib
ROOT = pathlib.Path(__file__).resolve().parent.parent; DATA = ROOT / "data" / "phuket"
URL = "https://cannabis-gis.dtam.moph.go.th/api/geo/markers-dev?province_id=66&type=establishment"
def norm(s):
    s = (s or "").lower()
    s = re.sub(r"\b(cannabis|dispensary|weed|shop|store|phuket|patong|kata|karon|rawai|co\.?|ltd\.?|the|club|cafe|café|by|and|&|thailand|ganja|marijuana|\(|\))\b", " ", s)
    s = re.sub(r"[^\w]+", " ", s); return " ".join(s.split())
def dist(a, b): 
    R=6371000; p1,p2=math.radians(a[0]),math.radians(b[0]); dp=p2-p1; dl=math.radians(b[1]-a[1])
    h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2; return 2*R*math.asin(math.sqrt(h))
def main():
    if "--fetch" in sys.argv:
        req=urllib.request.Request(URL, headers={"User-Agent":"Mozilla/5.0 BudMap/0.1"}); data=urllib.request.urlopen(req, timeout=180).read()
        open(DATA/"mcgis_phuket.json","wb").write(data); print("fetched", len(json.loads(data)))
    reg = json.load(open(DATA/"mcgis_phuket.json")); shops = json.load(open(DATA/"shops.json"))
    out=[]; n=0
    for s in shops:
        best=None
        for r in reg:
            if r.get("lat") is None: continue
            d = dist((s["lat"],s["lng"]),(r["lat"],r["lng"]))
            if d > 300: continue
            sim = difflib.SequenceMatcher(None, norm(s["name"]), norm(r["name"])).ratio()
            a,b = norm(s["name"]), norm(r["name"]); ta, tb = set(a.split()), set(b.split())
            short = ta if len(ta) <= len(tb) else tb
            contain = bool(short) and short <= (ta | tb) and short.issubset(tb if short is ta else ta) and any(len(t) >= 4 for t in short) and short - {"high", "green", "happy", "best", "coffee", "lounge", "house"} != set()
            score = sim + (0.25 if contain else 0) + (0.2 if d<=80 else 0.1 if d<=200 else 0)
            fa, fb = (a.split() or [""])[0], (b.split() or [""])[0]; first = fa == fb and len(fa) >= 3
            ok = contain or (sim>=0.6 and first) or (d<=30 and sim>=0.5 and first)
            if ok and (best is None or score>best[0]): best=(score,r,d,sim)
        if best:
            sc,r,d,sim=best; n+=1
            s["mcgis"]={"license_no":r.get("license_no"),"status":r.get("status"),"expiry":r.get("license_expiry_date"),"name":r.get("name"),"dist_m":round(d),"match":"strong" if (sim>=0.75 or (contain and d<=150)) else "probable","checked":time.strftime("%Y-%m-%d")}
            out.append({"shop":s["name"],"reg":r["name"],"dist":round(d),"sim":round(sim,2),"status":r.get("status"),"exp":r.get("license_expiry_date"),"lic":r.get("license_no"),"match":s["mcgis"]["match"]})
        else:
            s.pop("mcgis",None); out.append({"shop":s["name"],"reg":None})
    json.dump(shops, open(DATA/"shops.json","w"), ensure_ascii=False); json.dump(out, open(DATA/"mcgis_matches.json","w"), ensure_ascii=False, indent=0)
    print(f"matched {n} of {len(shops)}; registry {len(reg)} establishments; statuses", {k:sum(1 for s in shops if s.get('mcgis',{}).get('status')==k) for k in ('active','closed','suspended')})
if __name__=="__main__": main()
