# -*- coding: utf-8 -*-
"""Normalize common UTF-8 mojibake in .cursor/skills/**/*.md.

Run from repo root or any cwd:
  python .cursor/scripts/normalize-skills-encoding.py

Useful after importing or syncing skills that were saved with wrong encoding.
"""
from __future__ import annotations

import pathlib

SKILLS = pathlib.Path(__file__).resolve().parent.parent / "skills"

REPLACEMENTS: list[tuple[bytes, bytes]] = [
    (b"\xc3\xa2\xe2\x82\xac\xe2\x80\x9d", "\u2014".encode("utf-8")),  # em dash
    (b"\xc3\xa2\xe2\x82\xac\xe2\x84\xa2", b"'"),
    (b"\xc3\xa2\xe2\x82\xac\xc5\x93", b'"'),
    (b"\xc3\xa2\xe2\x82\xac\xc2\x9d", b'"'),
    (b"\xc3\xa2\xe2\x80\xb0\xc2\xa5", "\u2265".encode("utf-8")),  # ≥
    (b"\xc3\xa2\xe2\x80\xb0\xc2\xa0", "\u2260".encode("utf-8")),  # ≠
]


def main() -> None:
    changed = 0
    for path in sorted(SKILLS.rglob("*.md")):
        raw = path.read_bytes()
        new = raw
        for old, rep in REPLACEMENTS:
            new = new.replace(old, rep)
        if new != raw:
            path.write_bytes(new)
            changed += 1
            print("updated", path.relative_to(SKILLS.parent.parent))
    print(f"Done. Files changed: {changed}")


if __name__ == "__main__":
    main()
