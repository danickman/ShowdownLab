#!/usr/bin/env bash
# Browser-only development dependency bootstrap. Keep npm transient outages from
# turning otherwise healthy gameplay/browser QA into false application failures.
set -euo pipefail
for attempt in 1 2 3; do
  echo "Browser QA dependency install: attempt ${attempt}/3"
  if timeout 165s npm install --prefix tools/qa --no-audit --no-fund \
      --fetch-retries=1 --fetch-timeout=60000 --fetch-retry-mintimeout=3000 --fetch-retry-maxtimeout=12000; then
    exit 0
  fi
  if [[ "$attempt" -lt 3 ]]; then
    echo "Registry install interrupted, retrying after a brief backoff..." >&2
    sleep $((attempt * 4))
  fi
done
echo "Browser QA dependency install failed after 3 bounded attempts." >&2
exit 1
