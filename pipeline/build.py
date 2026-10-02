import json,re,glob,os,math,html,datetime,collections
from difflib import SequenceMatcher
cand=json.load(open('cand.json'))
wlrev=json.load(open('wl_revs.json')) if os.path.exists('wl_revs.json') else {}
weo=json.load(open('weeden_official.json'))
TODAY='2026-10-02'
def dist(a,b,c,d): return math.hypot((a-c)*111000,(b-d)*111000*math.cos(math.radians(a)))
def area(lat,lng,addr):
    a=addr or ''
    if 7.87<=lat<=7.895 and 98.37<=lng<=98.40: return 'Old Town'
    if lng<=98.318:
        if 7.872<=lat<=7.935: return 'Patong'
        if 7.8275<=lat<7.872: return 'Karon'
        if 7.803<=lat<7.8275: return 'Kata'
        if 7.935<=lat<7.968: return 'Kamala'
        if 7.968<=lat<=8.03: return 'Bang Tao'
    if (lat<7.803 and 98.29<=lng<=98.345) or (lat<7.83 and 'Rawai' in a and lng<=98.345): return 'Rawai'
    return 'Other'
def dt(t): return datetime.datetime.fromtimestamp(t,datetime.timezone.utc).strftime('%Y-%m-%d')
# ---------- features
FEAT={
 'open_24h':r'24 ?/ ?7|24 ?h(?:ours?|rs)?\b|open 24|around the clock|all night|круглосуточн|rund um die uhr|24 часа|24 Stunden',
 'lounge_smoking_area':r'lounge|smoking (?:area|room|zone|spot)|smoke (?:inside|on site|there)|place to smoke|chill (?:area|zone|spot)|seating area|sit and smoke|лаунж|покурить (?:на месте|там|прямо)|место для курения|зона для|курить на месте|можно (?:покурить|курить)|raucherbereich|vor ort rauchen',
 'games_ps5_netflix':r'\bps ?[45]\b|playstation|xbox|netflix|video games?|board games?|pool table|billiard|game room|consoles?|приставк|плейстейшн|настольн\w* игр|бильярд|нетфликс',
 'rooftop':r'roof ?top|на крыше|dachterrasse',
 'delivery':r'deliver(?:y|ed|s)?\b|доставк|доставил|lieferung|liefern',
 'doctor_prescription':r'doctor|prescription|\bpt ?33\b|medical (?:certificate|consult)|clinic|physician|врач|рецепт|доктор|arzt|rezept',
 'english_staff':r'(?:speaks?|speaking|spoke|fluent|good|great|perfect|excellent) english|english[- ]speaking|по-английски|на английском|английск|spricht? (?:gut )?englisch',
 'russian_staff':r'(?:speaks?|speaking|spoke) russian|russian[- ]speaking|по-русски|русскоговор|русскоязычн|на русском|говор\w+ (?:на )?русск|russisch',
 'card_payment':r'credit card|card payment|pay(?:ing)? (?:by|with) card|accept(?:s|ed)? cards?|\bvisa\b|mastercard|\bcards? accepted|картой|оплат\w+ карт|kartenzahlung|mit karte',
 'beginner_friendly':r'beginner|first[- ]time(?:r)?|newbie|never (?:smoked|tried)|new to (?:weed|cannabis|smoking)|not experienced|inexperienced|новичк|впервые|первый раз|anfänger|zum ersten mal',
 'edibles':r'edibles?|gumm(?:y|ies)|brownies?|chocolate|space ?cake|мармелад|брауни|съедобн|шоколад|кекс|gummibärchen|kekse',
}
FRE={k:re.compile(v,re.I) for k,v in FEAT.items()}
def feats(texts):
    out={}
    for k,rx in FRE.items():
        ev=[]
        for src,t in texts:
            m=rx.search(t)
            if m:
                s=max(0,m.start()-80); ev.append({'src':src,'snippet':t[s:m.end()+80].replace('\n',' ')})
            if len(ev)>=3: break
        out[k]={'value':bool(ev),'evidence':ev}
    return out
