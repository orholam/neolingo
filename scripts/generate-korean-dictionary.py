#!/usr/bin/env python3
"""Build koreanDictionary.jsonl with 1000 beginner words and short English glosses."""

import ast
import json
import re
import time
from pathlib import Path

from datasets import load_dataset
from deep_translator import GoogleTranslator
from hangul_romanize import Transliter
from hangul_romanize.rule import academic

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / 'src/data/koreanDictionary.jsonl'

_translit = Transliter(academic)
_translator = GoogleTranslator(source='ko', target='en')

POS_MAP = {
    '명사': 'n',
    '동사': 'v',
    '형용사': 'adj',
    '부사': 'adv',
    '대명사': 'pron',
    '수사': 'num',
    '관형사': 'det',
    '감탄사': 'int',
    '조사': 'part',
    '접사': 'suffix',
    '의존 명사': 'n',
    '보조 동사': 'v',
    '보조 형용사': 'adj',
    '어미': 'ending',
}
SKIP_POS = {'suffix', 'part', 'ending', '접사', '조사', '어미'}

# Manual fixes where machine translation is awkward for flashcards.
GLOSS_OVERRIDES = {
    '하다': 'to do',
    '있다': 'to exist; to have',
    '없다': 'to not exist',
    '이다': 'to be',
    '되다': 'to become',
    '별로': 'not really',
    '시청': 'city hall',
    '부산': 'Busan',
    '대구': 'Daegu',
    '광주': 'Gwangju',
    '불고기': 'bulgogi',
    '고추장': 'gochujang',
    '라면': 'ramen',
}


def romanize(word: str) -> str:
    try:
        return _translit.translit(word)
    except Exception:
        return word


def parse_list_field(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return []
        try:
            parsed = ast.literal_eval(value)
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except Exception:
            pass
        return [value]
    return [str(value)]


def normalize_gloss(gloss, pos):
    gloss = re.sub(r'\s+', ' ', (gloss or '').strip())
    if not gloss:
        return gloss

    gloss = gloss[0].lower() + gloss[1:] if len(gloss) > 1 else gloss.lower()

    if pos == 'v' and not gloss.startswith('to '):
        gloss = f'to {gloss}'
    elif pos == 'adj' and not gloss.startswith('to be ') and not gloss.startswith('to '):
        gloss = f'to be {gloss}'

    return gloss


def translate_headword(word, pos, cache):
    if word in GLOSS_OVERRIDES:
        return GLOSS_OVERRIDES[word]
    if word in cache:
        return cache[word]

    try:
        gloss = normalize_gloss(_translator.translate(word), pos)
    except Exception as err:
        print(f'  translate failed for {word!r}: {err}')
        gloss = word

    cache[word] = gloss
    time.sleep(0.03)
    return gloss


def collect_entries():
    print('Loading NIKL dataset…')
    ds = load_dataset('binjang/NIKL-korean-english-dictionary', split='train')

    rows = []
    seen = set()

    for row in ds:
        if row.get('Vocabulary Level') != '초급':
            continue

        form = (row.get('Form') or '').strip()
        if not form or form in seen or form.startswith('-'):
            continue

        pos_raw = (row.get('Part of Speech') or '').strip()
        pos = POS_MAP.get(pos_raw, pos_raw or None)
        if pos in SKIP_POS or pos_raw in SKIP_POS:
            continue

        rows.append((form, pos, row))
        seen.add(form)
        if len(rows) >= 1000:
            break

    return rows


def main():
    rows = collect_entries()
    print(f'  selected {len(rows)} beginner words')

    gloss_cache = {}
    entries = []

    for i, (form, pos, row) in enumerate(rows, 1):
        gloss = translate_headword(form, pos, gloss_cache)
        if i % 100 == 0 or i == len(rows):
            print(f'  translated {i}/{len(rows)}')

        examples = []
        for usage in parse_list_field(row.get('Usages'))[:2]:
            if isinstance(usage, list):
                examples.extend(str(x) for x in usage[:1])
            else:
                examples.append(str(usage))

        entry = {
            'headword': form,
            'part_of_speech': pos,
            'phonetic': romanize(form),
            'senses': [gloss],
            'examples': examples[:2],
            'notes': None,
            'source': 'NeoLingo Korean basic vocabulary',
        }

        category = row.get('Semantic Category')
        if category:
            entry['category'] = category

        entries.append(entry)

    entries.sort(key=lambda e: e['headword'])

    with OUT_PATH.open('w', encoding='utf-8') as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    lengths = [len(e['senses'][0]) for e in entries]
    print(f'Wrote {len(entries)} entries → {OUT_PATH}')
    print(f'  avg gloss length: {sum(lengths) / len(lengths):.1f} chars')
    for sample in ('순서', '소', '가구', '하다', '가르치다', '또는'):
        match = next((e for e in entries if e['headword'] == sample), None)
        if match:
            print(f'  {sample}: {match["senses"][0]}')


if __name__ == '__main__':
    main()
