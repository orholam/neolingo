# Dadjo (Dar Daju Daju) — rough grammar sketch

**Status:** living inferred model (dictionary + examples + speaker/learner notes).  
**Evidence base:**

- DJC Dadjo–English Dictionary (2011) → `dadjo_dictionary.jsonl`
- Extracted examples → `dadjo_examples.jsonl`
- Learner/speaker notes (this chat) — pronoun charts, tense rule, conjugations, `ki` musings
- Background: [Myers Daju linguistics](https://rmyers754.wixsite.com/website/daju-linguistics), Aviles MA thesis, Palayer *Grammaire du dadjo d'Eref*, [OLAC djc](http://www.language-archives.org/language/djc)

Confidence: **high** / **medium** / **low** / **conflict** (sources disagree or notes disagree with themselves).

---

## 0. Reconciliation with your notes (read this first)

### Confirmed (notes ↔ sketch ↔ corpus)

| Your note | Verdict |
|-----------|---------|
| Subject pronouns `na ni ma~am ce koka oska/kona oŋa sa` | **Confirmed.** Also `ac` ~ `ce` in examples (`ac meesi`, `ac ndubpi`). |
| Dual / excl / incl “we” | **Confirmed** in dict + examples (`koka`, `oska`, `kona`). |
| Indirect objects `taŋga tiŋga tuma tice toka tiska tona tisa` | **Confirmed.** |
| Relative `me` (`Na ori yewe me ayi`) | **Confirmed.** |
| Phrases: `Awille na sogi ma wa koroni na sogo tiro`, `Am legeyi taŋga`, `Na turo niŋga`, `Na ki yagi wadaŋge`, `Kine ayi ki ori naŋga`, `Aŋgi aŋgala?` | **All in corpus** (name question written `Aŋgi aŋgala?` in dict). |
| Possessive **suffixes** (not separate “my/your” words) | **Confirmed.** |
| SVO | **Confirmed.** |
| Infinitive-like `-ke`; finite vowel swap | **Confirmed.** |
| `sogo`/`sogi` ≈ have / do / there is | **Confirmed** (`sogke` “to have, to do, to render”). |
| `tiro` negation | **Confirmed.** |
| `ki` = LOC *and* irrealis particle | **Confirmed** (same wording in DJC dict as in your notes). |
| Core vocab (`ure/urge`, `yewe`, `abba`, `aya`, `wadan̰ce`, `kine/kiŋge`, `awille`, `turke`→`turo`, `isaske`→`isi`) | **Confirmed** (minor spelling: dog is dict `iise`, you `Iisa`). |

### Added from your notes (not solid in my first pass)

1. **Tense rule (big upgrade):** for many `-ke` verbs, present ≈ replace with `-e/-o`; past ≈ `-i`. This was my largest open question; your notes + Aviles-style length pairs make it the working default.
2. **Vowel-length minimal pairs** (sharpen/throw away, drink/cough, etc.) — phonemic length matters; sketch now records this.
3. **Fuller non-singular verb endings** from your conjugation grid: excl `-ciga/-iga`, 2pl `-cini/-ini`, 3pl often `-ca` (with `as`) vs bare present (with `sa`) — **medium**, paradigm practice > corpus density.
4. **Possessive suffix chart** (`-aŋga -iŋga -uma/-ice -ska -oka -ona -oŋa -isa`) — richer than kin-only notes I had.
5. **Object-pronoun plurals** aligning with subject forms (`oska/koka/kona/oŋa/sa`) — see conflicts.
6. **Plural relative `meŋ`.**
7. **Pronunciation:** hooked y (`ƴ`) ≈ glottal stop (matches Myers/Palayer discussion of `ʔ`).
8. **Art Aviles:** `ki` + present can mean wish/desire (`na ki oso ki sugne…` “I would like to go…”).
9. **Dialect backdrop:** Mongo / Eref / Bardangal; Palayer Eref negation particle reported as `ro` (vs our `tiro`) — don’t flatten dialects.

### Conflicts / tensions

1. **`ki` + desire vs `win̰e`** — not a hard conflict. Best current synthesis:
   - `ki` before a **past-shaped** verb → future (`na ki osi…` “I will go”)
   - `ki` before a **present-shaped** verb → irrealis: conditional / wish (`na ki oso…` “I would go / would like to go” per Aviles)
   - `win̰e` is the lexical verb “want/need”
   - They **stack**: `Na ki win̰e ki osi ki sugne` = irrealis + want + go + LOC market → “I would like to go to the market”
   - So Art isn’t necessarily outdated; dropping `win̰e` just leaves bare irrealis-desire. Still confusing in practice — keep examples tagged.
2. **`ki` also = preposition `for`:** `Watiri ani ki naŋga` “that car is for me” — **confirmed in dict**. So `ki` senses: (a) at/in/to, (b) for, (c) irrealis particle.
3. **Inside your vowel-length table:** Verb B `na uro` is glossed “I drank” and `na uri` also “I drank”. Almost certainly a slip — your conjugation grid correctly treats `na uro` as present “I drink” and implies past `na uri`. **Prefer the conjugation grid.**
4. **2pl indirect object:** your chart `toŋa` vs dictionary note `tiŋa`. **Conflict — keep both flagged.**
5. **2pl direct object:** your chart `oŋa` (same as subject) vs dictionary `niŋa`. **Conflict — keep both flagged.**
6. **Husband/wife compounds:** you `yewe-ure` = husband; dict `ure-yewe` = wife. Likely complementary compounds, not a outright error — record both.
7. **`ayke`:** dict “to reach”; you also hear “come”. Finite `ayi` is glossed “came” all over the corpus. **Working stance:** lemma gloss “reach”; discourse function often “arrive/come.”
8. **Dictionary free English tense** is sloppy (`Na uro` “I am drinking”, `Na too` “I stopped”). Prefer your morphological tense rule over DJC example tense labels when they clash.
9. **3sg `ma` vs `am`, `ce` vs `ac`:** same pronouns via **metathesis** (CV ↔ VC). Aviles: no particular grammatical function; varies by speaker.

---

## 1. Snapshot

Dadjo is **SVO**, with:

- independent subject pronouns (incl. dual + incl/excl we)
- separate **direct** vs **indirect** object pronoun sets
- **possessive suffixes** on the possessed noun
- verbs cited mostly in `-ke` (and related) “infinitive” shapes
- **present `-e/-o` vs past `-i`** as the working tense split for the main class
- **`tiro`** negation (Mongo/DJC data)
- multifunctional **`ki`** (LOC / for / irrealis)

---

## 2. Pronouns

### 2.1 Subject pronouns (**high**; chart from your notes)

| | Singular | Dual | Plural |
|--|----------|------|--------|
| 1 | `na` | `koka` | `oska` (exclusive) · `kona` (inclusive) |
| 2 | `ni` | | `oŋa` |
| 3 | `ma` ~ `am` (masc) · `ce` ~ `ac` (fem) | | `sa` (~ `as`) |

**`ma`~`am` / `ce`~`ac`:** same pronouns via metathesis (CV ↔ VC). Aviles: no particular grammatical function; varies by speaker.

### 2.2 Direct object (**high** sg; **medium/conflict** pl)

| | Non-plural | Plural |
|--|------------|--------|
| 1 | `naŋga` | `oska` (notes) |
| 1+ | `koka` (notes: dual) | `kona` (notes: inclusive) |
| 2 | `niŋga` | notes: `oŋa` · dict: `niŋa` **conflict** |
| 3 | `ma`~`am` (masc) · `ce`~`ac` (fem) | `sa` |

Dict also lists suffixal DO markers `-ma` (masc) / `-ce` (fem).

### 2.3 Indirect object (`t-` series) (**high**; 2pl conflict)

| | Non-plural | Plural |
|--|------------|--------|
| 1 | `taŋga` | `tiska` (exclusive) |
| 1+ | `toka` (dual) | `tona` (inclusive) |
| 2 | `tiŋga` | notes: `toŋa` · dict: `tiŋa` **conflict** |
| 3 | `tuma` (masc) · `tice` (fem) | `tisa` |

Built on prep `ti` / `t-` “to, towards”.

### 2.4 Relatives (**high**)

- `me` — singular “who/that/the one” — `Na ori yewe me ayi`
- `meŋ` — plural (your notes; thinner in extracted examples)

### 2.5 Interrogatives / demonstratives (**high**)

`ani` this · `aani` that · `aŋgala` who · `allo` which · `aŋasi` how · `tira` (what) place · `kor` sentence-initial yes/no Q · `Aŋgi aŋgala?` “What’s your name?”

---

## 3. Clause structure

### 3.1 Word order (**high**)

`SUBJ  V  (DO)  (IO)  (ki NP…)`

```
Na turo niŋga              I love you
Am legeyi taŋga            He spoke to me
Na ori yewe me ayi         I saw the man who came
Ni ori ure me na ori       You saw the woman that I saw
Kine ayi ki ori naŋga      Someone came to see me
```

### 3.2 Useful connectors (**medium–high**)

| Form | Role |
|------|------|
| `wa` | and (also stative verbal `-wa`) |
| `kan` | if |
| `ode-me` | when |
| `ascan` | because |
| `way ani` | therefore / because of that |
| `wala` | or / nor |
| `lakin` | but (likely Arabic loan) |
| `awille` | before / previously |
| `koroni` | now / presently (in your phrase) |

Your literal vs free gloss pair is a good template:

> `Awille na sogi ma, wa koroni na sogo tiro`  
> lit. Previously I had it, and presently I have nothing  
> free. I had it before, but now I don’t

### 3.3 Negation (**high**)

`tiro` after the negated predicate: `sogo tiro`, `si tiro`, `jale tiro`…

Dialect note: Palayer’s Eref materials reportedly use final `ro`; don’t assume identity with DJC `tiro`.

---

## 4. Verbs

### 4.1 Citation shapes (**high** — Aviles)

Underlying infinitive is **`-ke`**. Surface dictionary endings are mostly `-ke` plus voicing and/or extensions:

| Surface | Analysis |
|---------|----------|
| `-ke` | basic infinitive |
| `-ge` | often voiced `-ke` |
| `-diŋge` | reflexive/reciprocal `-din` + `-ke` |
| `-aske` | punctual `-as` + `-ke` |
| `-ayge` etc. | derived / loan-class morphology (+ voicing) |

Aviles’s six **verb classes** are about conjugation/aspect/reflexive allomorphs (e.g. class 5/6 finite `-wa`), not six unrelated infinitive suffixes.

### 4.2 Tense for main class (**high**)

| Form | Morphology | Example |
|------|------------|---------|
| Infinitive / citation | stem + `-ke` | `urke` drink · `wedke` walk · `sogke` have/do |
| Present | stem + `-e`, or **`-o` after stem `/o,u/`** | `na wede` · `na uro` · `na oso` · `na sogo` |
| Non-present | stem + `-i` (often “past” in English) | `na uri` · `isi` · `ayi` · `legeyi` · `sogi` |

Present `-e` vs `-o` is **vowel harmony**, not person agreement (`na uro` / `ni uro` / `ma uro` share the vowel).

**Vowel length** is contrastive and can distinguish verbs (and interacts with tone in Aviles’s pairs):

| Long | Gloss | Short | Gloss |
|------|-------|-------|-------|
| `aake`? / `na aale` | sharpen | `alke` / `na ale` | throw away |
| `uurke` / `na uuro` | cough | `urke` / `na uro` | drink |
| `meeske` / `na meese` | lose | `meske` / `na mese` | have intercourse |
| … | | | |

(Use your full length table as canonical; orthography in the DJC PDF sometimes under-marks length.)

### 4.3 Person/number on the verb (**medium** — your practice grid + some corpus)

Singular persons usually: **pronoun + bare present/past stem** (no extra agreement).

Non-singular often adds suffixes (shapes vary by stem; your buy/have/eat/sell/go/drink grid is the best current map):

| Person | Typical mark (from your grid) | Go example |
|--------|-------------------------------|------------|
| 1excl `oska` | `-ciga` / `-iga` | `oska osiga` |
| 2pl `oŋa` | `-cini` / `-ini` | `oŋa osini` |
| 3pl `sa` / `as` | bare present **or** `-ca` | `sa oso` / `as osa` · drink `saa urca?` |
| 1incl `kona` | `-ina` / `-cina` (corpus) | `osina`, `wiŋcina` |
| 1dual `koka` | `-ik` (corpus) | `osik`, `wiŋcik` |

Inclusive/dual cells are stronger in the dictionary examples than in your pasted grid (your grid’s “We” column is exclusive `oska`). Keep both.

### 4.4 Reflexive / reciprocal `-diŋge` (**high**)

Finite often `-wa`: `ɗaywa`, `koriwa`, `ndugwa`, `ulwa`…

### 4.5 `ki` — the heavy one (**high** polysemy; semantics still fuzzy at edges)

Treat as **one form, several jobs**:

| Job | Environment | Example |
|-----|-------------|---------|
| Locative/directional prep | before NP | `Na oso ki sugne` — go **to** market |
| Benefactive / “for” | before NP (esp. pronoun) | `Watiri ani ki naŋga` — car **for** me |
| Irrealis → **future** | before **past-shaped** verb | `Na ki osi…` — I **will** go |
| Irrealis → **conditional / wish** | before **present-shaped** verb | `Na ki oso…` — I **would** go / would like to go (Aviles) |
| Stacks with want | `ki` + `win̰e` + `ki` + V | `Na ki win̰e ki osi ki sugne` — I would like to go to the market |

Your confusion is warranted: dictionary wording (“past participle / present participle”) is European grammar projected onto Dadjo stems. Operationally, **match the stem shape** (`osi` vs `oso`), not Latin participle labels.

`ka` remains separate: “of / belonging to” for **plural** possessum (`Tukke ka Ali`). Singular possessum linker is often `na`.

### 4.6 Seed conjugation grid (from your notes; orthography normalized loosely)

Present-oriented practice:

| Person | Buy | Have | Eat | Sell | Go | Drink |
|--------|-----|------|-----|------|----|-------|
| I | na ŋgan̰e | na sogo | na sie | na ɗewie? | na oso | na uro |
| you sg | ni ŋgan̰e | ni sogo | ni sie | ni ɗewie? | ni oso | ni uro |
| he | ma ŋgan̰e | ma sogo | ma sie | ma ɗewie? | ma oso | ma uro (~ am urca?) |
| she | ce ŋgan̰e | ce sogo | ce sie | ce ɗewie? | ce oso | ce uro (~ ac urca?) |
| we excl | oska ŋganciga | oska sokciga | oska siciga | oska ɗewiciga | oska osiga | oska urciga |
| you pl | oŋa ŋgancini? | oŋa sokcini | oŋa sicini | oŋa ɗewicini | oŋa osini | oŋa urcini |
| they | sa ŋgan̰e / as ŋganca | sa sogo | sa sie / as siaca | sa ɗewie / as ɗewica | sa oso / as osa | ? urca |

Dict lemmas to anchor: `ŋgan̰ke` buy · `sogke` have/do · `ososke` go · `urke` drink · `ɗeweyge` sell · eat family `siyake` / soft-eat (your `sie`).

---

## 5. Possession (**high** chart from notes; kin extras from dict)

### 5.1 Possessive pronominal suffixes

| | Non-plural | Plural |
|--|------------|--------|
| 1 | `-aŋga` (my) | `-ska` (our excl-ish) |
| 1+ | `-oka` (dual our) | `-ona` (inclusive our) |
| 2 | `-iŋga` (your sg) | `-oŋa` (your pl) |
| 3 | `-uma` masc · `-ice` fem | `-isa` their |

Examples: `yewice` her husband · `watiraŋga` my car · `labinaŋga` my work · `poskiŋga` your help.

Kin citation paradigms (`ɓo-` mother, `me-` father) use the same person categories with stem-specific packaging (`ɓoska`, `ɓoskoka`, `ɓoŋa`, `ɓosa`…).

### 5.2 Linkers

- `na` — of/for when possessum is singular
- `ka` — of/for when possessum is plural

---

## 6. Vocabulary checkpoints (your list vs dict)

| Your form | Dict / corpus | Notes |
|-----------|---------------|-------|
| Iisa dog | `iise` (pl `iisge`) | length/orthography |
| jamne elder | `jamne` | ✓ |
| ure / urge | ✓ | ✓ |
| yewe / yuwge | `yewe` (check pl in dict) | ✓ sg |
| abba / abbiŋge | ✓ | ✓ |
| aya / ayiŋge | ✓ | ✓ |
| uruma wife | ✓ (also `ure-yewe` wife) | |
| yewe-ure husband | not as headword; complementary to `ure-yewe`? | keep |
| mami??? | no clear hit (`hamami` = pigeon) | still unknown |
| wadan̰ce / wadaŋge | ✓ guest/stranger | ✓ |
| kine / kiŋge | ✓ someone/person | ✓ |
| ayke reach (~come?) | `ayke` reach; `ayi` often “came” | dual gloss in use |
| awille before | ✓ | ✓ |
| turke → turo present | ✓ | past expected `turi` |
| isaske → isi past | ✓ “give/serve”; ex `Ediska isi taŋga…` | present likely `iso`/`ise`? unverified |
| sog(o)/(i) have/do | `sogke` | ✓ both faire & avoir |

---

## 7. Phonology crumbs

- **Hooked y `ƴ`:** glottal stop (your note; Myers cites Palayer/`ʔ`, also Annie Myers Mongo data).
- **Vowel length:** phonemic; can be lexical (verb pairs) and, per Aviles, grammatical (spatial/temporal distance) — needs more controlled data.
- **Tone:** present in analyses; Aviles pairs mark H/L patterns; Myers: few/no clean tone minimal pairs yet — don’t teach tone as if solved.
- **Implosives / specials:** `ɓ ɗ ɲ ŋ ƴ` etc. matter; Arabic loans bring `z`, `h`.

---

## 8. Practical generation rules (updated)

1. `SUBJ + Vpresent/past + (DO) + (IO)`
2. Present: stem + `-e` (→ `-o` after stem `o/u`)
3. Non-present: stem + `-i`
4. Love you: `Na turo niŋga`
5. Spoke to me: `Am legeyi taŋga` (past `-i` on a non-`ke`-only stem family)
6. Relative: `N me VP`
7. Future: `SUBJ ki Vpast-shape …`
8. Wish/would: `SUBJ ki Vpresent-shape …` (optionally + `win̰e`)
9. LOC/for: `ki NP` / `ki naŋga`
10. Negate: `… tiro`
11. Have: `Na sogo N` · lack: `Na sogo tiro`

---

## 9. Still open

1. Exact conditioning of present `-e` vs `-o`
2. Full inclusive/dual/3pl grids for many verbs
3. Resolve `toŋa` vs `tiŋa`, `oŋa` vs `niŋa` DO
4. When speakers choose `ma` vs `am`, `ce` vs `ac`, `sa` vs `as`
5. Whether `sogi` is past of `sogo` (your phrase `na sogi ma` “I had it” vs `na sogo tiro` “I don’t have” — **looks like yes**, and matches past `-i`)
6. Audio-driven cleanup of length/tone (your Drive recordings)
7. Eref vs Mongo grammatical differences (`ro` vs `tiro`, question particle `wa` in some notes)

---

## 10. Source links

- Myers site: https://rmyers754.wixsite.com/website/daju-linguistics
- OLAC DJC: http://www.language-archives.org/language/djc
- SIL PDF (same DJC dict): https://www.sil.org/system/files/reapdata/11/94/83/119483414516771249957569339202557527152/DJC_Dico_dadjo_anglais_2011.pdf
- Local PDF: `ETL_scripts/input_pdf/Dadjo-English-Dictionary-2011.pdf`
- Audio (Drive): https://drive.google.com/file/d/1PyUUzIACV1t8diGunmr1Fk2fuC1yaAHk/view

---

*Prefer attested cells over analogy. When notes and DJC disagree, keep both and tag **conflict** until a speaker or thesis example decides.*
