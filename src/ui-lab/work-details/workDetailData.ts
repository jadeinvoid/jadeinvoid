import type { WorkDetailProject } from './workDetailTypes'

export const UI_LAB_WORK_DETAIL_PROJECTS: readonly WorkDetailProject[] = [
  {
    id: 'complex-tools',
    title: 'Making complex tools feel obvious',
    meta: 'Product design / Research',
    year: '2026',
    role: 'Lead product designer',
    services: ['Research', 'Product strategy', 'Interaction design'],
    overview: 'A dense planning tool was reorganized around the decisions people actually make, replacing system language with a calmer, task-led flow.',
    outcome: 'The new structure shortened the critical workflow, made exceptions easier to understand, and gave the product team a reusable interaction system.',
    process: ['Listen for the real decision', 'Make the invisible structure visible', 'Prototype the difficult moments', 'Turn the result into a system'],
    credits: ['Design and research — Muijade', 'Engineering — Product team'],
    media: [
      { id: 'map', label: 'Workflow map', caption: 'The original workflow mapped as decisions rather than screens.', tone: 'blue' },
      { id: 'prototype', label: 'Working prototype', caption: 'A focused prototype for the most error-prone path.', tone: 'pink' },
      { id: 'system', label: 'Interaction system', caption: 'Reusable patterns carried into the wider product.', tone: 'green' },
    ],
    template: 'case-study',
  },
  {
    id: 'kinder-workflow',
    title: 'A kinder way through the workflow',
    meta: 'UX strategy / Prototyping',
    year: '2025',
    role: 'UX designer',
    services: ['Journey design', 'Prototyping', 'Content design'],
    overview: 'A service journey was reframed to acknowledge uncertainty, explain what happens next, and keep support close to the moments that need it.',
    outcome: 'A lighter interaction model helped the team align around one service language and gave users a clearer sense of progress.',
    process: ['Trace the emotional journey', 'Reduce competing choices', 'Prototype reassurance', 'Test the complete rhythm'],
    credits: ['Experience design — Muijade', 'Content — Service team'],
    media: [
      { id: 'journey', label: 'Journey moments', caption: 'The experience organized around moments of uncertainty.', tone: 'violet' },
      { id: 'language', label: 'Service language', caption: 'Plain-language patterns shared across the journey.', tone: 'gold' },
      { id: 'states', label: 'Interface states', caption: 'Supportive states for waiting, errors, and completion.', tone: 'blue' },
    ],
    template: 'visual-story',
  },
  {
    id: 'loose-ideas',
    title: 'Turning loose ideas into systems',
    meta: 'Interaction / Design systems',
    year: '2025',
    role: 'Design systems lead',
    services: ['Interaction language', 'Components', 'Documentation'],
    overview: 'Repeated interface ideas were gathered into a small system that preserves expressive details without making everyday product work harder.',
    outcome: 'Teams gained a shared vocabulary, fewer one-off decisions, and enough flexibility to keep the interface feeling human.',
    process: ['Collect repeated decisions', 'Name the shared behavior', 'Stress-test combinations', 'Document the reasons'],
    credits: ['System design — Muijade', 'Build — Platform team'],
    media: [
      { id: 'inventory', label: 'Pattern inventory', caption: 'Similar ideas grouped by behavior and intent.', tone: 'green' },
      { id: 'motion', label: 'Motion language', caption: 'A small family of transitions with distinct jobs.', tone: 'pink' },
      { id: 'documentation', label: 'Living guidance', caption: 'Documentation organized around decisions, not components.', tone: 'violet' },
    ],
    template: 'case-study',
  },
  {
    id: 'odd-jobs',
    title: 'Experiments, sketches, and odd jobs',
    meta: 'Selected explorations',
    year: '2026',
    role: 'Designer and maker',
    services: ['Creative code', 'Illustration', 'Prototyping'],
    overview: 'A collection of small ideas made to answer one useful question, learn one unfamiliar tool, or follow one particularly stubborn curiosity.',
    outcome: 'The experiments remain deliberately lightweight: finished enough to share, open enough to keep teaching.',
    process: ['Start with one question', 'Make the smallest convincing version', 'Keep the useful surprise'],
    credits: ['Made by Muijade', 'With generous open-source tools'],
    media: [
      { id: 'sketches', label: 'Interaction sketches', caption: 'Fast studies of movement, response, and timing.', tone: 'gold' },
      { id: 'objects', label: 'Small digital objects', caption: 'Tiny tools built around very specific needs.', tone: 'blue' },
      { id: 'fragments', label: 'Useful fragments', caption: 'Pieces worth keeping even when the full idea changes.', tone: 'pink' },
    ],
    template: 'field-note',
  },
] as const

export function getUiLabWorkDetailProject(index: number) {
  return UI_LAB_WORK_DETAIL_PROJECTS[index] ?? UI_LAB_WORK_DETAIL_PROJECTS[0]
}

