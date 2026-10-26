import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

/* Pixxelex 3D-slider recipe, translated to React + Motion:
   one state per slide; every shoe lives on the ellipse in every state;
   inactive shoes park at the orbit edges at scale 0; price/name are
   clipped vertical strips shifted one row per slide. */

const EASE = [0.85, 0, 0.15, 1] as const
const DUR = 0.8

interface Slide {
  id: string
  name: string
  price: string
  color: string
  img: string
}

const SLIDES: Slide[] = [
  { id: 'red', name: 'AERIX CRIMSON APEX', price: '$699', color: '#b6090a', img: 'shoes/shoe-red.png' },
  { id: 'orange', name: 'AERIX SOLAR FLARE', price: '$799', color: '#b65909', img: 'shoes/shoe-orange.png' },
  { id: 'blue', name: 'AERIX COBALT TIDE', price: '$899', color: '#094ab6', img: 'shoes/shoe-blue.png' },
  { id: 'purple', name: 'AERIX ROYAL NEBULA', price: '$599', color: '#5309b6', img: 'shoes/shoe-purple.png' },
  { id: 'pink', name: 'AERIX FUCHSIA FURY', price: '$899', color: '#b60978', img: 'shoes/shoe-pink.png' },
]

const NAV = ['New & Featured', 'Men', 'Women', 'Kids']
const PRICE_H = 4.3 // rem per price row
const NAME_H = 1.9 // rem per name row

