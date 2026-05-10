import React, { useState, useEffect, useRef } from 'react'

/* ─── palette & tokens ─── */
const C = {
  bg: '#080812',
  surface: '#0f0f1e',
  card: '#14142a',
  border: '#1e1e3a',
  red: '#FF3E1D',
  redGlow: 'rgba(255,62,29,.35)',
  text: '#e8e8f0',
  muted: '#8888aa',
  white: '#ffffff',
}

/* ─── global styles injected once ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body {
      font-family:'Sora',sans-serif; background:${C.bg}; color:${C.text};
      -webkit-font-smoothing:antialiased; overflow-x:hidden;
    }
    ::selection { background:${C.red}; color:#fff; }
    a { color:${C.red}; text-decoration:none; }

    /* grid bg */
    .grid-bg {
      position:absolute;inset:0;z-index:0;
      background-image:
        linear-gradient(${C.border} 1px, transparent 1px),
        linear-gradient(90deg, ${C.border} 1px, transparent 1px);
      background-size:60px 60px;
      opacity:.25;
      mask-image:radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%);
    }

    /* floating orbs */
    .orb {
      position:absolute; border-radius:50%; filter:blur(80px); opacity:.18;
      animation: orbFloat 12s ease-in-out infinite alternate;
    }
    .orb-1 { width:400px;height:400px;background:${C.red};top:-100px;left:-80px; }
    .orb-2 { width:300px;height:300px;background:#4a1aff;bottom:-60px;right:-40px;animation-delay:-5s; }
    .orb-3 { width:250px;height:250px;background:${C.red};top:40%;right:10%;animation-delay:-8s; }
    @keyframes orbFloat {
      0%{transform:translate(0,0) scale(1)}
      100%{transform:translate(30px,-40px) scale(1.12)}
    }

    /* glitch */
    .glitch { position:relative; }
    .glitch::before, .glitch::after {
      content:attr(data-text); position:absolute; left:0; top:0;
      width:100%; overflow:hidden;
    }
    .glitch::before { color:${C.red}; animation:glitch1 3s infinite linear; clip-path:inset(20% 0 60% 0); }
    .glitch::after  { color:#0ff; animation:glitch2 3s infinite linear; clip-path:inset(60% 0 10% 0); }
    @keyframes glitch1 {
      0%,100%{transform:translate(0)} 20%{transform:translate(-3px,2px)}
      40%{transform:translate(3px,-1px)} 60%{transform:translate(-1px,1px)}
    }
    @keyframes glitch2 {
      0%,100%{transform:translate(0)} 25%{transform:translate(2px,-2px)}
      50%{transform:translate(-2px,1px)} 75%{transform:translate(1px,2px)}
    }

    /* marquee */
    .marquee-track {
      display:flex; gap:3rem; animation:scroll 25s linear infinite;
      white-space:nowrap;
    }
    @keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

    /* slider thumb */
    input[type=range] {
      -webkit-appearance:none; width:100%; height:6px;
      background:${C.border}; border-radius:3px; outline:none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance:none; width:22px; height:22px;
      background:${C.red}; border-radius:50%; cursor:pointer;
      box-shadow:0 0 12px ${C.redGlow};
    }
    input[type=range]::-moz-range-thumb {
      width:22px; height:22px; background:${C.red}; border:none;
      border-radius:50%; cursor:pointer;
    }

    /* button hover */
    .cta-btn {
      display:inline-flex;align-items:center;gap:.5rem;
      padding:.9rem 2rem;border:none;border-radius:6px;
      background:${C.red};color:#fff;font-family:'Sora',sans-serif;
      font-weight:600;font-size:1rem;cursor:pointer;
      transition:transform .2s,box-shadow .2s;
    }
    .cta-btn:hover { transform:translateY(-2px); box-shadow:0 6px 30px ${C.redGlow}; }
    .cta-btn-outline {
      background:transparent; border:1.5px solid ${C.red}; color:${C.red};
    }
    .cta-btn-outline:hover { background:${C.red}; color:#fff; }

    /* fade-in on scroll */
    .reveal { opacity:0; transform:translateY(30px); transition:opacity .7s ease, transform .7s ease; }
    .reveal.visible { opacity:1; transform:translateY(0); }

    /* section spacing */
    section { position:relative; padding:6rem 1.5rem; max-width:1200px; margin:0 auto; }
    @media(max-width:768px){ section { padding:4rem 1.25rem; } }
  `}</style>
)

/* ─── reusable hooks ─── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } }, { threshold: .15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function useCounter(end, duration = 2000) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = (ts) => { if (!start) start = ts; const p = Math.min((ts - start) / duration, 1); setVal(Math.floor(p * end)); if (p < 1) requestAnimationFrame(step) }
        requestAnimationFrame(step)
        obs.unobserve(el)
      }
    }, { threshold: .3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])
  return [val, ref]
}

/* ─── SECTIONS ─── */

function Nav() {
  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,
      background:'rgba(8,8,18,.85)',backdropFilter:'blur(12px)',
      borderBottom:`1px solid ${C.border}`,padding:'.75rem 2rem',
      display:'flex',justifyContent:'space-between',alignItems:'center' }}>
      <div style={{ fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'1.15rem',color:C.white,display:'flex',alignItems:'center',gap:'.5rem' }}>
        <span style={{ color:C.red }}>{'>'}</span> RealSync Pro
      </div>
      <div style={{ display:'flex',gap:'2rem',alignItems:'center',fontSize:'.9rem' }}>
        <a href="#pain" style={{ color:C.muted,transition:'color .2s' }} onMouseOver={e=>e.target.style.color=C.red} onMouseOut={e=>e.target.style.color=C.muted}>Problems</a>
        <a href="#stack" style={{ color:C.muted,transition:'color .2s' }} onMouseOver={e=>e.target.style.color=C.red} onMouseOut={e=>e.target.style.color=C.muted}>Stack</a>
        <a href="#calc" style={{ color:C.muted,transition:'color .2s' }} onMouseOver={e=>e.target.style.color=C.red} onMouseOut={e=>e.target.style.color=C.muted}>Calculator</a>
        <a href="#cta" className="cta-btn" style={{ padding:'.55rem 1.25rem',fontSize:'.85rem' }}>Book a Call</a>
      </div>
    </nav>
  )
}

function Hero() {
  const [sys, setSys] = useState(47)
  const [rev, setRev] = useState(2)
  const [speed, setSpeed] = useState(60)
  const [sysRef] = useCounter(47, 2200)
  const [revRef] = useCounter(2, 2400)

  useEffect(() => { setSys(47) }, [])

  return (
    <header style={{ position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',paddingTop:'5rem' }}>
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div style={{ position:'relative',zIndex:2,textAlign:'center',maxWidth:820,padding:'0 1.5rem' }}>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'.8rem',color:C.red,letterSpacing:'.15em',marginBottom:'1.5rem',textTransform:'uppercase' }}>
          Business Efficiency Strategists
        </div>
        <h1 className="glitch" data-text="Your leads are calling your competitor right now."
          style={{ fontFamily:"'Sora',sans-serif",fontSize:'clamp(2rem,5.5vw,3.6rem)',fontWeight:700,lineHeight:1.1,color:C.white,marginBottom:'1.5rem' }}>
          Your leads are calling your competitor right now.
        </h1>
        <p style={{ fontSize:'1.15rem',color:C.muted,maxWidth:600,margin:'0 auto 2.5rem',lineHeight:1.7 }}>
          You're on the roof. They're on the phone — calling the next guy.<br />
          We build systems that answer before you put down the nail gun.
        </p>
        <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap' }}>
          <a href="#calc" className="cta-btn">See What You're Losing →</a>
          <a href="#cta" className="cta-btn cta-btn-outline">Book a Strategy Call</a>
        </div>

        {/* social proof counters */}
        <div ref={sysRef} style={{ display:'flex',gap:'3rem',justifyContent:'center',marginTop:'4rem',flexWrap:'wrap' }}>
          {[
            { val:'47+', label:'Systems Built' },
            { val:'$2M+', label:'Revenue Recovered' },
            { val:'60s', label:'Avg Response Time' },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'1.8rem',fontWeight:700,color:C.red }}>{s.val}</div>
              <div style={{ fontSize:'.8rem',color:C.muted,marginTop:'.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

function Marquee() {
  const items = ['GoHighLevel','Make.com','Zapier','Google Apps Script','Airtable','N8N','Softr','Lacy.ai','Google Sheets','Lovable']
  return (
    <div style={{ borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:'1rem 0',overflow:'hidden',background:C.surface }}>
      <div className="marquee-track">
        {[...items,...items].map((t,i) => (
          <span key={i} style={{ fontFamily:"'Space Mono',monospace",fontSize:'.85rem',color:C.muted,display:'flex',alignItems:'center',gap:'.5rem' }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:C.red,display:'inline-block' }} />{t}
          </span>
        ))}
      </div>
    </div>
  )
}

function PainPoints() {
  const ref = useReveal()
  const cards = [
    { icon:'💸', title:'Bleeding Money on Software', desc:'MarketSharp, ServiceTitan, Housecall Pro — you\'re paying $500-$2,000/mo for tools that don\'t talk to each other. We collapse it all into one system.' },
    { icon:'📱', title:'Leads Calling While You\'re on the Roof', desc:'By the time you check your voicemail, they\'ve already booked with your competitor. Our AI answers in under 60 seconds — every time.' },
    { icon:'📋', title:'Sticky-Note Systems', desc:'Your "CRM" is a whiteboard, a spreadsheet, and someone\'s memory. That works until it doesn\'t — and it costs you jobs you never knew you lost.' },
    { icon:'🤦', title:'The VA Problem', desc:'You hired a virtual assistant to "handle it." Now you manage the VA who manages the spreadsheet who misses the lead. Automation doesn\'t call in sick.' },
  ]
  return (
    <section id="pain" ref={ref} className="reveal">
      <div style={{ textAlign:'center',marginBottom:'3.5rem' }}>
        <h2 style={{ fontSize:'2rem',fontWeight:700,color:C.white,marginBottom:'.75rem' }}>Sound Familiar?</h2>
        <p style={{ color:C.muted,maxWidth:520,margin:'0 auto' }}>Every contractor we talk to has at least two of these. Most have all four.</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem' }}>
        {cards.map((c,i) => (
          <div key={i} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'2rem',
            transition:'border-color .3s,transform .3s',cursor:'default'
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor=C.red; e.currentTarget.style.transform='translateY(-4px)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)' }}
          >
            <div style={{ fontSize:'2rem',marginBottom:'.75rem' }}>{c.icon}</div>
            <h3 style={{ fontSize:'1.1rem',fontWeight:600,color:C.white,marginBottom:'.5rem' }}>{c.title}</h3>
            <p style={{ fontSize:'.9rem',color:C.muted,lineHeight:1.65 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TechStack() {
  const ref = useReveal()
  const tools = [
    { name:'GoHighLevel', color:'#28a745' },
    { name:'Make.com', color:'#6d28d9' },
    { name:'Zapier', color:'#ff5722' },
    { name:'Google Apps Script', color:'#0d9488' },
    { name:'Airtable', color:'#2563eb' },
    { name:'N8N', color:'#ef4444' },
    { name:'Softr', color:'#ec4899' },
    { name:'Lacy.ai', color:'#06b6d4' },
    { name:'Google Sheets', color:'#16a34a' },
    { name:'Lovable', color:'#a855f7' },
  ]
  const steps = [
    { num:'01', title:'Audit', desc:'We map every tool, workflow, and bottleneck you have.' },
    { num:'02', title:'Architect', desc:'Design the replacement system — fewer tools, more power.' },
    { num:'03', title:'Build', desc:'We build it inside GoHighLevel with custom dashboards, pipelines, and automations.' },
    { num:'04', title:'Optimize', desc:'Monthly retainer keeps it running, improving, and scaling with you.' },
  ]
  return (
    <section id="stack" ref={ref} className="reveal">
      <div style={{ textAlign:'center',marginBottom:'3rem' }}>
        <h2 style={{ fontSize:'2rem',fontWeight:700,color:C.white,marginBottom:'.75rem' }}>Your Entire Operation. One Stack.</h2>
        <p style={{ color:C.muted,maxWidth:520,margin:'0 auto' }}>10 tools. One system. No more tab-switching chaos.</p>
      </div>
      {/* tool pills */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:'.75rem',justifyContent:'center',marginBottom:'4rem' }}>
        {tools.map((t,i) => (
          <span key={i} style={{
            display:'inline-flex',alignItems:'center',gap:'.5rem',
            padding:'.5rem 1.1rem',borderRadius:999,
            background:C.surface,border:`1px solid ${C.border}`,
            fontSize:'.85rem',color:C.text,fontWeight:500,
            transition:'border-color .3s',cursor:'default'
          }}
            onMouseOver={e => e.currentTarget.style.borderColor=t.color}
            onMouseOut={e => e.currentTarget.style.borderColor=C.border}
          >
            <span style={{ width:8,height:8,borderRadius:'50%',background:t.color }} />{t.name}
          </span>
        ))}
      </div>
      {/* process steps */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.5rem' }}>
        {steps.map((s,i) => (
          <div key={i} style={{ padding:'1.5rem',borderLeft:`3px solid ${C.red}`,background:C.card,borderRadius:'0 8px 8px 0' }}>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'.8rem',color:C.red,marginBottom:'.5rem' }}>{s.num}</div>
            <h4 style={{ fontSize:'1.05rem',fontWeight:600,color:C.white,marginBottom:'.35rem' }}>{s.title}</h4>
            <p style={{ fontSize:'.85rem',color:C.muted,lineHeight:1.6 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Calculator() {
  const ref = useReveal()
  const [leads, setLeads] = useState(80)
  const [missed, setMissed] = useState(35)
  const [value, setValue] = useState(8000)

  const missedLeads = Math.round(leads * (missed / 100))
  const closeRate = 0.25
  const lostJobs = Math.round(missedLeads * closeRate)
  const monthlyLoss = lostJobs * value
  const yearlyLoss = monthlyLoss * 12

  return (
    <section id="calc" ref={ref} className="reveal">
      <div style={{ textAlign:'center',marginBottom:'3rem' }}>
        <h2 style={{ fontSize:'2rem',fontWeight:700,color:C.white,marginBottom:'.75rem' }}>How Much Are You Losing?</h2>
        <p style={{ color:C.muted,maxWidth:520,margin:'0 auto' }}>Drag the sliders. The math is simple — and painful.</p>
      </div>
      <div style={{ maxWidth:700,margin:'0 auto',background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'2.5rem',position:'relative',overflow:'hidden' }}>
        {/* glow */}
        <div style={{ position:'absolute',top:'-50%',right:'-30%',width:400,height:400,borderRadius:'50%',background:C.red,opacity:.04,filter:'blur(100px)' }} />

        {/* sliders */}
        {[
          { label:'Leads per month', val:leads, set:setLeads, min:10, max:300, display:leads },
          { label:'% you miss or respond slow', val:missed, set:setMissed, min:5, max:80, display:`${missed}%` },
          { label:'Average job value ($)', val:value, set:setValue, min:1000, max:50000, display:`$${value.toLocaleString()}` },
        ].map((s,i) => (
          <div key={i} style={{ marginBottom:'2rem',position:'relative',zIndex:1 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'.5rem' }}>
              <span style={{ fontSize:'.9rem',color:C.muted }}>{s.label}</span>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:'.95rem',color:C.white,fontWeight:600 }}>{s.display}</span>
            </div>
            <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(Number(e.target.value))} />
          </div>
        ))}

        {/* results */}
        <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:'2rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'1.5rem',position:'relative',zIndex:1 }}>
          {[
            { label:'Missed Leads', val:missedLeads, pre:'', suf:'/mo' },
            { label:'Lost Jobs', val:lostJobs, pre:'', suf:'/mo' },
            { label:'Monthly Loss', val:monthlyLoss, pre:'$', suf:'', fmt:true },
            { label:'Yearly Loss', val:yearlyLoss, pre:'$', suf:'', fmt:true, highlight:true },
          ].map((r,i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{
                fontFamily:"'Space Mono',monospace",fontSize:r.highlight ? '1.6rem' : '1.3rem',
                fontWeight:700,color:r.highlight ? C.red : C.white,
              }}>
                {r.pre}{r.fmt ? r.val.toLocaleString() : r.val}{r.suf}
              </div>
              <div style={{ fontSize:'.78rem',color:C.muted,marginTop:'.25rem' }}>{r.label}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center',marginTop:'2rem',fontSize:'.95rem',color:C.muted,fontStyle:'italic',position:'relative',zIndex:1 }}>
          That's a crew's salary. Walking out the door.
        </p>
      </div>
    </section>
  )
}

function Testimonials() {
  const ref = useReveal()
  const cards = [
    {
      name:'Peter M.', company:'Affordable Window Systems',
      text:'They replaced MarketSharp completely — 5 custom dashboards, 3 pipelines, AI calling. I went from $2K/month in software to a fraction of that, and my team actually uses the system now.',
      metric:'5 dashboards, 3 pipelines',
    },
    {
      name:'Marcus D.', company:'Summit Roofing',
      text:'I was losing 30+ leads a month and didn\'t even know it. RealSync set up speed-to-lead calling and a real CRM. First month we closed 6 extra jobs.',
      metric:'+6 jobs in month one',
    },
    {
      name:'Jennifer L.', company:'ProShield Exteriors',
      text:'We had 4 different tools that didn\'t talk to each other. Now it\'s one system, one login. My office manager went from data entry to actually managing projects.',
      metric:'4 tools → 1 system',
    },
  ]
  return (
    <section ref={ref} className="reveal">
      <div style={{ textAlign:'center',marginBottom:'3rem' }}>
        <h2 style={{ fontSize:'2rem',fontWeight:700,color:C.white,marginBottom:'.75rem' }}>From the Field</h2>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem' }}>
        {cards.map((c,i) => (
          <div key={i} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'2rem',
            display:'flex',flexDirection:'column',justifyContent:'space-between',
            transition:'border-color .3s',
          }}
            onMouseOver={e => e.currentTarget.style.borderColor=C.red}
            onMouseOut={e => e.currentTarget.style.borderColor=C.border}
          >
            <div>
              <div style={{ color:'#fbbf24',fontSize:'.9rem',marginBottom:'.75rem' }}>★★★★★</div>
              <p style={{ fontSize:'.92rem',color:C.muted,lineHeight:1.7,marginBottom:'1.25rem' }}>"{c.text}"</p>
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'.95rem',fontWeight:600,color:C.white }}>{c.name}</div>
                <div style={{ fontSize:'.8rem',color:C.muted }}>{c.company}</div>
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'.75rem',color:C.red,textAlign:'right' }}>{c.metric}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  const ref = useReveal()
  return (
    <section id="cta" ref={ref} className="reveal" style={{ textAlign:'center',paddingBottom:'8rem' }}>
      <div style={{
        background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'4rem 2rem',
        position:'relative',overflow:'hidden',
      }}>
        <div className="orb orb-3" style={{ width:300,height:300,top:'-30%',left:'-10%' }} />
        <div style={{ position:'relative',zIndex:1 }}>
          <h2 style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:700,color:C.white,marginBottom:'1rem',lineHeight:1.2 }}>
            Ready to stop losing jobs<br />to slow follow-up?
          </h2>
          <p style={{ color:C.muted,maxWidth:480,margin:'0 auto 2rem',fontSize:'1.05rem',lineHeight:1.7 }}>
            30-minute strategy call. We'll map your current stack, find the leaks, and show you exactly what the fix looks like. No pitch deck. No fluff.
          </p>
          <a href="mailto:hello@realsyncpro.com" className="cta-btn" style={{ fontSize:'1.05rem',padding:'1rem 2.5rem' }}>
            Book Your Strategy Call →
          </a>
          <p style={{ marginTop:'1.25rem',fontSize:'.8rem',color:C.muted }}>Free. No commitment. Worst case you leave with a clear picture of what's broken.</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop:`1px solid ${C.border}`,padding:'2.5rem 2rem',textAlign:'center' }}>
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'.85rem',color:C.muted,marginBottom:'.5rem' }}>
        <span style={{ color:C.red }}>{'>'}</span> RealSync Pro
      </div>
      <p style={{ fontSize:'.78rem',color:C.muted }}>Business Efficiency Strategists — Built by Karen & John</p>
      <p style={{ fontSize:'.72rem',color:C.muted,marginTop:'.5rem' }}>© {new Date().getFullYear()} RealSync Pro. All rights reserved.</p>
    </footer>
  )
}

/* ─── APP ─── */
export default function App() {
  return (
    <>
      <GlobalStyles />
      <Nav />
      <Hero />
      <Marquee />
      <PainPoints />
      <TechStack />
      <Calculator />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  )
}
