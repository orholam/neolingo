/**
 * Dadjo grammar cheat-sheet data for the in-app reference page.
 * DJC dictionary + examples + learner notes + Aviles (2008) morphology.
 */

export const dadjoGrammarReference = {
  id: 'dadjo',
  title: 'Dadjo grammar',
  subtitle: 'Cheat sheet for conjugations, pronouns, tense, verb endings, and the particle ki.',
  note: 'Living draft — Mongo/DJC-oriented. Verb morphology draws on Aviles (2008). Some plural pronoun forms still conflict across sources.',
  accent: 'amber',

  sections: [
    {
      id: 'basics',
      title: 'Quick rules',
      items: [
        { label: 'Word order', value: 'Subject – Verb – Object (SVO)' },
        { label: 'Infinitive', value: 'Underlyingly -ke for basically all verbs (surface -ge is often just voiced -ke)' },
        { label: 'Present', value: 'Stem + -e; becomes -o after stem vowels o/u (urke → uro, wedke → wede)' },
        { label: 'Non-present', value: 'Stem + -i (often past in free English: uri, isi, legeyi)' },
        { label: 'Negation', value: 'tiro after the predicate (na sogo tiro)' },
        { label: 'Have / there is', value: 'sogo / sogi (from sogke — have or do)' },
      ],
    },
    {
      id: 'subjects',
      title: 'Subject pronouns',
      columns: ['', 'Singular', 'Dual', 'Plural'],
      rows: [
        ['1st', 'na', 'koka', 'oska (excl.) · kona (incl.)'],
        ['2nd', 'ni', '—', 'oŋa'],
        ['3rd', 'ma ~ am (m) · ce ~ ac (f)', '—', 'sa (~ as)'],
      ],
      tip: 'ma~am and ce~ac are the same pronouns with consonant/vowel order swapped (metathesis). Aviles: no clear grammatical meaning — varies by speaker. Example: Am legeyi taŋga / Ma dumayi…',
    },
    {
      id: 'objects',
      title: 'Direct objects',
      columns: ['', 'Non-plural', 'Plural'],
      rows: [
        ['1st', 'naŋga', 'oska'],
        ['1st+', 'koka (dual)', 'kona (incl.)'],
        ['2nd', 'niŋga', 'oŋa (notes) · niŋa (dict)'],
        ['3rd', 'ma ~ am (m) · ce ~ ac (f)', 'sa'],
      ],
      tip: '2pl form conflicts across sources — both listed for now. 3sg object uses the same ma~am / ce~ac pair.',
    },
    {
      id: 'indirect',
      title: 'Indirect objects (to X)',
      columns: ['', 'Non-plural', 'Plural'],
      rows: [
        ['1st', 'taŋga', 'tiska (excl.)'],
        ['1st+', 'toka (dual)', 'tona (incl.)'],
        ['2nd', 'tiŋga', 'toŋa (notes) · tiŋa (dict)'],
        ['3rd', 'tuma (m) · tice (f)', 'tisa'],
      ],
      tip: 'Built on ti / t- “to, towards”. Example: Am legeyi taŋga — He spoke to me.',
    },
    {
      id: 'possessives',
      title: 'Possessive suffixes',
      blurb: 'Dadjo uses suffixes on the possessed noun (not separate “my/your” words).',
      columns: ['', 'Non-plural', 'Plural'],
      rows: [
        ['1st', '-aŋga (my)', '-ska (our excl.)'],
        ['1st+', '-oka (dual our)', '-ona (incl. our)'],
        ['2nd', '-iŋga (your sg)', '-oŋa (your pl)'],
        ['3rd', '-uma (m) · -ice (f)', '-isa (their)'],
      ],
      examples: [
        { text: 'watiraŋga', english: 'my car' },
        { text: 'yewice', english: 'her husband' },
        { text: 'labinaŋga', english: 'my work' },
      ],
      tip: 'Linkers: na = of/for (singular possessum); ka = of/for (plural), e.g. Tukke ka Ali.',
    },
    {
      id: 'nouns',
      title: 'Why nouns end in -ne / -ce / -re / …',
      blurb: 'Common nouns carry a singular “classificatory” suffix (Aviles Cs1–Cs4). This is not Bantu-style gender agreement — the ending is lexically chosen for each noun. Plural endings are a separate lexical choice.',
      columns: ['Surface', 'Underlying', 'Notes / examples'],
      rows: [
        ['-ne (most common)', 'Cs1 /-ne/', 'jamne elder · sugne market · kokine snake (often with epenthetic i)'],
        ['-ce', 'Cs2 /-ce/', 'culce charcoal · walce egg · abacce leaf'],
        ['-e', 'Cs3 /-e/', 'uke mouth · ure woman · soge road'],
        ['-i', 'Cs4 /-i/', 'Mostly Arabic loans: watiri car'],
        ['-re / -le / -ɲe', 'Usually still /-ne/', 'Assimilation: ber-ne → bere (slave), bel-ne → belle (razor), gaɲ-ne → gaɲɲe'],
        ['-ine / -ane…', 'Often root + -ne', 'Looks longer because of stem vowels / epenthesis, not a fifth class'],
        ['Plural -ge / -iŋge / -tige / -tiŋge', 'Cp1–Cp4', 'Independent of singular class: urge (women), abbiŋge (fathers), mortige (wells)'],
      ],
      tip: 'You cannot reliably predict -ne vs -ce from meaning. Memorize with the noun. DJC dictionary notes that label -ce/-e/-ne as “noun class markers” match these classificatory suffixes.',
    },
    {
      id: 'infinitives',
      title: 'Why -ke / -ge / -diŋge / -aske',
      blurb: 'Dictionary spellings look like many infinitive endings. Morphologically, the basic infinitive is -ke; other shapes are -ke plus sound change or a verb extension.',
      columns: ['Surface', 'What’s going on', 'Examples'],
      rows: [
        ['-ke', 'Basic infinitive', 'urke drink · wedke walk · sogke have'],
        ['-ge', 'Often still -ke, voiced after a voiced environment', 'damdamge · loan/reduplicated stems'],
        ['-diŋge', 'Reflexive/reciprocal extension -din + -ke (→ voiced)', 'ɗaydiŋge wash oneself · turdiŋge love each other'],
        ['-ziŋge', 'Related middle/reflexive family', 'wan̰jasziŋge turn oneself away'],
        ['-aske', 'Punctual extension -as + -ke (“once”)', 'kin̰jaske open once · isaske give'],
        ['-…daske / -tas-', 'Iterative / “repeatedly” extension family', 'aldaske throw repeatedly'],
        ['-ayge / -eyge', 'Often derived or loan-class morphology (+ voicing)', 'hanayge hope · ɗeweyge sell'],
      ],
      tip: 'Aviles: when -ke is separated from the root by an extension (e.g. -din), it is especially likely to voice to -ge. Finite reflexives often use -wa instead (ɗaywa, ndugwa).',
    },
    {
      id: 'tense',
      title: 'Tense & present -e/-o',
      columns: ['Form', 'Shape', 'Examples'],
      rows: [
        ['Citation', 'stem + -ke (≈ infinitive)', 'urke · turke · ososke · sogke · wedke'],
        ['Present', 'stem + -e, or -o after o/u in the stem', 'na wede · na uro · na turo · na oso · na sogo'],
        ['Non-present', 'stem + -i (often “past” in English glosses)', 'na uri · isi (gave) · ayi (came) · legeyi · sogi (had)'],
      ],
      tip: 'Aviles labels these present vs non-present (not strictly past). The -e→-o change is vowel harmony after stem /o,u/ — not person agreement and not random lexical choice.',
    },
    {
      id: 'classes',
      title: 'Verb classes (Aviles)',
      blurb: 'Six conjugation classes differ mainly in which tense/aspect/reflexive endings they take — not in having unrelated infinitive suffixes.',
      columns: ['Class sketch', 'Behavior', 'Sample'],
      rows: [
        ['Class 1 (majority)', 'Present -e/-o · non-present -i; takes most aspects', 'urke → uro / uri'],
        ['Class 2', 'Own present/non-present pattern (e.g. walk-type)', 'wedke → wede'],
        ['Class 3', 'Search-type conjugations', 'ŋgayge / ŋgan̰ke family'],
        ['Class 4', 'Short vowel-final roots (kill-type)', 'pake'],
        ['Class 5', 'Reflexive -din; finite often -wa', 'noldiŋge → nolwa; ɗaywa'],
        ['Class 6', 'Reflexive “kill oneself”-type; -wa throughout key forms', 'paydiŋge'],
      ],
      tip: 'Pedagogically: learn -ke infinitives + -e/-o present + -i non-present first; treat -diŋge/-wa as the reflexive track.',
    },
    {
      id: 'conjugations',
      title: 'Present conjugations',
      blurb: 'Practice grid (working forms). Inclusive/dual use different endings in corpus examples (osina, osik).',
      columns: ['Person', 'Buy', 'Have', 'Eat', 'Go', 'Drink'],
      rows: [
        ['I (na)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['You (ni)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['He (ma/am)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['She (ce/ac)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['We excl. (oska)', 'ŋganciga', 'sokciga', 'siciga', 'osiga', 'urciga'],
        ['You pl (oŋa)', 'ŋgancini', 'sokcini', 'sicini', 'osini', 'urcini'],
        ['They (sa/as)', 'ŋgan̰e / ŋganca', 'sogo', 'sie / siaca', 'oso / osa', 'urca?'],
      ],
      tip: 'Lemmas: ŋgan̰ke buy · sogke have · ososke go · urke drink. Singular persons share the same verb ending; person is in the pronoun.',
    },
    {
      id: 'ki',
      title: 'The particle ki',
      blurb: 'One form, several jobs — match stem shape, not Latin “participle” labels.',
      columns: ['Job', 'Environment', 'Example'],
      rows: [
        ['at / in / to', 'before a noun phrase', 'Na oso ki sugne — I go to the market'],
        ['for', 'before NP (esp. pronoun)', 'Watiri ani ki naŋga — that car is for me'],
        ['Future', 'before non-present-shaped verb', 'Na ki osi… — I will go'],
        ['Wish / would', 'before present-shaped verb', 'Na ki oso… — I would like to go'],
        ['Stacks with want', 'ki + win̰e + ki + V', 'Na ki win̰e ki osi ki sugne'],
      ],
      tip: 'win̰e already means want/need; ki does not replace it — they can stack for “would like to…”.',
    },
    {
      id: 'phrases',
      title: 'Useful phrases',
      phrases: [
        {
          text: 'Awille na sogi ma, wa koroni na sogo tiro',
          english: 'I had it before, but now I don’t',
          literal: 'Previously I had it, and presently I have nothing',
        },
        {
          text: 'Aŋgi aŋgala?',
          english: 'What’s your name?',
          literal: 'Name who/what?',
        },
        {
          text: 'Am legeyi taŋga',
          english: 'He spoke to me',
          literal: 'He spoke to-me',
        },
        {
          text: 'Na ori yewe me ayi',
          english: 'I saw the man who came',
        },
        {
          text: 'Ni ori ure me na ori',
          english: 'You saw the woman that I saw',
        },
        {
          text: 'Na ki yagi wadaŋge',
          english: 'I am going to have visitors',
        },
        {
          text: 'Kine ayi ki ori naŋga',
          english: 'Someone came to see me',
        },
        {
          text: 'Na turo niŋga',
          english: 'I love you',
        },
        {
          text: 'Na ki win̰e ki osi ki sugne',
          english: 'I would like to go to the market',
        },
        {
          text: 'Na ɗaywa',
          english: 'I washed myself',
          literal: 'Reflexive finite -wa from ɗaydiŋge',
        },
      ],
    },
    {
      id: 'connectors',
      title: 'Connectors & extras',
      items: [
        { label: 'wa', value: 'and (also verbal stative -wa: Na ndugwa)' },
        { label: 'kan', value: 'if' },
        { label: 'ode-me', value: 'when' },
        { label: 'me / meŋ', value: 'relative who/that (sg / pl)' },
        { label: 'ascan', value: 'because' },
        { label: 'awille', value: 'before / previously' },
        { label: 'koroni', value: 'now / presently' },
        { label: 'kor … ?', value: 'yes/no question starter (Kor ni ki ayi?)' },
        { label: 'aŋgala', value: 'who' },
        { label: '-din / -diŋge', value: 'reflexive/reciprocal extension; finite often -wa (ɗaywa, nolwa)' },
      ],
    },
  ],
}
