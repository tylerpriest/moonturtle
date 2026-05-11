#!/usr/bin/env bash
set -euo pipefail

export MOONTURTLE_LOCAL_PROVIDER="${MOONTURTLE_LOCAL_PROVIDER:-auto}"
npm run dev
