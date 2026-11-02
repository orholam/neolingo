/**
 * Dadjo grammar cheat-sheet data for the in-app reference page.
 * Working model from DJC dictionary, example sentences, and learner notes.
 * Flagged uncertainties stay visible on the page.
 */

export const dadjoGrammarReference = {
  id: 'dadjo',
  title: 'Dadjo grammar',
  subtitle: 'Cheat sheet for conjugations, pronouns, tense, and the multipurpose particle ki.',
  note: 'Living draft — Mongo/DJC-oriented. Some plural forms still conflict across sources.',

  sections: [
    {
      id: 'basics',
      title: 'Quick rules',
      items: [
        { label: 'Word order', value: 'Subject – Verb – Object (SVO)' },
        { label: 'Infinitive', value: 'Most verbs end in -ke (also -ayge, -diŋge, …)' },
        { label: 'Present', value: 'Replace -ke with -e or -o (lexical choice)' },
        { label: 'Past', value: 'Replace -ke with -i' },
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
      tip: 'ma/am and ce/ac are alternants; exact distribution still open.',
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
      tip: '2pl form conflicts across sources — both listed for now.',
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
        { dadjo: 'watiraŋga', english: 'my car' },
        { dadjo: 'yewice', english: 'her husband' },
        { dadjo: 'labinaŋga', english: 'my work' },
      ],
      tip: 'Linkers: na = of/for (singular possessum); ka = of/for (plural), e.g. Tukke ka Ali.',
    },
    {
      id: 'tense',
      title: 'Tense (-ke verbs)',
      columns: ['Form', 'Shape', 'Examples'],
      rows: [
        ['Citation', '…ke', 'urke drink · turke love · ososke go · sogke have/do · isaske give'],
        ['Present', '…e / …o', 'na uro · na turo · na oso · na sogo · na sie · na ŋgan̰e'],
        ['Past', '…i', 'na uri · isi (gave) · ayi (came) · legeyi (spoke) · sogi (had)'],
      ],
      tip: 'Present vowel (-e vs -o) is lexical, not person agreement. Dictionary English tense labels are often sloppy — prefer this morphology.',
    },
    {
      id: 'conjugations',
      title: 'Present conjugations',
      blurb: 'Practice grid (working forms). Inclusive/dual use different endings in corpus examples (osina, osik).',
      columns: ['Person', 'Buy', 'Have', 'Eat', 'Go', 'Drink'],
      rows: [
        ['I (na)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['You (ni)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['He (ma)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['She (ce)', 'ŋgan̰e', 'sogo', 'sie', 'oso', 'uro'],
        ['We excl. (oska)', 'ŋganciga', 'sokciga', 'siciga', 'osiga', 'urciga'],
        ['You pl (oŋa)', 'ŋgancini', 'sokcini', 'sicini', 'osini', 'urcini'],
        ['They (sa/as)', 'ŋgan̰e / ŋganca', 'sogo', 'sie / siaca', 'oso / osa', 'urca?'],
      ],
      tip: 'Lemmas: ŋgan̰ke buy · sogke have · ososke go · urke drink. Sell (ɗeweyge) follows a similar plural pattern in notes.',
    },
    {
      id: 'ki',
      title: 'The particle ki',
      blurb: 'One form, several jobs — match stem shape, not Latin “participle” labels.',
      columns: ['Job', 'Environment', 'Example'],
      rows: [
        ['at / in / to', 'before a noun phrase', 'Na oso ki sugne — I go to the market'],
        ['for', 'before NP (esp. pronoun)', 'Watiri ani ki naŋga — that car is for me'],
        ['Future', 'before past-shaped verb', 'Na ki osi… — I will go'],
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
          dadjo: 'Awille na sogi ma, wa koroni na sogo tiro',
          english: 'I had it before, but now I don’t',
          literal: 'Previously I had it, and presently I have nothing',
        },
        {
          dadjo: 'Aŋgi aŋgala?',
          english: 'What’s your name?',
          literal: 'Name who/what?',
        },
        {
          dadjo: 'Am legeyi taŋga',
          english: 'He spoke to me',
          literal: 'He spoke to-me',
        },
        {
          dadjo: 'Na ori yewe me ayi',
          english: 'I saw the man who came',
        },
        {
          dadjo: 'Ni ori ure me na ori',
          english: 'You saw the woman that I saw',
        },
        {
          dadjo: 'Na ki yagi wadaŋge',
          english: 'I am going to have visitors',
        },
        {
          dadjo: 'Kine ayi ki ori naŋga',
          english: 'Someone came to see me',
        },
        {
          dadjo: 'Na turo niŋga',
          english: 'I love you',
        },
        {
          dadjo: 'Na ki win̰e ki osi ki sugne',
          english: 'I would like to go to the market',
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
        { label: '-diŋge verbs', value: 'reflexive/reciprocal; finite often -wa (ɗaywa)' },
      ],
    },
  ],
}

export const GRAMMAR_BY_COURSE = {
  dadjo: dadjoGrammarReference,
}