# ---------- prices
SITE_PRICES={}
def addp(key,url,val,strain,note,date=TODAY,tier=None):
    SITE_PRICES.setdefault(key,[]).append({'source_url':url,'date':date,'value_thb':val,'unit':'g','strain_or_tier':strain or tier,'note':note})
def site_text(u):
    import hashlib
    f='raw/sites/'+hashlib.md5(u.encode()).hexdigest()[:10]+'.html'
    if not os.path.exists(f): return ''
    s=open(f).read(); t=re.sub(r'<script.*?</script>|<style.*?</style>','',s,flags=re.S)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',t)))
t=site_text('https://www.lalalandphuket.com/menu')
for n,v in dict(re.findall(r'(?:New Arrival )?([A-Z][\w\' ]{2,30}?) Price ฿([\d,]+)\.00',t)).items():
    if 'CBD' not in n and int(v.replace(',',''))<1000: addp('lalaland','https://www.lalalandphuket.com/menu',int(v.replace(',','')),n.strip(),'shop menu, per-strain price (assumed per 1g)')
t=site_text('https://www.greengardenkata.com/menu')
for n,v in dict(re.findall(r'Medical flower ([\w\'/ .-]{2,30}?) ฿(\d+) PER 1G',t)).items(): addp('greengarden','https://www.greengardenkata.com/menu',int(v),n.strip(),'shop menu, per 1g')
t=site_text('https://cannasupreme.com/')
for n,v in dict(re.findall(r'([A-Z][\w\' ]{2,30}?) (\d{3,4})฿ per gram',t)).items(): addp('cannasupreme','https://cannasupreme.com/',int(v),n.strip().split('Learn More about ')[-1],'shop site, per gram')
t=site_text('https://green.gd/')
for n,v in dict(re.findall(r'([A-Z][\w\' ]{2,30}?) (?:Indica|Sativa|Hybrid)(?: \d+%)? THC \d+ % (\d{3}) ฿',t)).items(): addp('green.gd','https://green.gd/',int(v),n.strip(),'shop site strain price (assumed per 1g)')
t=site_text('https://goodstuffdelivery.com/')
for n,v in dict(re.findall(r'(?:NEW )?([A-Z][\w\'’ ]{2,30}?) (?:Sativa|Indica|Hybrid) · THC [\d–\-% ]+ (?:From )?(\d{3}) ฿',t)).items(): addp('goodstuff','https://goodstuffdelivery.com/',int(v),n.strip(),'shop site, "from X ฿/g"')
addp('goodstuff','https://goodstuffdelivery.com/',100,None,'site banner: "Cannabis Prices From ฿100 to ฿400 per gram" (low end)',tier='range_low');addp('goodstuff','https://goodstuffdelivery.com/',400,None,'site banner range high end',tier='range_high')
t=site_text('http://www.goodkushbar.com/')
addp('goodkush','http://www.goodkushbar.com/',200,None,'site: "Flower from ฿200 a gram"',tier='from')
for n,v in dict(re.findall(r'(?:Top Shelf|Cali Packs) ([\w\' -]{2,25}?) (?:The Farm Exotics|Zikagi Garden|KittyBoyZ|Major League Exotics)[^฿]{0,60}?฿(\d{3})',t)).items(): addp('goodkush','http://www.goodkushbar.com/',int(v),n.strip(),'shop site 1g price')
addp('dank','http://www.dankbkk.com/',400,None,'site: strains "From 400.00 ฿" (may be chain-wide incl. Bangkok)',tier='from')
addp('greenland420','https://greenland420.com/menu',100,None,'site: "indoor flowers starting at 100thb - 599thb"',tier='range_low');addp('greenland420','https://greenland420.com/menu',599,None,'site range high end',tier='range_high')
addp('beazy_patong','https://cannabox.co.th/dispensaries/phuket',300,None,'Cannabox all-time verified median, 1 verified price (provisional)',tier='median')
addp('greenhouse','https://thailandnomads.com/cannabis-shops-phuket/',250,None,"ThailandNomads: \"Green House's price ranges from 250 to 500 Baht\"",tier='range_low',date=None);addp('greenhouse','https://thailandnomads.com/cannabis-shops-phuket/',500,None,'ThailandNomads range high',tier='range_high',date=None)
addp('growland','https://thailandnomads.com/cannabis-shops-phuket/',500,None,'ThailandNomads: GrowLand premium strains "฿500 to ฿800"',tier='range_low',date=None);addp('growland','https://thailandnomads.com/cannabis-shops-phuket/',800,None,'ThailandNomads range high',tier='range_high',date=None)
addp('phukethigh','http://phukethigh.co/',200,None,'site FAQ (market-wide statement): "200 to over 900 baht per gram"',tier='market_low');addp('phukethigh','http://phukethigh.co/',900,None,'site FAQ market-wide high',tier='market_high')
addp('lalaland_range','http://www.lalalandphuket.com/',99,None,'site: "Price range: ฿99 – ฿350"',tier='range_low');addp('lalaland_range','http://www.lalalandphuket.com/',350,None,'site range high',tier='range_high')
PRICE_KEY=[('lalaland',r'lalaland'),('lalaland_range',r'lalaland'),('greengarden',r'green garden kata'),('cannasupreme',r'cannasupreme'),('green.gd',r'green ghost'),('goodstuff',r'good stuff'),('goodkush',r'good kush bar'),('dank',r'^dank cannabis club'),('greenland420',r'greenland 420'),('beazy_patong',r'beazy.*patong'),('greenhouse',r'^green house$'),('growland',r'growland'),('phukethigh',r'^phuket high$')]
PRX=re.compile(r'(?:(?:฿|thb|baht|b)\s?(\d{2,4})|(\d{2,4})\s?(?:฿|thb|baht|bht|b\b|бат|บาท))[^.\n]{0,25}?(?:/ ?g\b|per (?:gram|g)\b|a gram|for (?:1|one) ?g|за грамм|/гр|gram)',re.I)
# ---------- reddit
comments=[]
if os.path.exists('raw/reddit/trees.json'):
    trees=json.load(open('raw/reddit/trees.json')); posts=json.load(open('raw/reddit/posts.json'))
    def walk(n,pid):
        for c in n:
            dd=c.get('data',{}) if 'data' in c else c
            b=dd.get('body')
            if b and b not in('[deleted]','[removed]'): comments.append({'date':dt(int(dd.get('created_utc',0))),'score':dd.get('score'),'text':b,'permalink':'https://www.reddit.com'+(dd.get('permalink') or f"/comments/{pid}/_/{dd.get('id')}")})
            ch=dd.get('replies') or c.get('children') or []
            if isinstance(ch,dict): ch=ch.get('data',{}).get('children',[])
            walk(ch,pid)
    for pid,tr in trees.items(): walk(tr,pid)
    for p in posts.values():
        tx=(p.get('title') or '')+'\n'+(p.get('selftext') or '')
        if not (re.search(r'phuket|patong|kata|karon|kamala|rawai|bang ?tao|surin|chalong',tx,re.I) or (p.get('subreddit') or '').lower()=='phuket'): continue
        comments.append({'date':dt(int(p['created_utc'])),'score':p.get('score'),'text':tx,'permalink':'https://www.reddit.com'+(p.get('permalink') or ''),'kind':'post'})
