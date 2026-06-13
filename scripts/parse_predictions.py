#!/usr/bin/env python3
"""Extract World Cup 2026 predictions from PDF bracket exports."""

import glob
import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "predictions.json"

PLAYER_FILES = {
    "Daniel": "Daniel's World Cup predictions .pdf",
    "Emmanuel": "EMMANUEL WC2026 PREDICTION.pdf",
    "Praise": "PRAISE WC PICKS — Build Brackets & Predict Winners.pdf",
}

TEAM_ALIASES = {
    "czechia": "Czech Republic",
    "czech republic": "Czech Republic",
    "turkiye": "Turkey",
    "dr congo": "Democratic Republic of the Congo",
    "democratic republic of the congo": "Democratic Republic of the Congo",
    "ivory coast": "Ivory Coast",
    "curacao": "Curaçao",
    "usa": "United States",
    "united states": "United States",
    "south korea": "South Korea",
    "saudi arabia": "Saudi Arabia",
    "cape verde": "Cape Verde",
    "new zealand": "New Zealand",
    "bosnia": "Bosnia and Herzegovina",
    "bosnia and herzegovina": "Bosnia and Herzegovina",
    "switzerland": "Switzerland",
    "south africa": "South Africa",
}


def normalize_team(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name.strip())
    key = cleaned.lower()
    return TEAM_ALIASES.get(key, cleaned)


def parse_match_line(line: str) -> dict | None:
    # Mexico1–0South Korea or Mexico 1–0 South Korea
    m = re.match(
        r"^([A-Za-z][A-Za-z\s\.]+?)(\d+)\s*[–\-]\s*(\d+)([A-Za-z][A-Za-z\s\.]+)$",
        line.strip(),
    )
    if not m:
        return None
    home = normalize_team(m.group(1))
    away = normalize_team(m.group(4))
    return {
        "home": home,
        "away": away,
        "homeScore": int(m.group(2)),
        "awayScore": int(m.group(3)),
    }


def extract_champion_picks(text: str) -> list[str]:
    block = re.search(
        r"GROUP STAGE · FINAL STANDINGS\s*(.*?)\s*GROUP A",
        text,
        re.DOTALL,
    )
    if not block:
        return []
    picks = []
    for line in block.group(1).splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "GROUP" not in line:
            picks.append(normalize_team(line))
    return picks[:3]


def extract_group_matches(text: str) -> list[dict]:
    matches = []
    in_results = "GROUP STAGE RESULTS" in text
    if not in_results:
        return matches

    section = text.split("GROUP STAGE RESULTS", 1)[1]
    section = re.split(r"KNOCKOUT BRACKET|Tiebreakers:", section)[0]

    for line in section.splitlines():
        line = line.strip()
        if not line or line.startswith("Group ") or line.startswith("Scorelines"):
            continue
        parsed = parse_match_line(line)
        if parsed:
            matches.append(parsed)
    return matches


def extract_knockout_winners(text: str) -> dict:
    if "KNOCKOUT BRACKET" not in text:
        return {}

    section = text.split("KNOCKOUT BRACKET", 1)[1]
    rounds = {
        "roundOf32": [],
        "roundOf16": [],
        "quarterFinals": [],
        "semiFinals": [],
        "final": [],
        "thirdPlace": [],
    }
    current = None
    round_keys = {
        "ROUND OF 32": "roundOf32",
        "ROUND OF 16": "roundOf16",
        "QUARTER": "quarterFinals",
        "SEMI": "semiFinals",
        "FINAL": "final",
        "3RD PLACE": "thirdPlace",
    }

    for line in section.splitlines():
        line = line.strip()
        if not line or line.startswith("http"):
            continue
        for label, key in round_keys.items():
            if label in line.upper():
                current = key
                break
        else:
            if current and current != "final" or (current == "final" and "3RD" not in line.upper()):
                # Skip truncated names like "Switzerla…"
                if len(line) >= 3 and not line.startswith("FIFA"):
                    team = normalize_team(re.sub(r"[\.…]+$", "", line))
                    if team and team not in {"ROUND OF 32", "ROUND OF 16", "QUARTER", "FINALS", "SEMI", "FINAL", "3RD PLACE"}:
                        rounds[current].append(team)

    # Dedupe while preserving order per round
    for key in rounds:
        seen = set()
        deduped = []
        for team in rounds[key]:
            if team not in seen:
                seen.add(team)
                deduped.append(team)
        rounds[key] = deduped

    return rounds


def read_pdf(name: str) -> str:
    path = ROOT / name
    if not path.exists():
        # Handle curly apostrophe in Daniel's filename
        for candidate in glob.glob(str(ROOT / "Daniel*predictions*.pdf")):
            path = Path(candidate)
            break
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def main():
    players = []
    for player, filename in PLAYER_FILES.items():
        text = read_pdf(filename)
        champion_picks = extract_champion_picks(text)
        group_matches = extract_group_matches(text)
        knockout = extract_knockout_winners(text)

        players.append(
            {
                "id": player.lower(),
                "name": player,
                "championPicks": champion_picks,
                "predictedChampion": champion_picks[0] if champion_picks else None,
                "groupMatches": group_matches,
                "knockout": knockout,
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"players": players}, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    for p in players:
        print(f"  {p['name']}: {len(p['groupMatches'])} group matches, champion={p['predictedChampion']}")


if __name__ == "__main__":
    main()
