#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-claude-skills.sh
# Instala as skills do iMobCreatorAI como skills globais do Claude Code CLI.
# Execute uma vez após clonar o repositório em uma nova máquina:
#
#   bash setup-claude-skills.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

SKILLS_SRC="$(cd "$(dirname "$0")/.claude/skills" && pwd)"
SKILLS_DST="$HOME/.claude/skills"

if [ ! -d "$SKILLS_SRC" ]; then
  echo "Erro: pasta .claude/skills não encontrada em $SKILLS_SRC"
  exit 1
fi

mkdir -p "$SKILLS_DST"

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name=$(basename "$skill_dir")
  dest="$SKILLS_DST/$skill_name"

  if [ -d "$dest" ]; then
    echo "↺  $skill_name — atualizando"
  else
    echo "✚  $skill_name — instalando"
    mkdir -p "$dest"
  fi

  cp -f "$skill_dir/SKILL.md" "$dest/SKILL.md"
done

echo ""
echo "✓ Skills instaladas em $SKILLS_DST"
echo ""
echo "Skills disponíveis globalmente:"
for skill_dir in "$SKILLS_DST"/*/; do
  echo "  /$( basename "$skill_dir" )"
done
