#!/usr/bin/env bash
# lhab.sh <tag> <runs> <path…> — Lighthouse mobile, before (BEFORE_PORT, default 8811: the reference build) and after (8810) interleaved run by run,
# so both see the same machine load. Medians per page and side.
TAG=$1; N=$2; shift 2
cd "$(dirname "$0")/.."; mkdir -p .work; cd .work; rm -rf "lh/$TAG"; mkdir -p "lh/$TAG"
for i in $(seq 1 $N); do
  for p in "$@"; do
    slug=$(echo "$p" | sed 's#^/$#home#; s#^/##; s#/#_#g')
    for side in before:${BEFORE_PORT:-8811} after:${AFTER_PORT:-8810}; do
      npx --no-install lighthouse "http://127.0.0.1:${side#*:}$p" --only-categories=performance --output=json --output-path="lh/$TAG/${side%%:*}-$slug-$i.json" --chrome-flags="--headless=new --no-sandbox" --quiet >/dev/null 2>&1
    done
  done
done
python - "$TAG" <<'PY'
import json,glob,statistics as st,sys,re,collections
tag=sys.argv[1]; rows=collections.defaultdict(list)
for f in sorted(glob.glob(f'lh/{tag}/*.json')):
  side,slug=re.match(r'.*[\\/](before|after)-(.+)-\d+\.json',f).groups()
  a=json.load(open(f,encoding='utf-8'));au=a['audits']
  rows[(slug,side)].append((a['categories']['performance']['score']*100, au['first-contentful-paint']['numericValue']/1000, au['largest-contentful-paint']['numericValue']/1000, au['total-blocking-time']['numericValue'], au['cumulative-layout-shift']['numericValue']))
for (slug,side),r in sorted(rows.items(), key=lambda x:(x[0][0], x[0][1]!='before')):
  m=lambda k: st.median(x[k] for x in r)
  print(f"{slug:34} {side:6} runs {[round(x[0]) for x in r]}  median perf {m(0):.0f}  FCP {m(1):.2f}  LCP {m(2):.2f}  TBT {m(3):.0f}  CLS {m(4):.3f}")
PY
