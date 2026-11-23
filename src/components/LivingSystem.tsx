import { useEffect, useRef } from 'react'

type Kind = 'panel' | 'bar' | 'block' | 'chart' | 'cbar' | 'row'
type Tile = {
  x: number
  y: number
  w: number
  h: number
  kind: Kind
  label?: string
  dx: number
  dy: number
  rot: number
  sc: number
  phase: number
  m: number
  accent?: boolean
}

// Deterministic RNG so the composition is stable between renders.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function buildTiles(): Tile[] {
  const r = rng(42)
  const defs: Omit<Tile, 'dx' | 'dy' | 'rot' | 'sc' | 'phase' | 'm'>[] = []
  defs.push({ x: 0, y: 0, w: 0.17, h: 1, kind: 'panel' })
  for (let i = 0; i < 6; i++) defs.push({ x: 0.025, y: 0.1 + i * 0.075, w: i === 1 ? 0.12 : 0.1, h: 0.032, kind: 'bar' })
  defs.push({ x: 0.2, y: 0, w: 0.8, h: 0.075, kind: 'block', label: 'OPERATIONS / OVERVIEW' })
  ;['APPROVALS', 'RFQ · OPEN', 'SHIPMENTS'].forEach((label, i) =>
    defs.push({ x: 0.2 + i * 0.27, y: 0.11, w: 0.25, h: 0.17, kind: 'block', label }),
  )
  defs.push({ x: 0.2, y: 0.31, w: 0.52, h: 0.32, kind: 'chart', label: 'THROUGHPUT' })
  const heights = [0.09, 0.14, 0.11, 0.19, 0.15, 0.22, 0.12]
  heights.forEach((h, i) =>
    defs.push({ x: 0.235 + i * 0.066, y: 0.6 - h, w: 0.036, h, kind: 'cbar', accent: i === 5 }),
  )
  defs.push({ x: 0.745, y: 0.31, w: 0.255, h: 0.32, kind: 'block', label: 'ROLE · SITE ENG' })
  ;['PO-2291  ·  PENDING', 'GRN-0417  ·  RECEIVED', 'STOCK  ·  LOW', 'LOCALE  ·  AR / EN', 'SHP-0088  ·  IN TRANSIT'].forEach(
    (label, i) => defs.push({ x: 0.2, y: 0.67 + i * 0.066, w: 0.8, h: 0.05, kind: 'row', label }),
  )
  return defs.map((d) => ({
    ...d,
    dx: (r() - 0.5) * 0.8,
    dy: (r() - 0.5) * 0.75,
    rot: (r() - 0.5) * 1.3,
    sc: 0.7 + r() * 0.55,
    phase: r() * Math.PI * 2,
    m: 0,
  }))
}

const GLYPHS = '#%/<>[]{}=+*~01'
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function scramble(label: string, clarity: number, tick: number) {
  if (clarity > 0.97) return label
  let out = ''
  for (let k = 0; k < label.length; k++) {
    const ch = label[k]
    const h = Math.abs(Math.sin(k * 12.9898 + tick * 78.233) * 43758.5453) % 1
    out += ch !== ' ' && h > clarity ? GLYPHS[Math.floor(h * GLYPHS.length)] : ch
  }
  return out
}

type Props = {
  resolved: boolean
  reducedMotion: boolean
  onClarity?: (value: number) => void
  className?: string
}

