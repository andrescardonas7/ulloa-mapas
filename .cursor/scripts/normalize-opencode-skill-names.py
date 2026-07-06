"""Normalize OpenCode-unsafe skill frontmatter names to kebab-case.

Usage:
  python .cursor/scripts/normalize-opencode-skill-names.py
"""
from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

UPDATES: dict[str, str] = {
    "skills/collision-zone-thinking/SKILL.md": "collision-zone-thinking",
    "skills/defense-in-depth/SKILL.md": "defense-in-depth-validation",
    "skills/inversion-exercise/SKILL.md": "inversion-exercise",
    "skills/meta-pattern-recognition/SKILL.md": "meta-pattern-recognition",
    "skills/root-cause-tracing/SKILL.md": "root-cause-tracing",
    "skills/scale-game/SKILL.md": "scale-game",
    "skills/simplification-cascades/SKILL.md": "simplification-cascades",
    "skills/systematic-debugging/SKILL.md": "systematic-debugging",
    "skills/verification-before-completion/SKILL.md": "verification-before-completion",
    "skills/when-stuck/SKILL.md": "when-stuck-problem-solving-dispatch",
}


def update_name(path: Path, new_name: str) -> bool:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    for idx, line in enumerate(lines):
        if line.startswith("name: "):
            lines[idx] = f"name: {new_name}\n"
            path.write_text("".join(lines), encoding="utf-8", newline="\n")
            return True
    return False


def main() -> None:
    changed = 0
    for rel, new_name in UPDATES.items():
        path = ROOT / rel
        if not path.exists():
            print(f"missing {rel}")
            continue
        if update_name(path, new_name):
            changed += 1
            print(f"updated {rel} -> {new_name}")
        else:
            print(f"no-name-line {rel}")
    print(f"Done. Files changed: {changed}")


if __name__ == "__main__":
    main()
