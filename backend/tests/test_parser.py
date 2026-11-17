import pytest
from fastapi import HTTPException
from app.utils.parser import parse_descriptions, is_natural_sentence_with_commas


def test_parse_valid_json_array():
    result = parse_descriptions('["knife", "handgun", "robbery"]')
    assert result == ["knife", "handgun", "robbery"]


def test_parse_python_literal_list():
    result = parse_descriptions("['weapon', 'knife']")
    assert result == ["weapon", "knife"]


def test_parse_newline_separated():
    raw = "knife\nsecurity guard\npolice car"
    result = parse_descriptions(raw)
    assert result == ["knife", "security guard", "police car"]


def test_parse_comma_separated_keywords():
    raw = "knife, gun, police car"
    result = parse_descriptions(raw)
    assert result == ["knife", "gun", "police car"]


def test_preserve_natural_sentence_with_commas():
    # Sentences with commas and participles/dependent clauses must NOT be split
    raw1 = "a man in a black jacket, holding a knife"
    result1 = parse_descriptions(raw1)
    assert result1 == ["a man in a black jacket, holding a knife"]

    raw2 = "a person wearing a mask, running away from the building"
    result2 = parse_descriptions(raw2)
    assert result2 == ["a person wearing a mask, running away from the building"]

    raw3 = "in the alley, a suspect holding a weapon"
    result3 = parse_descriptions(raw3)
    assert result3 == ["in the alley, a suspect holding a weapon"]


def test_parse_single_description():
    raw = "a suspect entering the crime scene"
    result = parse_descriptions(raw)
    assert result == ["a suspect entering the crime scene"]


def test_parse_native_list():
    raw = ["knife", " gun ", ""]
    result = parse_descriptions(raw)
    assert result == ["knife", "gun"]


def test_empty_input_raises_400():
    with pytest.raises(HTTPException) as exc_info:
        parse_descriptions("")
    assert exc_info.value.status_code == 400

    with pytest.raises(HTTPException) as exc_info:
        parse_descriptions("   ")
    assert exc_info.value.status_code == 400

    with pytest.raises(HTTPException) as exc_info:
        parse_descriptions([])
    assert exc_info.value.status_code == 400


def test_too_many_descriptions_raises_400():
    too_many = [f"desc {i}" for i in range(25)]
    with pytest.raises(HTTPException) as exc_info:
        parse_descriptions(too_many)
    assert exc_info.value.status_code == 400
    assert "Maximum 20 descriptions" in exc_info.value.detail


def test_description_too_long_raises_400():
    too_long = "a" * 501
    with pytest.raises(HTTPException) as exc_info:
        parse_descriptions(too_long)
    assert exc_info.value.status_code == 400
