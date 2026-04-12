import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'THESIS',
  tagline: 'AI Research Assistant',
  archetype: 'productivity',
  palette: {
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#2A1A0E',
    accent:  '#B85C38',
    accent2: '#4B4BA0',
    muted:   'rgba(42,26,14,0.45)',
  },
  lightPalette: {
    bg:      '#FFFFFF',
    surface: '#FAF8F3',
    text:    '#1A1A1A',
    accent:  '#B85C38',
    accent2: '#4B4BA0',
    muted:   'rgba(26,26,26,0.4)',
  },
  screens: [
    {
      id: 'search',
      label: 'Search',
      content: [
        { type: 'metric', label: 'Corpus Size', value: '200M+', sub: 'academic papers indexed' },
        { type: 'text', label: 'AI Research Assistant', value: 'Search by topic, author, keyword, or natural language research question.' },
        { type: 'list', items: [
          { icon: 'clock', title: 'Transformer attention mechanisms in NLP', sub: 'Recent search', badge: '3.4k' },
          { icon: 'clock', title: 'CRISPR therapeutic delivery methods', sub: 'Recent search', badge: '1.8k' },
          { icon: 'clock', title: 'Carbon capture biomimicry approaches', sub: 'Recent search', badge: '943' },
        ]},
        { type: 'tags', label: 'Trending Topics', items: ['Large Language Models', 'mRNA Delivery', 'Ocean Carbon', 'Spatial AI', 'RLHF'] },
      ],
    },
    {
      id: 'results',
      label: 'Results',
      content: [
        { type: 'metric-row', items: [
          { label: 'Papers Found', value: '3,421' },
          { label: 'Relevance', value: '98%' },
          { label: 'Open Access', value: '1,840' },
        ]},
        { type: 'list', items: [
          { icon: 'file', title: 'Attention Is All You Need', sub: 'Vaswani et al. · NeurIPS 2017', badge: '97k' },
          { icon: 'file', title: 'BERT: Pre-training Bidirectional Transformers', sub: 'Devlin et al. · NAACL 2019', badge: '62k' },
          { icon: 'file', title: 'Language Models are Few-Shot Learners', sub: 'Brown et al. · NeurIPS 2020', badge: '41k' },
          { icon: 'file', title: 'Efficient Transformers: A Survey', sub: 'Tay et al. · ACM Computing 2022', badge: '12k' },
        ]},
        { type: 'tags', label: 'Active Filters', items: ['Since 2017', 'High Cited', 'Open Access'] },
      ],
    },
    {
      id: 'paper-detail',
      label: 'Paper Detail',
      content: [
        { type: 'metric-row', items: [
          { label: 'Citations', value: '97,421' },
          { label: 'Published', value: '2017' },
          { label: 'Pages', value: '15' },
        ]},
        { type: 'text', label: 'Attention Is All You Need', value: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin · NeurIPS 2017' },
        { type: 'text', label: 'AI Summary', value: 'This landmark paper introduces the Transformer architecture, eliminating recurrence in favor of self-attention mechanisms. Achieves SOTA on WMT 2014 EN-DE with 28.4 BLEU. Now the backbone of nearly all modern language models.' },
        { type: 'tags', label: 'Key Concepts', items: ['Self-Attention', 'Multi-Head Attention', 'Positional Encoding', 'Encoder-Decoder'] },
        { type: 'progress', items: [
          { label: 'Relevance Match', pct: 98 },
          { label: 'Open Access Available', pct: 100 },
          { label: 'Cited in your field', pct: 87 },
        ]},
      ],
    },
    {
      id: 'synthesis',
      label: 'Synthesis',
      content: [
        { type: 'metric-row', items: [
          { label: 'Papers', value: '12' },
          { label: 'Citations', value: '43' },
          { label: 'Sections', value: '4' },
        ]},
        { type: 'text', label: 'Introduction', value: 'Transformer architectures have fundamentally reshaped NLP since Vaswani et al. (2017) [1]. The elimination of recurrence enabled unprecedented parallelism and scale in language model training.' },
        { type: 'text', label: 'Key Findings', value: 'Self-attention captures long-range dependencies that RNNs miss. Multi-head attention enables attending to multiple positions. Pre-training + fine-tuning paradigm democratised NLP capabilities.' },
        { type: 'text', label: 'Research Gaps', value: 'Computational complexity of attention (O(n²)) remains a constraint for long sequences. Sparse attention variants address this partially but consensus is lacking in the literature.' },
        { type: 'tags', label: 'Export As', items: ['PDF', 'Word', 'BibTeX', 'Notion'] },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved Papers', value: '28' },
          { label: 'Syntheses', value: '4' },
          { label: 'Collections', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'folder', title: 'NLP & Transformers', sub: '12 papers', badge: 'Collection' },
          { icon: 'folder', title: 'CRISPR Delivery', sub: '8 papers', badge: 'Collection' },
          { icon: 'folder', title: 'Climate Science', sub: '5 papers', badge: 'Collection' },
        ]},
        { type: 'progress', items: [
          { label: 'Attention Is All You Need', pct: 80 },
          { label: 'BERT: Bidirectional Transformers', pct: 45 },
          { label: 'Efficient Transformers Survey', pct: 20 },
          { label: 'FlashAttention-2', pct: 0 },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Searches', value: '847' },
          { label: 'Saved Papers', value: '28' },
          { label: 'Exports', value: '4' },
        ]},
        { type: 'text', label: 'Dr. Amara Osei', value: 'AI & Cognitive Systems · MIT CSAIL · Cambridge, MA' },
        { type: 'tags', label: 'Research Interests', items: ['Large Language Models', 'Attention Mechanisms', 'Knowledge Graphs', 'NLP Benchmarks', 'Computational Linguistics'] },
        { type: 'list', items: [
          { icon: 'star', title: 'FlashAttention-2: Faster Attention', sub: 'ICLR 2024 · Recommended for you', badge: 'New' },
          { icon: 'star', title: 'Mamba: Linear-Time Sequence Modeling', sub: 'arXiv 2023 · Trending in your field', badge: 'Hot' },
          { icon: 'star', title: 'Mistral 7B: Open Language Model', sub: 'arXiv 2023 · Related to BERT', badge: 'Save' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'search',    label: 'Search',    icon: '◎' },
    { id: 'library',   label: 'Library',   icon: '⊟' },
    { id: 'synthesis', label: 'Synthesis', icon: '⊕' },
    { id: 'profile',   label: 'Profile',   icon: '◉' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'thesis-mock', 'THESIS — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/thesis-mock`);
