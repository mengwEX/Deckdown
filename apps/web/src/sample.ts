export const sampleDeck = `---
title: ChordEdit Talk
size: 1920x1080
ratio: 16:9
engine: deckdown@0.1
---
:::slide cover
<section class="relative w-[1920px] h-[1080px] overflow-hidden bg-neutral-950 text-white">
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.28),transparent_42%)]"></div>
  <div class="absolute left-24 top-20">
    <div class="mb-6 text-2xl tracking-[0.28em] text-indigo-300 uppercase">
      CVPR 2026 Oral
    </div>
    <h1 class="text-8xl font-semibold tracking-tight">
      ChordEdit
    </h1>
    <p class="mt-8 w-[820px] text-4xl leading-tight text-neutral-300">
      One-step low-energy transport for image editing
    </p>
  </div>
  <div class="absolute right-24 top-56 w-[780px] h-[460px] rounded-[48px] border border-white/10 bg-white/5 p-12 shadow-2xl">
    <div class="flex h-full flex-col justify-between">
      <div class="flex justify-between text-2xl text-neutral-400">
        <span>source image</span>
        <span>target image</span>
      </div>
      <div class="relative flex flex-1 items-center justify-center">
        <div class="absolute left-6 h-40 w-40 rounded-3xl bg-indigo-400/20 ring-1 ring-indigo-300/30"></div>
        <div class="absolute right-6 h-40 w-40 rounded-3xl bg-fuchsia-400/20 ring-1 ring-fuchsia-300/30"></div>
        <div class="h-3 w-[520px] rounded-full bg-gradient-to-r from-indigo-400 via-sky-300 to-fuchsia-400 shadow-[0_0_48px_rgba(129,140,248,0.65)]"></div>
      </div>
      <div class="text-center text-3xl text-indigo-200">
        low-energy transport
      </div>
    </div>
  </div>
  <div class="absolute left-24 bottom-24 flex gap-5 text-2xl">
    <span class="rounded-full border border-white/15 bg-white/10 px-7 py-4">training-free</span>
    <span class="rounded-full border border-white/15 bg-white/10 px-7 py-4">inversion-free</span>
    <span class="rounded-full border border-white/15 bg-white/10 px-7 py-4">one-step</span>
  </div>
</section>
:::
:::slide compare
<section class="relative w-[1920px] h-[1080px] overflow-hidden bg-white text-neutral-950">
  <h1 class="absolute left-24 top-20 text-7xl font-semibold tracking-tight">Why it matters</h1>
  <p class="absolute left-24 top-44 w-[960px] text-3xl leading-snug text-neutral-500">
    ChordEdit reframes image editing as a stable one-step transport process.
  </p>
  <div class="absolute inset-x-24 top-64 grid grid-cols-2 gap-12">
    <div class="rounded-3xl border border-neutral-200 bg-neutral-50 p-12">
      <div class="mb-8 text-2xl font-medium uppercase tracking-[0.2em] text-neutral-400">Before</div>
      <h2 class="text-5xl font-semibold">Traditional Editing</h2>
      <ul class="mt-10 space-y-6 text-3xl leading-snug text-neutral-600">
        <li>Multi-step diffusion process</li>
        <li>Inversion required</li>
        <li>Slow iteration loop</li>
      </ul>
    </div>
    <div class="rounded-3xl bg-neutral-950 p-12 text-white shadow-2xl">
      <div class="mb-8 text-2xl font-medium uppercase tracking-[0.2em] text-indigo-300">After</div>
      <h2 class="text-5xl font-semibold">ChordEdit</h2>
      <ul class="mt-10 space-y-6 text-3xl leading-snug text-neutral-300">
        <li>One-step editing</li>
        <li>No training</li>
        <li>No inversion</li>
      </ul>
    </div>
  </div>
</section>
:::
:::slide summary
<section class="relative w-[1920px] h-[1080px] overflow-hidden bg-neutral-950 text-white">
  <div class="absolute left-24 top-20">
    <div class="mb-6 text-2xl tracking-[0.28em] text-neutral-500 uppercase">Summary</div>
    <h1 class="w-[1200px] text-7xl font-semibold leading-tight tracking-tight">
      Editing becomes a one-step transport problem.
    </h1>
  </div>
  <div class="absolute left-24 right-24 bottom-24 grid grid-cols-3 gap-8">
    <div class="rounded-3xl bg-white/10 p-10">
      <div class="text-6xl font-semibold text-indigo-300">01</div>
      <h2 class="mt-8 text-4xl font-semibold">Training-free</h2>
      <p class="mt-5 text-2xl leading-snug text-neutral-300">No model tuning for each edit.</p>
    </div>
    <div class="rounded-3xl bg-white/10 p-10">
      <div class="text-6xl font-semibold text-indigo-300">02</div>
      <h2 class="mt-8 text-4xl font-semibold">Inversion-free</h2>
      <p class="mt-5 text-2xl leading-snug text-neutral-300">Avoids expensive image inversion.</p>
    </div>
    <div class="rounded-3xl bg-white/10 p-10">
      <div class="text-6xl font-semibold text-indigo-300">03</div>
      <h2 class="mt-8 text-4xl font-semibold">One-step</h2>
      <p class="mt-5 text-2xl leading-snug text-neutral-300">Enables faster visual iteration.</p>
    </div>
  </div>
</section>
:::`;