function wrapDist(i: number, active: number, n: number) {
  let d = (i - active) % n
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

function pose(d: number) {
  if (d === 0) return { x: '0%', y: '0%', scale: 1, rotate: 0, opacity: 1, zIndex: 30 }
  if (Math.abs(d) === 1)
    return { x: `${d * 47}%`, y: '8%', scale: 0.52, rotate: d * -11, opacity: 1, zIndex: 20 }
  return { x: `${d * 34}%`, y: '13%', scale: 0, rotate: d * -18, opacity: 0, zIndex: 10 }
}

export default function App() {
  const [active, setActive] = useState(0)
  const [link, setLink] = useState(0)
  const [bought, setBought] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const swipeX = useRef<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + SLIDES.length) % SLIDES.length),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }

  const buy = () => {
    setBought(true)
    setTimeout(() => setBought(false), 1700)
  }

  const dur = reduce ? 0.25 : DUR
  const slide = SLIDES[active]

  return (
    <motion.main
      className="relative h-[100svh] w-full overflow-hidden text-white select-none"
      animate={{ backgroundColor: slide.color }}
      transition={{ duration: dur, ease: EASE }}
      onPointerDown={(e) => (swipeX.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipeX.current === null) return
        const dx = e.clientX - swipeX.current
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1)
        swipeX.current = null
      }}
    >
      {/* soft-light glow stage (tutorial trick 4a) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[54%] h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-soft-light"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 42%, rgba(255,255,255,0) 68%)',
        }}
      />

      {/* nav */}
      <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
        <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2.5" aria-label="AERIX home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill={slide.color} aria-hidden>
              <path d="M13 2 4.5 13.5H11L9.8 22 19 10h-6.5L13 2z" />
            </svg>
          </span>
          <span className="text-lg font-extrabold italic tracking-wide">AERIX</span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Categories">
          {NAV.map((label, i) => (
            <button
              key={label}
              onClick={() => setLink(i)}
              className="relative rounded-full px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:text-white"
            >
              {link === i && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/25"
                  transition={{ duration: 0.45, ease: EASE }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Demo build — accounts are not wired up yet.')}
            className="rounded-full border border-white/70 px-4 py-1.5 text-sm font-semibold transition hover:bg-white/10"
          >
            Log In
          </button>
          <button
            onClick={() => showToast('Demo build — accounts are not wired up yet.')}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-neutral-900 transition hover:bg-white/85"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* headline (behind the shoes) */}
      <div className="absolute inset-x-0 top-[11%] z-10 px-4 text-center sm:top-[12%]">
        <div className="relative mx-auto w-fit">
          <h1 className="headline-gradient whitespace-nowrap text-[10vw] font-black italic leading-none tracking-tight lg:text-[9.2rem]">
            BRING THE HEAT
          </h1>
          <span
            aria-hidden
            className="sheen-mask pointer-events-none absolute inset-0 whitespace-nowrap text-[10vw] font-black italic leading-none tracking-tight text-white lg:text-[9.2rem]"
          >
            BRING THE HEAT
          </span>
        </div>
        <p className="mx-auto mt-4 max-w-md text-[13px] font-medium leading-snug text-white/85 sm:text-sm">
          Designed for the athlete who never cools down.
          <br />
          High-energy performance from tip-off to the final buzzer.
        </p>
      </div>

      {/* orbit stage */}
      <div className="absolute inset-x-0 top-[26%] bottom-[15%] z-0 sm:top-[24%]">
        <div className="relative mx-auto h-full w-[min(94vw,1150px)]">
          {/* orbit ring (tutorial trick 4b) */}
          <svg viewBox="0 0 1000 420" className="absolute left-1/2 top-[58%] w-[96%] -translate-x-1/2 -translate-y-1/2 -rotate-6" aria-hidden>
            <ellipse cx="500" cy="210" rx="490" ry="150" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" />
            <circle cx="18" cy="160" r="6" fill="rgba(255,255,255,0.9)" />
            <circle cx="982" cy="255" r="6" fill="rgba(255,255,255,0.9)" />
          </svg>

          {/* shoes — every shoe lives here in every state (tutorial trick 2) */}
          {SLIDES.map((s, i) => {
            const d = wrapDist(i, active, SLIDES.length)
            const p = pose(d)
            return (
              <motion.div
                key={s.id}
                className="absolute inset-0 grid place-items-center"
                initial={false}
                animate={{ x: p.x, y: p.y, scale: p.scale, rotate: p.rotate, opacity: p.opacity }}
                transition={{ duration: dur, ease: EASE }}
                style={{ zIndex: p.zIndex }}
              >
                <motion.div
                  animate={d === 0 && !reduce ? { y: [0, -12, 0] } : { y: 0 }}
                  transition={
                    d === 0 && !reduce
                      ? { duration: 4.4, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.3 }
                  }
                  className="w-[min(74%,620px)]"
                >
                  <img
                    src={s.img}
                    alt={s.name}
                    className="w-full"
                    draggable={false}
                    style={{ filter: 'drop-shadow(0 34px 28px rgba(0,0,0,0.28))' }}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-5 pb-6 sm:px-10 sm:pb-9">
        {/* rolling price + name strips (tutorial trick 3) */}
        <div>
          <div className="mb-1 h-px w-10 bg-white/60" aria-hidden />
          <div className="overflow-hidden" style={{ height: `${PRICE_H}rem` }}>
            <motion.div
              animate={{ y: `${-active * PRICE_H}rem` }}
              transition={{ duration: dur, ease: EASE }}
            >
              {SLIDES.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start font-extrabold leading-none"
                  style={{ height: `${PRICE_H}rem`, fontSize: 'clamp(2.5rem, 9vw, 3.6rem)' }}
                >
                  {s.price}
                </div>
              ))}
            </motion.div>
          </div>
          <div className="overflow-hidden" style={{ height: `${NAME_H}rem` }}>
            <motion.div
              animate={{ y: `${-active * NAME_H}rem` }}
              transition={{ duration: dur, ease: EASE }}
            >
              {SLIDES.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start text-[15px] font-bold uppercase tracking-[0.14em] sm:text-base"
                  style={{ height: `${NAME_H}rem` }}
                >
                  {s.name}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* arrows */}
        <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-3 sm:bottom-9">
          <button
            onClick={() => go(-1)}
            aria-label="Previous shoe"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/70 transition hover:bg-white/15 active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next shoe"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/70 transition hover:bg-white/15 active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <motion.button
          onClick={buy}
          whileTap={{ scale: 0.94 }}
          className={`rounded-full px-5 py-2.5 text-[13px] font-extrabold tracking-wide transition sm:px-6 sm:py-3 sm:text-sm ${
            bought ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 hover:bg-white/85'
          }`}
        >
          {bought ? 'ADDED TO BAG ✓' : 'BUY NOW'}
        </motion.button>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2 text-[13px] font-medium text-white shadow-lg"
            role="status"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
