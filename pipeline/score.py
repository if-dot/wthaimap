import json, re, statistics, collections
import os,sys
P=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data','phuket')+'/'
shops=json.load(open(P+'shops.json'))

LEX={
 'quality_pos': r"\b(fresh|freshest|high quality|great quality|good quality|top quality|quality (is|was) (great|good|amazing|top)|best (weed|bud|flower|quality)|good (weed|bud|buds|flower|stuff)|great (weed|bud|buds|flower|stuff)|amazing (weed|bud|flower)|fire|gas|sticky|smell(s|ed)? (great|amazing|good)|terp|potent|strong|top[- ]shelf|premium|качеств|свеж|отличн(ая|ый|ое) (трав|шишк|продукт|товар)|хорош(ая|ий|ие) (трав|шишк|сорт|товар)|крепк|мощн|Qualität|frisch|stark|qualité|frais|fraîche|puissant|איכות|טרי)",
 'quality_neg': r"\b(dry|dried out|mold|mould|moldy|harsh|weak|stale|old (weed|bud|stock)|low quality|bad quality|poor quality|pgr|didn.?t (hit|do anything)|not strong|сух(ая|ие|ой)|плесен|слаб(ая|ый|о)|стар(ая|ые)|низкого качества|плох(ая|ое) качеств|trocken|schwach|schimmel|alt(es)? (gras|weed)|sec|sèche|faible|moisi|mauvaise qualité|יבש|חלש)",
 'price_pos': r"\b(cheap|cheapest|affordable|fair price|good price|great price|best price|reasonable|reasonably priced|good value|value for money|discount|дешев|недорог|хорош(ая|ие) цен|низк(ая|ие) цен|приятн(ая|ые) цен|адекватн(ая|ые) цен|выгодн|скидк|günstig|preiswert|fairer? preis|gute preise|billig|pas cher|bon prix|prix (raisonnable|correct|abordable)|זול|מחיר (טוב|הוגן))",
 'price_neg': r"\b(expensive|overpriced|pricey|too much|rip ?off|ripoff|overcharg|дорог(о|ая|ие|овато)|завышен|дорогов|teuer|überteuert|zu teuer|cher|trop cher|hors de prix|יקר)",
 'selection': r"\b(selection|variety|wide range|lots of (strains|choice)|many strains|choice|assortment|ассортимент|выбор|много сортов|сорт(а|ов)|Auswahl|Sorten|Vielfalt|choix|variété|sélection|מבחר|זנים)",
 'atmosphere': r"\b(vibe|vibes|chill|lounge|atmosphere|cozy|cosy|relax|rooftop|music|ps ?5|playstation|netflix|xbox|games|smok(e|ing) (area|room|lounge)|hang ?out|терраса|атмосфер|уютн|расслаб|лаунж|приставк|плейстейшн|покурить (на месте|там)|Atmosphäre|gemütlich|chillen|entspann|ambiance|détendu|cosy|אווירה|נעים)",
 'staff_pos': r"\b(friendly|helpful|knowledgeable|knowledgable|explained|explain|advice|advise|recommend(ed|ation)|welcoming|patient|attentive|professional|kind|приветлив|дружелюб|объясн|подсказ|помог|консульт|вежлив|отзывчив|доброжелат|freundlich|hilfsbereit|kompetent|erklärt|beraten|beratung|sympathique|accueillant|conseil|serviable|gentil|שירות|נחמד|מקצועי|אדיב)",
 'staff_neg': r"\b(rude|pushy|ignored|unfriendly|arrogant|unhelpful|хамств|груб|навязыв|невежлив|unfreundlich|unhöflich|impoli|désagréable|גס)",
 'beginner': r"\b(first time|first-time|beginner|newbie|new to|never (tried|smoked)|explained everything|walked me through|took (the )?time|первый раз|впервые|новичк|всё объяснил|Anfänger|zum ersten mal|erstes mal|première fois|débutant|פעם ראשונה|מתחיל)",
 'trust_neg': r"\b(scam|rip ?off|cheat|fake|overcharg|wrong change|short|underweight|charged me|hidden fee|не то|обман|развод|кинул|обвес|недовес|Betrug|abgezockt|betrogen|arnaque|escroquerie|רימו|הונאה)",
 'doctor': r"\b(doctor|prescription|certificate|pt ?33|врач|рецепт|справк|Arzt|Rezept|ordonnance|médecin|רופא|מרשם)",
 'open_late': r"\b(24 ?h|24/7|24 hours|open late|late night|круглосуточ|ночью|rund um die uhr|ouvert tard|24 שעות)",
}
LEXC={k:re.compile(v,re.I) for k,v in LEX.items()}

