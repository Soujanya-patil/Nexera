# Shared by the test scripts (sourced). T = tests/, W = tests/.work/ (git-ignored), ROOT = the project.
T="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$T/.." && pwd)"
W="$T/.work"
mkdir -p "$W"
# A path as the native programs (node, php, httpd, python) want it: Windows form under Git Bash.
native() { if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else echo "$1"; fi; }
export PYTHONIOENCODING=utf-8
export MAILS="$(native "$W/mails.log")"
# Git Bash turns "/products"-style arguments into "C:/Program Files/Git/products" for native programs.
export MSYS_NO_PATHCONV=1