GENERIC={'weed patong','cannabis shop','phuket cannabis','mary jane','cannabis','cannabis bar','high cannabis','420 canabis','green house','weed store patong','cannabis island','jointed','puff puff','green lab','green high shop','cannabis boutique','weed vibes','no 1 cannabis','kushty','bud haven','leaf me up','high so weed','ganja cannabis','cannabis whiskey','phuket cannabis lounge','420 phuket delivery','rawai cannabis shop','weed store chalong','weed games karon','power weed phuket','highland patong','phuket high'}
CHAINS=['weeden','extix','greenhead','amsterdam coffee shop','thc club','green lab','kush morning','hazer mates','greenland 420','herbalist 420','puff puff pass','420 route','beazy','ganja house','sabai sabai','green ghost','high andaman','dank dynasty','pufftopia','phuket high']
def key(name):
    n=name.split('|')[0].split(' - ')[0].split('(')[0].split('–')[0].split(':')[0]
    n=re.sub(r'[^\w ]',' ',n.lower()); n=re.sub(r'\b(?:cannabis|weed|shop|store|dispensary|cafe|phuket|patong|the)\b',' ',n) if False else n
    return re.sub(r'\s+',' ',n).strip()
# ---------- build
shops=[]
for c in cand:
    raw=json.load(open(f"raw/{c['pid']}.json")); det=raw['det'].get('data') or {}; md=((raw['extra'] or {}).get('data') or {}).get('metadata') or {}
    lat,lng=c['lat'],c['lng']; addr=det.get('formatted_address') or md.get('address')
    name=det.get('name') or c['name']
    # weeden
    isw=bool(re.search(r'weeden',name,re.I))
    wmatch=None
    if isw or 'weeden.club' in (det.get('website') or ''):
        best=min(weo,key=lambda w:dist(lat,lng,w['lat'],w['lng']))
        dd=dist(lat,lng,best['lat'],best['lng'])
        isw=True; wmatch={'official_name':best['name'],'distance_m':round(dd),'official_maps_link':best['short']} if dd<250 else {'official_name':None,'note':'not on weeden.club/our-shops list (nearest %s at %dm)'%(best['name'],dd)}
    revs=[];seen=set()
    def addr_(src,date,stars,text,lang=None,author=None):
        if not text: return
        k=(author or '')+text[:40]
        if k in seen: return
        seen.add(k); revs.append({'src':src,'date':date,'stars':stars,'text':text,'lang':lang})
    for r in det.get('reviews') or []: addr_('google',dt(r['time']),r['rating'],r.get('text'),r.get('original_language'),r.get('author_name'))
    for f in sorted(glob.glob(f"raw/revlang/{c['pid']}.*.json")):
        for r in json.load(open(f)):
            if r.get('translated'): continue
            addr_('google',dt(r['time']),r['rating'],r.get('text'),r.get('original_language'),r.get('author_name'))
    wl=wlrev.get(str(md.get('id'))) or {}
    for d_,a,s,tx in wl.get('revs',[]): addr_('google',d_,s,tx,None,a)
    texts=[('review',r['text']) for r in revs]+[('name',name)]+[('categories',' '.join(md.get('categories') or [])+' '+' '.join(det.get('types') or []))]
    hours=(det.get('opening_hours') or {}).get('weekday_text')
    if hours: texts.append(('hours',' ; '.join(hours)))
    ft=feats(texts)
    if hours and all('Open 24 hours' in h for h in hours): ft['open_24h']={'value':True,'evidence':[{'src':'google_hours','snippet':'Open 24 hours (all days)'}]+ft['open_24h']['evidence'][:2]}
    # prices
    pp=[]
    lname=name.lower()
    for k,rx in PRICE_KEY:
        if re.search(rx,lname): pp+=SITE_PRICES.get(k,[])
    for r in revs:
        for m in PRX.finditer(r['text']):
            v=int(m.group(1) or m.group(2))
            if 50<=v<=2000:
                s=max(0,m.start()-60); pp.append({'source_url':'google review (via Wanderlog/Places)','date':r['date'],'value_thb':v,'unit':'g','strain_or_tier':None,'note':'review mention: '+r['text'][s:m.end()+40].replace('\n',' ')})
    # reddit
    k=key(name); rm=[]
    chain=next((ch for ch in CHAINS if ch in k),None)
    if k and k not in GENERIC and len(k)>=5:
        pat=re.compile(r'\b'+re.escape(chain or k)+r'\b',re.I)
        for cm in comments:
            if pat.search(cm['text']):
                a=area(lat,lng,addr)
                match='brand' if chain else 'name'
                if chain and a.lower() in cm['text'].lower(): match='brand+area'
                rm.append({'date':cm['date'],'score':cm['score'],'text':cm['text'][:400],'permalink':cm['permalink'],'match':match})
    rm=sorted(rm,key=lambda x:x['date'],reverse=True)[:25]
    for m_ in rm:
        for m in PRX.finditer(m_['text']):
            v=int(m.group(1) or m.group(2))
            if 50<=v<=2000:
                s0=max(0,m.start()-60); pp.append({'source_url':m_['permalink'],'date':m_['date'],'value_thb':v,'unit':'g','strain_or_tier':None,'note':'reddit mention (%s match): '%m_['match']+m_['text'][s0:m.end()+40].replace('\n',' ')})
    ta=None
    if md.get('tripadvisorLocationId'):
        ta={'rating':md.get('tripadvisorRating'),'count':md.get('tripadvisorNumRatings'),'url':None,'location_id':md['tripadvisorLocationId'],'category':None,'note':'from Wanderlog metadata; TripAdvisor pages blocked (403)'}
    srcs=[f"https://wanderlog.com/api/placesAPI/getPlaceDetails/v2?placeId={c['pid']}", det.get('url')]
    if md.get('id'): srcs.append(f"https://wanderlog.com/place/details/{md['id']}")
    if wmatch and wmatch.get('official_maps_link'): srcs.append('https://weeden.club/our-shops/')
    shops.append({'id':c['pid'],'name':name,'is_weeden':isw,'weeden_official':wmatch,'area':area(lat,lng,addr),'address':addr,'lat':lat,'lng':lng,
      'website':det.get('website'),'phone':det.get('international_phone_number') or det.get('formatted_phone_number'),'hours':hours,
      'business_status':det.get('business_status'),'categories':(md.get('categories') or [])+[t for t in (det.get('types') or []) if t not in('establishment','point_of_interest')],
      'google':{'rating':det.get('rating'),'count':det.get('user_ratings_total'),'source_url':det.get('url'),'place_id':c['pid'],'snapshot_note':f'Google Places details via Wanderlog proxy API, fetched {TODAY}'},
      'reviews':revs,'tripadvisor':ta,'price_points':pp,'features':ft,'reddit_mentions':rm,'sources':[s for s in srcs if s],'discovery':c['why']})