def tag(text):
    t=text or ''
    return {k:bool(r.search(t)) for k,r in LEXC.items()}

def snip(text,rx,width=150):
    m=rx.search(text or '')
    if not m: return (text or '')[:width]
    s=max(0,m.start()-60); e=min(len(text),m.end()+90)
    return ('…' if s>0 else '')+text[s:e].replace('\n',' ')+('…' if e<len(text) else '')

out=[]
for s in shops:
    revs=s.get('reviews') or []
    n=len(revs)
    cnt=collections.Counter(); ev=collections.defaultdict(list)
    neg_stars=0
    for r in revs:
        tg=tag(r.get('text'))
        for k,v in tg.items():
            if v:
                cnt[k]+=1
                if len(ev[k])<3: ev[k].append({'lang':r.get('lang'),'date':r.get('date'),'stars':r.get('stars'),'text':snip(r.get('text'),LEXC[k])})
        if (r.get('stars') or 5)<=3: neg_stars+=1
    # reddit
    rm=s.get('reddit_mentions') or []
    rpos=rneg=0; rev_ex=[]
    for m in rm:
        tg=tag(m.get('text'))
        if tg['quality_pos'] or tg['price_pos'] or re.search(r'\b(best|great|good|recommend|love)\b',m.get('text',''),re.I): rpos+=1
        if tg['quality_neg'] or tg['price_neg'] or tg['trust_neg'] or re.search(r'\b(avoid|worst|bad|shit|mid)\b',m.get('text',''),re.I): rneg+=1
        if len(rev_ex)<3: rev_ex.append({'date':m.get('date'),'score':m.get('score'),'text':(m.get('text') or '')[:220].replace('\n',' '),'url':m.get('permalink')})
    pp=s.get('price_points') or []
    vals=[p['value_thb'] for p in pp if isinstance(p.get('value_thb'),(int,float)) and p.get('unit','g')=='g' and 20<=p['value_thb']<=3000]
    price_med=statistics.median(vals) if vals else None
    price_min=min(vals) if vals else None
    g=s.get('google') or {}
    rating=g.get('rating'); count=g.get('count') or 0
    f={k:(v.get('value') if isinstance(v,dict) else v) for k,v in (s.get('features') or {}).items()}
    fe={k:(v.get('evidence') if isinstance(v,dict) else []) for k,v in (s.get('features') or {}).items()}
    # confidence
    conf = min(1.0, n/12)
    def rate(pos,neg,w=1.5):
        if n==0: return None
        return (pos - w*neg)/n
    q=rate(cnt['quality_pos'],cnt['quality_neg'])
    # quality score 0-100: base 50 + mentions
    def to100(x,scale=1.0):
        if x is None: return None
        return max(0,min(100,round(50+50*max(-1,min(1,x*scale)))))
    quality = to100(q,2.0)
    pr = rate(cnt['price_pos'],cnt['price_neg'],1.0)
    price = to100(pr,2.5)
    if price_med is not None:
        # map median price: 150→95, 300→70, 500→45, 800→20
        pm=max(0,min(100, round(110 - price_med*0.1125)))
        price = round(0.6*pm+0.4*(price if price is not None else 50))
    atmo_feat = sum([bool(f.get('lounge_smoking_area')),bool(f.get('games_ps5_netflix')),bool(f.get('rooftop')),bool(f.get('open_24h'))])
    atmosphere = min(100, round(35 + 15*atmo_feat + (cnt['atmosphere']/n*60 if n else 0)))
    beg = (cnt['beginner']*2 + cnt['staff_pos'] - 2*cnt['staff_neg'] - 2*cnt['trust_neg'])/n if n else None
    beginner = to100(beg,1.2) if beg is not None else None
    if f.get('beginner_friendly') and beginner is not None: beginner=min(100,beginner+8)
    # trust: start 70; penalties
    trust=70
    if cnt['trust_neg']: trust-=15*cnt['trust_neg']
    if n and neg_stars: trust-= 8*neg_stars
    if rating==5 and count>=800: trust-=10  # implausible perfection
    if rating and rating<4.6: trust-=10
    if s.get('business_status') not in (None,'OPERATIONAL'): trust-=40
    trust += min(15, 3*rpos) - 6*rneg
    trust=max(0,min(100,round(trust)))
    overall=None
    parts=[x for x in [quality,price,atmosphere,beginner,trust] if x is not None]
    if parts:
        overall=round(0.35*(quality if quality is not None else 50)+0.15*(price if price is not None else 50)+0.15*atmosphere+0.15*(beginner if beginner is not None else 50)+0.20*trust)
        overall=round(overall*(0.6+0.4*conf)+ 50*(0.4-0.4*conf))  # shrink to 50 when thin
    hours=s.get('hours') or []
    out.append({
        'id':s['id'],'name':((s.get('weeden_official') or {}).get('official_name') or s['name']),'area':s['area'],'lat':s['lat'],'lng':s['lng'],'address':s.get('address'),
        'web':s.get('website'),'phone':s.get('phone'),'hours':hours[:7],'status':s.get('business_status'),
        'rating':rating,'count':count,'n':n,'langs':sorted(set(r.get('lang') or '?' for r in revs)),
        'weeden':bool(s.get('is_weeden')) and bool(s.get('weeden_official')),
        'scores':{'overall':overall,'quality':quality,'price':price,'atmosphere':atmosphere,'beginner':beginner,'trust':trust,'conf':round(conf,2)},
        'cnt':dict(cnt),'neg_stars':neg_stars,'ev':ev,
        'feat':{k:bool(v) for k,v in f.items()},'feat_ev':{k:[e.get('snippet','')[:140] for e in (v or [])[:1]] for k,v in fe.items()},
        'price_med':price_med,'price_min':price_min,'price_src':[{'u':p.get('source_url'),'d':p.get('date'),'v':p.get('value_thb'),'s':p.get('strain') or p.get('tier') or p.get('note')} for p in pp[:6]],
        'reddit':{'n':len(rm),'pos':rpos,'neg':rneg,'ex':rev_ex},
    })
