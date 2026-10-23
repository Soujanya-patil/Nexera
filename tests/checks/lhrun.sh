#!/usr/bin/env bash
# lhrun.sh <tag> <port> <path> [runs] — Lighthouse mobile performance, summary + medians.
TAG=$1; PORT=$2; PTH=$3; N=${4:-3}
cd "$(dirname "$0")/.."; mkdir -p .work; cd .work; rm -rf "lh/$TAG"; mkdir -p "lh/$TAG"
for i in $(seq 1 $N); do
  npx --no-install lighthouse "http://127.0.0.1:$PORT$PTH" --only-categories=performance --output=json --output-path="lh/$TAG/r-$i.json" --chrome-flags="--headless=new --no-sandbox" --quiet >/dev/null 2>&1
done
python - "$TAG" <<'PY'
import json,glob,statistics as st,sys
rows=[]
for f in sorted(glob.glob(f'lh/{sys.argv[1]}/r-*.json')):
  a=json.load(open(f,encoding='utf-8'));au=a['audits']
  js=sum(i.get('transferSize',0) for i in au['network-requests']['details']['items'] if i.get('resourceType')=='Script')/1024
  rows.append((a['categories']['performance']['score']*100, au['first-contentful-paint']['numericValue']/1000, au['largest-contentful-paint']['numericValue']/1000, au['total-blocking-time']['numericValue'], au['cumulative-layout-shift']['numericValue'], js))
print(sys.argv[1], 'runs', [round(r[0]) for r in rows])
print(sys.argv[1], 'median perf %.0f FCP %.2f LCP %.2f TBT %.0f CLS %.3f JS %.1fKB' % tuple(st.median(r[k] for r in rows) for k in range(6)))
PY