export function LivingSystem({ resolved, reducedMotion, onClarity, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resolvedRef = useRef(resolved)
  resolvedRef.current = resolved
  const clarityCb = useRef(onClarity)
  clarityCb.current = onClarity

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const tiles = buildTiles()
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    const start = performance.now()
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, lastMove: -1e9, inside: false }
    let lastReport = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      if (!pointer.tx) {
        pointer.x = pointer.tx = w * 0.55
        pointer.y = pointer.ty = h * 0.5
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const pad = rect.width * 0.25
      pointer.inside = x > -pad && x < rect.width + pad && y > -pad && y < rect.height + pad
      if (pointer.inside) {
        pointer.tx = x
        pointer.ty = y
        pointer.lastMove = performance.now()
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    })
    io.observe(canvas)

    function frame(now: number) {
      raf = 0
      if (!visible) return
      const t = reducedMotion ? 0 : (now - start) / 1000
      const intro = reducedMotion ? 1 : Math.min(1, (now - start) / 1400)

      // Fit an abstract product layout inside the canvas.
      const aspect = 1.22
      const bw = Math.min(w * 0.84, h * 0.8 * aspect)
      const bh = bw / aspect
      const bx = (w - bw) / 2
      const by = (h - bh) / 2

      // Idle lens wanders on its own (touch devices, no pointer activity).
      const idle = now - pointer.lastMove > 2600
      if (idle && !reducedMotion) {
        const s = (now - start) / 1000
        pointer.tx = bx + bw * (0.5 + 0.32 * Math.sin(s * 0.33))
        pointer.ty = by + bh * (0.5 + 0.3 * Math.sin(s * 0.51 + 1))
      }
      const follow = reducedMotion ? 1 : idle ? 0.03 : 0.14
      pointer.x += (pointer.tx - pointer.x) * follow
      pointer.y += (pointer.ty - pointer.y) * follow

      const radius = Math.min(bw, bh) * 0.36
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const all = resolvedRef.current
      let sum = 0
      const centers: [number, number, number][] = []

      for (const tile of tiles) {
        const ocx = bx + (tile.x + tile.w / 2) * bw
        const ocy = by + (tile.y + tile.h / 2) * bh
        const dist = Math.hypot(ocx - pointer.x, ocy - pointer.y)
        const local = Math.max(0, Math.min(1, 1 - (dist - radius * 0.45) / (radius * 0.75)))
        const target = all ? 1 : local
        tile.m = reducedMotion ? target : tile.m + (target - tile.m) * (all ? 0.05 : 0.09)
        sum += tile.m
        const e = ease(tile.m)
        const drift = reducedMotion ? 0 : 1
        const ccx = ocx + tile.dx * bw + Math.sin(t * 0.45 + tile.phase) * 14 * drift
        const ccy = ocy + tile.dy * bh + Math.cos(t * 0.38 + tile.phase) * 12 * drift
        const cx = lerp(ccx, ocx, e)
        const cy = lerp(ccy, ocy, e)
        const rot = lerp(tile.rot + Math.sin(t * 0.3 + tile.phase) * 0.08 * drift, 0, e)
        const introE = ease(Math.max(0, Math.min(1, intro * 1.4 - tile.phase / 12)))
        const sc = lerp(tile.sc, 1, e) * lerp(0.6, 1, introE)
        const tw = tile.w * bw
        const th = tile.h * bh
        centers.push([cx, cy, e])

        ctx.save()
        ctx.globalAlpha = introE
        ctx.translate(cx, cy)
        ctx.rotate(rot)
        ctx.scale(sc, sc)
        ctx.beginPath()
        const radiusPx = tile.kind === 'bar' || tile.kind === 'cbar' ? Math.min(tw, th) / 2 : 6
        ctx.roundRect(-tw / 2, -th / 2, tw, th, radiusPx)

        if (tile.kind === 'panel') {
          ctx.fillStyle = `rgba(23,26,37,${lerp(0.5, 0.9, e)})`
          ctx.fill()
          ctx.strokeStyle = `rgba(174,180,200,${lerp(0.12, 0.18, e)})`
          ctx.stroke()
        } else if (tile.kind === 'bar') {
          ctx.fillStyle = `rgba(174,180,200,${lerp(0.2, 0.35, e)})`
          ctx.fill()
        } else if (tile.kind === 'cbar') {
          ctx.fillStyle =
            tile.accent && e > 0.6
              ? `rgba(217,243,106,${lerp(0.3, 0.95, e)})`
              : `rgba(166,160,255,${lerp(0.18, 0.75, e)})`
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(23,26,37,${lerp(0.55, 0.92, e)})`
          ctx.fill()
          ctx.lineWidth = 1
          ctx.strokeStyle = `rgba(174,180,200,${lerp(0.25, 0.12, e)})`
          ctx.stroke()
          if (e > 0.02) {
            ctx.strokeStyle = `rgba(166,160,255,${e * 0.75})`
            ctx.stroke()
          }
          if (tile.kind === 'chart' && e > 0.3) {
            ctx.strokeStyle = `rgba(174,180,200,${(e - 0.3) * 0.15})`
            for (let g = 1; g < 4; g++) {
              const gy = -th / 2 + (th * g) / 4
              ctx.beginPath()
              ctx.moveTo(-tw / 2 + 10, gy)
              ctx.lineTo(tw / 2 - 10, gy)
              ctx.stroke()
            }
          }
          if (tile.label) {
            const fs = Math.max(8, Math.min(11, bw / 52))
            ctx.font = `500 ${fs}px "IBM Plex Mono", monospace`
            ctx.textBaseline = 'top'
            ctx.fillStyle = `rgba(${Math.round(lerp(174, 244, e))},${Math.round(lerp(180, 243, e))},${Math.round(lerp(200, 239, e))},${lerp(0.5, 0.95, e)})`
            const tick = Math.floor(t * 9)
            const lx = -tw / 2 + 10
            const ly = tile.kind === 'row' ? -fs / 2 : -th / 2 + 9
            ctx.fillText(scramble(tile.label, e, tick), lx, ly)
            if (tile.kind === 'block' && th > 40 && e > 0.4) {
              ctx.fillStyle = `rgba(244,243,239,${(e - 0.4) * 0.35})`
              ctx.fillRect(lx, th / 2 - 18, tw * 0.35, 6)
            }
          }
        }
        ctx.restore()
      }

      // Tangled connections dissolve as clarity increases.
      ctx.lineWidth = 1
      for (let i = 0; i < centers.length; i++) {
        const j = (i * 7 + 3) % centers.length
        const a = centers[i]
        const b = centers[j]
        const alpha = (1 - a[2]) * (1 - b[2]) * 0.22 * intro
        if (alpha < 0.01) continue
        ctx.strokeStyle = `rgba(174,180,200,${alpha})`
        ctx.beginPath()
        ctx.moveTo(a[0], a[1])
        ctx.lineTo(b[0], b[1])
        ctx.stroke()
      }

      // Clarity lens.
      if (!all) {
        ctx.globalAlpha = intro
        ctx.strokeStyle = 'rgba(166,160,255,0.35)'
        ctx.setLineDash([2, 6])
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = 'rgba(217,243,106,0.8)'
        const c = 7
        ctx.beginPath()
        ctx.moveTo(pointer.x - c, pointer.y)
        ctx.lineTo(pointer.x + c, pointer.y)
        ctx.moveTo(pointer.x, pointer.y - c)
        ctx.lineTo(pointer.x, pointer.y + c)
        ctx.stroke()
        ctx.font = '500 10px "IBM Plex Mono", monospace'
        ctx.fillStyle = 'rgba(166,160,255,0.8)'
        ctx.fillText('CLARITY LENS', pointer.x + radius * 0.72, pointer.y - radius * 0.72)
        ctx.globalAlpha = 1
      }

      if (now - lastReport > 120) {
        lastReport = now
        clarityCb.current?.(sum / tiles.length)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Interactive illustration: scattered interface fragments resolve into an ordered product layout wherever the clarity lens passes."
    />
  )
}
