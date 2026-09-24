#!/usr/bin/env python3
"""Rewrite glosses in koreanDictionary.jsonl with short, natural English meanings."""

import json
import re
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parent.parent
DICT_PATH = ROOT / 'src/data/koreanDictionary.jsonl'

_translator = GoogleTranslator(source='ko', target='en')

# Curated glosses where flashcard wording differs from raw machine output.
GLOSS_OVERRIDES = {
    '것': 'thing',
    '하다': 'to do',
    '있다': 'to exist; to have',
    '없다': 'to not exist; to lack',
    '이다': 'to be',
    '되다': 'to become',
    '안': 'not (negation)',
    '별로': 'not really; not particularly',
    '시청': 'city hall',
    '부산': 'Busan',
    '대구': 'Daegu',
    '광주': 'Gwangju',
    '인천': 'Incheon',
    '대전': 'Daejeon',
    '울산': 'Ulsan',
    '제주': 'Jeju',
    '서울': 'Seoul',
    '불고기': 'bulgogi',
    '고추장': 'gochujang',
    '김치': 'kimchi',
    '비빔밥': 'bibimbap',
    '라면': 'ramen',
    '떡': 'rice cake',
    '송편': 'songpyeon',
    '순서': 'order; sequence',
    '아이': 'child',
    '누나': 'older sister (for males)',
    '오빠': 'older brother (for females)',
    '형': 'older brother (for males)',
    '언니': 'older sister (for females)',
    '동생': 'younger sibling',
    '할아버지': 'grandfather',
    '할머니': 'grandmother',
    '아버지': 'father',
    '어머니': 'mother',
    '남편': 'husband',
    '아내': 'wife',
    '친구': 'friend',
    '사람': 'person',
    '선생님': 'teacher',
    '학생': 'student',
    '공무원': 'public official',
    '경찰': 'police officer',
    '의사': 'doctor',
    '간호사': 'nurse',
    '가수': 'singer',
    '아나운서': 'TV/radio announcer',
    '회사원': 'office worker',
    '손님': 'guest; customer',
    '이름': 'name',
    '나라': 'country',
    '세계': 'world',
    '학교': 'school',
    '병원': 'hospital',
    '은행': 'bank',
    '공원': 'park',
    '시장': 'market',
    '가게': 'shop; store',
    '백화점': 'department store',
    '편의점': 'convenience store',
    '화장실': 'restroom',
    '집': 'house; home',
    '방': 'room',
    '부엌': 'kitchen',
    '거실': 'living room',
    '화장실': 'restroom',
    '계단': 'stairs',
    '문': 'door',
    '창문': 'window',
    '책': 'book',
    '연필': 'pencil',
    '공책': 'notebook',
    '가방': 'bag',
    '우산': 'umbrella',
    '시계': 'clock; watch',
    '돈': 'money',
    '카드': 'card',
    '열쇠': 'key',
    '전화': 'telephone; phone call',
    '컴퓨터': 'computer',
    '텔레비전': 'television',
    '사진': 'photo',
    '음악': 'music',
    '영화': 'movie',
    '뉴스': 'news',
    '신문': 'newspaper',
    '편지': 'letter',
    '이메일': 'email',
    '물': 'water',
    '밥': 'rice; meal',
    '빵': 'bread',
    '고기': 'meat',
    '생선': 'fish',
    '채소': 'vegetable',
    '과일': 'fruit',
    '사과': 'apple',
    '바나나': 'banana',
    '포도': 'grape',
    '수박': 'watermelon',
    '우유': 'milk',
    '커피': 'coffee',
    '차': 'tea',
    '주스': 'juice',
    '맥주': 'beer',
    '소주': 'soju',
    '설탕': 'sugar',
    '소금': 'salt',
    '후추': 'pepper',
    '기름': 'oil',
    '국': 'soup',
    '찌개': 'stew',
    '반찬': 'side dish',
    '숟가락': 'spoon',
    '젓가락': 'chopsticks',
    '접시': 'plate',
    '컵': 'cup',
    '옷': 'clothes',
    '바지': 'pants',
    '치마': 'skirt',
    '셔츠': 'shirt',
    '신발': 'shoes',
    '양말': 'socks',
    '모자': 'hat',
    '코트': 'coat',
    '색': 'color',
    '빨간색': 'red',
    '파란색': 'blue',
    '노란색': 'yellow',
    '하얀색': 'white',
    '검은색': 'black',
    '하나': 'one',
    '둘': 'two',
    '셋': 'three',
    '넷': 'four',
    '다섯': 'five',
    '여섯': 'six',
    '일곱': 'seven',
    '여덟': 'eight',
    '아홉': 'nine',
    '열': 'ten',
    '첫째': 'first',
    '둘째': 'second',
    '오늘': 'today',
    '내일': 'tomorrow',
    '어제': 'yesterday',
    '아침': 'morning',
    '점심': 'lunch; noon',
    '저녁': 'evening; dinner',
    '밤': 'night',
    '시간': 'time; hour',
    '분': 'minute',
    '초': 'second',
    '년': 'year',
    '월': 'month',
    '일': 'day',
    '주': 'week',
    '월요일': 'Monday',
    '화요일': 'Tuesday',
    '수요일': 'Wednesday',
    '목요일': 'Thursday',
    '금요일': 'Friday',
    '토요일': 'Saturday',
    '일요일': 'Sunday',
    '봄': 'spring',
    '여름': 'summer',
    '가을': 'autumn; fall',
    '겨울': 'winter',
    '날씨': 'weather',
    '비': 'rain',
    '눈': 'snow',
    '바람': 'wind',
    '구름': 'cloud',
    '햇볕': 'sunshine',
    '덥다': 'to be hot',
    '춥다': 'to be cold',
    '따뜻하다': 'to be warm',
    '시원하다': 'to be cool; refreshing',
    '크다': 'to be big',
    '작다': 'to be small',
    '길다': 'to be long',
    '짧다': 'to be short',
    '높다': 'to be high; tall',
    '낮다': 'to be low',
    '넓다': 'to be wide',
    '좁다': 'to be narrow',
    '무겁다': 'to be heavy',
    '가볍다': 'to be light (weight)',
    '많다': 'to be many; much',
    '적다': 'to be few; little',
    '빠르다': 'to be fast',
    '느리다': 'to be slow',
    '쉽다': 'to be easy',
    '어렵다': 'to be difficult',
    '좋다': 'to be good',
    '나쁘다': 'to be bad',
    '예쁘다': 'to be pretty',
    '멋있다': 'to be cool; stylish',
    '재미있다': 'to be fun; interesting',
    '지루하다': 'to be boring',
    '바쁘다': 'to be busy',
    '피곤하다': 'to be tired',
    '아프다': 'to be sick; to hurt',
    '건강하다': 'to be healthy',
    '배고프다': 'to be hungry',
    '목마르다': 'to be thirsty',
    '행복하다': 'to be happy',
    '슬프다': 'to be sad',
    '화나다': 'to be angry',
    '무섭다': 'to be scary; afraid',
    '조용하다': 'to be quiet',
    '시끄럽다': 'to be noisy',
    '깨끗하다': 'to be clean',
    '더럽다': 'to be dirty',
    '맞다': 'to be correct',
    '틀리다': 'to be wrong',
    '같다': 'to be the same',
    '다르다': 'to be different',
    '가다': 'to go',
    '오다': 'to come',
    '오르다': 'to go up; climb',
    '내리다': 'to go down',
    '들어가다': 'to enter',
    '나가다': 'to exit; go out',
    '돌아가다': 'to return; go back',
    '걷다': 'to walk',
    '뛰다': 'to run',
    '앉다': 'to sit',
    '서다': 'to stand',
    '자다': 'to sleep',
    '일어나다': 'to wake up; get up',
    '보다': 'to see; watch',
    '듣다': 'to listen; hear',
    '말하다': 'to speak; say',
    '읽다': 'to read',
    '쓰다': 'to write; use',
    '배우다': 'to learn',
    '가르치다': 'to teach',
    '공부하다': 'to study',
    '일하다': 'to work',
    '쉬다': 'to rest',
    '놀다': 'to play; hang out',
    '운동하다': 'to exercise',
    '수영하다': 'to swim',
    '요리하다': 'to cook',
    '먹다': 'to eat',
    '마시다': 'to drink',
    '사다': 'to buy',
    '팔다': 'to sell',
    '주다': 'to give',
    '받다': 'to receive',
    '보내다': 'to send',
    '가져가다': 'to take (away)',
    '가져오다': 'to bring',
    '열다': 'to open',
    '닫다': 'to close',
    '켜다': 'to turn on',
    '끄다': 'to turn off',
    '만들다': 'to make',
    '시작하다': 'to start',
    '끝나다': 'to end',
    '도와주다': 'to help',
    '기다리다': 'to wait',
    '만나다': 'to meet',
    '전화하다': 'to call (on the phone)',
    '이야기하다': 'to talk; tell',
    '생각하다': 'to think',
    '알다': 'to know',
    '모르다': 'to not know',
    '기억하다': 'to remember',
    '잊다': 'to forget',
    '좋아하다': 'to like',
    '싫어하다': 'to dislike',
    '사랑하다': 'to love',
    '원하다': 'to want',
    '필요하다': 'to need',
    '살다': 'to live',
    '죽다': 'to die',
    '태어나다': 'to be born',
    '웃다': 'to laugh; smile',
    '울다': 'to cry',
    '입다': 'to wear',
    '벗다': 'to take off (clothes)',
    '씻다': 'to wash',
    '샤워하다': 'to shower',
    '청소하다': 'to clean',
    '빨래하다': 'to do laundry',
    '설거지하다': 'to wash dishes',
    '안녕하세요': 'hello',
    '안녕히 가세요': 'goodbye (to person leaving)',
    '안녕히 계세요': 'goodbye (to person staying)',
    '감사합니다': 'thank you',
    '죄송합니다': 'sorry; excuse me',
    '괜찮아요': "it's okay; I'm fine",
    '네': 'yes',
    '아니요': 'no',
}


