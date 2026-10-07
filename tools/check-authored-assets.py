#!/usr/bin/env python3
"""Catch corrupt authored payloads before committing or deploying (requires Pillow)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "v3/assets/authored"
FIGHTERS = ("knight", "sniper", "goose", "dragon", "assassin", "beetank",
            "mole", "turtle", "goblin", "barbarian")


def main():
    errors = []
    checked = 0
    for fighter in FIGHTERS:
        for pose in ("idle", "move", "attack", "guard", "hit", "defeat",
                     "charge" if fighter == "knight" else "signature"):
            if not (ASSETS / fighter / f"{pose}.webp").is_file():
                errors.append(f"{fighter}/{pose}.webp: missing")
    for path in sorted(ASSETS.glob("*/*.webp")):
        try:
            payload = path.read_bytes()
            assert payload[:4] == b"RIFF" and payload[8:12] == b"WEBP", "invalid WebP header"
            with Image.open(path) as image:
                image.load()
                assert image.format == "WEBP", "unexpected image format"
                assert "A" in image.getbands(), "missing alpha"
                assert image.getchannel("A").getextrema()[0] == 0, "no transparent pixels"
                assert image.getbbox(), "empty sprite"
                if path.parent.name == "sniper":
                    expected = (512, 512) if path.stem == "presentation" else (96, 96)
                    assert image.size == expected, f"expected {expected}, got {image.size}"
            checked += 1
        except Exception as error:
            errors.append(f"{path.relative_to(ASSETS)}: {error}")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"PASS: {checked} authored WebPs decode with nonempty transparent art; all 10 pose packs present")


if __name__ == "__main__":
    main()
