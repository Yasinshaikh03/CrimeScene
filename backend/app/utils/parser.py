import ast
import json
import re
from typing import List, Union

from fastapi import HTTPException
from app.config import settings

DEPENDENT_MARKERS = {
    "and", "or", "but", "while", "who", "whom", "whose", "which", "that", "where", "when",
    "with", "without", "as", "about", "aged", "dressed", "armed", "covered",
    # Irregular participles
    "seen", "found", "left", "shot", "hit", "struck", "taken", "hidden", "broken", "cut", "torn", "bent", "burnt", "drawn"
}

# Regular participles ending in -ing or -ed (e.g. 'holding', 'wearing', 'running', 'filled', 'painted', 'parked')
PARTICIPLE_PATTERN = re.compile(r"^[a-z]{2,}(?:ing|ed)\b", re.IGNORECASE)
EXCLUDED_PARTICIPLE_WORDS = {
    "red", "bed", "shed", "shred", "sled", "feed", "seed", "weed", "need", "speed", "breed", "deed"
}


def is_participle_word(word: str) -> bool:
    word_lower = word.lower()
    return (
        len(word_lower) >= 4
        and bool(PARTICIPLE_PATTERN.match(word_lower))
        and word_lower not in EXCLUDED_PARTICIPLE_WORDS
    )


def is_natural_sentence_with_commas(segments: List[str]) -> bool:
    """
    Determine if comma-separated segments belong to a single descriptive sentence
    (e.g., 'a man in a black jacket, holding a knife', 'a red canvas, filled with paint')
    rather than a list of independent items.
    """
    if len(segments) <= 1:
        return True

    # Initial segment starting with a prepositional phrase
    first_lower = segments[0].lower().strip()
    if any(first_lower.startswith(prep + " ") for prep in ["in", "at", "on", "during", "near", "under"]):
        return True

    # Check subsequent segments for dependent clauses, participles, or relative markers
    for seg in segments[1:]:
        seg_lower = seg.lower().strip()
        words = seg_lower.split()
        if not words:
            continue
        first_word = words[0]

        # Conjunctions / dependent markers
        if first_word in DEPENDENT_MARKERS:
            return True

        # -ing or -ed participles
        if is_participle_word(first_word):
            return True

    return False


def parse_descriptions(raw_input: Union[str, List[str]]) -> List[str]:
    """
    Parse candidate descriptions from flexible client inputs:
    - JSON array: '["knife", "gun"]'
    - Python list string: "['knife', 'gun']"
    - Newline-separated text: 'knife\\ngun'
    - Comma-separated items: 'knife, gun, police'
    - Single description (including sentences with commas: 'a man in black, holding a knife')
    - Native Python list of strings

    Validates that:
    - 1 to 20 non-empty descriptions are provided.
    - Each description is between 1 and 500 characters.
    """
    if raw_input is None:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one non-empty description."
        )

    candidates: List[str] = []

    # Case 1: Already a list
    if isinstance(raw_input, list):
        candidates = [str(item) for item in raw_input]
    elif isinstance(raw_input, str):
        text = raw_input.strip()
        if not text:
            raise HTTPException(
                status_code=400,
                detail="Provide at least one non-empty description."
            )

        # 1. Try standard JSON parsing
        parsed_json = None
        try:
            parsed_json = json.loads(text)
        except (json.JSONDecodeError, TypeError, ValueError):
            parsed_json = None

        if isinstance(parsed_json, list):
            candidates = [str(item) for item in parsed_json]
        elif isinstance(parsed_json, str):
            text = parsed_json.strip()

        # 2. If not parsed as a JSON list, try Python literal list syntax e.g. ['a', 'b']
        if not candidates and text.startswith("[") and text.endswith("]"):
            try:
                literal_val = ast.literal_eval(text)
                if isinstance(literal_val, list):
                    candidates = [str(item) for item in literal_val]
            except (ValueError, SyntaxError, MemoryError):
                pass

        # 3. If still not a list, check for newline-separated entries
        if not candidates and "\n" in text:
            candidates = [line for line in text.splitlines() if line.strip()]

        # 4. If still not a list, check for comma-separated items vs single natural sentence
        if not candidates and "," in text:
            segments = [s.strip() for s in text.split(",") if s.strip()]
            if is_natural_sentence_with_commas(segments):
                candidates = [text]
            else:
                candidates = segments

        # 5. Fallback: treat whole text as a single description
        if not candidates:
            candidates = [text]
    else:
        candidates = [str(raw_input)]

    # Clean and validate candidate descriptions
    cleaned = [desc.strip() for desc in candidates if isinstance(desc, str) and desc.strip()]

    if not cleaned:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one non-empty description."
        )

    if len(cleaned) < settings.MIN_DESCRIPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Provide at least {settings.MIN_DESCRIPTIONS} description."
        )

    if len(cleaned) > settings.MAX_DESCRIPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.MAX_DESCRIPTIONS} descriptions are allowed."
        )

    for item in cleaned:
        if len(item) < settings.MIN_DESCRIPTION_LENGTH or len(item) > settings.MAX_DESCRIPTION_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Each description must be between {settings.MIN_DESCRIPTION_LENGTH} and {settings.MAX_DESCRIPTION_LENGTH} characters."
            )

    return cleaned