# add WeedeN official locations not matched
matched={s['weeden_official']['official_name'] for s in shops if s.get('weeden_official') and s['weeden_official'].get('official_name')}
for w in weo:
    if w['name'] not in matched:
        shops.append({'id':'weeden_official:'+w['short'].split('/')[-1],'name':w['name'],'is_weeden':True,'weeden_official':{'official_name':w['name'],'distance_m':0,'official_maps_link':w['short']},'area':area(w['lat'],w['lng'],w['addr']),'address':w['addr'],'lat':w['lat'],'lng':w['lng'],'website':'https://weeden.club/our-shops/','phone':None,'hours':None,'business_status':None,'categories':['Cannabis store'],'google':{'rating':None,'count':None,'source_url':w['redirect'][:300],'place_id':None,'snapshot_note':'coords from weeden.club map link; Google details not matched'},'reviews':[],'tripadvisor':None,'price_points':[],'features':feats([('name',w['name'])]),'reddit_mentions':[],'sources':['https://weeden.club/our-shops/',w['short']],'discovery':'weeden_official'})
json.dump(shops,open('shops.json','w'),ensure_ascii=False,indent=1)
C=collections.Counter
print('shops',len(shops),'coords',sum(1 for s in shops if s['lat']),'reviews',sum(len(s['reviews']) for s in shops))
print(C(s['area'] for s in shops))
print('weeden',sum(s['is_weeden'] for s in shops),'official matched',len(matched),'/',len(weo))
print('ta',sum(1 for s in shops if s['tripadvisor']),'prices',sum(len(s['price_points']) for s in shops),'shops w/ price',sum(1 for s in shops if s['price_points']))
print('reddit',sum(len(s['reddit_mentions']) for s in shops),'shops w/ reddit',sum(1 for s in shops if s['reddit_mentions']))
print({k:sum(s['features'][k]['value'] for s in shops) for k in FEAT})
print('review langs',C(r['lang'] for s in shops for r in s['reviews']).most_common(10))