json.dump(out,open(P+'scored.json','w'),ensure_ascii=False)
# summary
ok=[o for o in out if o['n']>=5]
print('shops',len(out),'with>=5 reviews',len(ok))
for take in ['overall','quality','price','atmosphere','beginner','trust']:
    top=sorted([o for o in ok if o['scores'][take] is not None],key=lambda o:-o['scores'][take])[:8]
    print('\n==',take);
    for o in top: print(f"  {o['scores'][take]:>3} {o['name'][:38]:<38} {o['area']:<9} n={o['n']:<2} g={o['rating']}/{o['count']} {'WEEDEN' if o['weeden'] else ''} q+{o['cnt'].get('quality_pos',0)} q-{o['cnt'].get('quality_neg',0)} p+{o['cnt'].get('price_pos',0)} p-{o['cnt'].get('price_neg',0)} pm={o['price_med']}")
w=[o for o in out if o['weeden']]
print('\nWEEDEN',len(w));
for o in sorted(w,key=lambda o:-(o['scores']['overall'] or 0)): print(f"  {o['scores']['overall']} {o['name'][:30]:<30} {o['area']:<9} n={o['n']} g={o['rating']}/{o['count']} q={o['scores']['quality']} a={o['scores']['atmosphere']} b={o['scores']['beginner']} t={o['scores']['trust']}")
import os; print('size',os.path.getsize(P+'scored.json'))