def normalize_gloss(gloss, pos):
    gloss = re.sub(r'\s+', ' ', (gloss or '').strip())
    if not gloss:
        return gloss

    if gloss[0].isupper() and gloss not in GLOSS_OVERRIDES.values():
        gloss = gloss[0].lower() + gloss[1:]

    if pos == 'v' and not gloss.startswith('to '):
        gloss = f'to {gloss}'
    elif pos == 'adj' and not gloss.startswith('to be ') and not gloss.startswith('to '):
        gloss = f'to be {gloss}'

    return gloss


def translate_gloss(headword, pos, cache):
    if headword in GLOSS_OVERRIDES:
        return GLOSS_OVERRIDES[headword]
    if headword in cache:
        return cache[headword]

    try:
        gloss = normalize_gloss(_translator.translate(headword), pos)
    except Exception as err:
        print(f'  failed {headword!r}: {err}')
        gloss = headword

    cache[headword] = gloss
    time.sleep(0.025)
    return gloss


def main():
    entries = [
        json.loads(line)
        for line in DICT_PATH.read_text(encoding='utf-8').splitlines()
        if line.strip()
    ]
    print(f'Updating {len(entries)} entries…')

    cache = {}
    for i, entry in enumerate(entries, 1):
        pos = entry.get('part_of_speech')
        entry['senses'] = [translate_gloss(entry['headword'], pos, cache)]
        if i % 100 == 0 or i == len(entries):
            print(f'  {i}/{len(entries)}')

    with DICT_PATH.open('w', encoding='utf-8') as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print('Done.')
    for sample in ('순서', '소', '가구', '관계', '가득', '하다'):
        match = next(e for e in entries if e['headword'] == sample)
        print(f'  {sample}: {match["senses"][0]}')


if __name__ == '__main__':
    main()
