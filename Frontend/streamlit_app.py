import streamlit as st
import os
import time
from datetime import datetime
from PyPDF2 import PdfReader
from dotenv import load_dotenv

from chunking import chunk_text
from embedding_service import generate_embedding
from vector_store import store_embeddings, search_embeddings
from rag_service import generate_answer

load_dotenv()

st.set_page_config(
    page_title="ResumeIQ \u2014 AI Resume Analyst",
    page_icon="\U0001f4cb",
    layout="wide",
    initial_sidebar_state="collapsed",
)

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&family=Inter:ital,opsz,wght@0,14..32,300..900&display=swap');
:root{
  --bg:#0C0C14;--bg-1:#111120;--bg-2:#16162A;--bg-3:#1C1C35;
  --ac:#5B6EF5;--ac2:#7B8CFF;--ac3:rgba(91,110,245,0.12);--ac-b:rgba(91,110,245,0.30);
  --teal:#0ECDC0;--rose:#F25C7E;--amber:#F5A623;--green:#27C97B;
  --t1:#EAEAF6;--t2:#9898B8;--t3:#5A5A7A;--t4:#3A3A5C;
  --bdr:rgba(255,255,255,0.07);--bdr-a:rgba(91,110,245,0.32);--bdr-t:rgba(14,205,192,0.28);
  --r-xs:6px;--r-sm:10px;--r-md:16px;--r-lg:22px;--r-xl:30px;--r-f:9999px;
  --ease:cubic-bezier(0.25,0,0,1);--spring:cubic-bezier(0.34,1.4,0.64,1);
  --font:'DM Sans','Inter',system-ui,sans-serif;
  --mono:'JetBrains Mono','Fira Code',monospace;
}
*,*::before,*::after{box-sizing:border-box;}
html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth;}
.stApp{background:var(--bg)!important;font-family:var(--font)!important;color:var(--t1)!important;min-height:100vh;}
.main .block-container{padding:0!important;max-width:100%!important;}
#MainMenu,footer,header,[data-testid="stToolbar"],[data-testid="stSidebar"]{display:none!important;}
.stDeployButton{display:none!important;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--t4);border-radius:var(--r-f);}

/* NAV */
.topnav{display:flex;align-items:center;justify-content:space-between;padding:0 3rem;height:62px;
  background:rgba(12,12,20,0.90);backdrop-filter:blur(18px);border-bottom:1px solid var(--bdr);
  position:sticky;top:0;z-index:100;}
.nav-logo{display:flex;align-items:center;gap:0.6rem;}
.nav-mark{width:34px;height:34px;border-radius:var(--r-sm);background:var(--ac);display:flex;
  align-items:center;justify-content:center;font-size:1rem;font-weight:800;color:white;
  letter-spacing:-0.04em;box-shadow:0 0 22px rgba(91,110,245,0.45);}
.nav-name{font-size:1.05rem;font-weight:700;color:var(--t1);letter-spacing:-0.02em;}
.nav-name b{color:var(--ac2);font-weight:800;}
.nav-pill{display:inline-flex;align-items:center;gap:0.45rem;background:var(--ac3);
  border:1px solid var(--ac-b);border-radius:var(--r-f);padding:0.3rem 0.85rem;
  font-size:0.72rem;font-weight:600;color:var(--ac2);}
.live{width:6px;height:6px;border-radius:50%;background:var(--teal);
  animation:livep 2s ease-in-out infinite;}
@keyframes livep{0%,100%{opacity:1;}50%{opacity:0.3;}}

/* HERO */
.hero{text-align:center;padding:4.5rem 1rem 3.5rem;position:relative;max-width:640px;margin:0 auto;}
.hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:560px;height:280px;
  background:radial-gradient(ellipse at 50% 0%,rgba(91,110,245,0.18) 0%,transparent 70%);
  pointer-events:none;}
.hero-ey{display:inline-flex;align-items:center;gap:0.5rem;background:var(--bg-2);
  border:1px solid var(--bdr-a);border-radius:var(--r-f);padding:0.3rem 1rem;
  font-size:0.71rem;font-weight:600;color:var(--ac2);letter-spacing:0.05em;
  text-transform:uppercase;margin-bottom:1.5rem;
  animation:fdown 0.5s var(--ease) both;}
@keyframes fdown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:none;}}
.hero h1{font-size:clamp(2.6rem,5vw,3.8rem);font-weight:800;letter-spacing:-0.04em;
  line-height:1.08;color:var(--t1);margin:0 0 1.2rem;
  animation:fup 0.55s var(--ease) 0.05s both;}
.hero h1 em{font-style:normal;color:var(--ac2);}
.hero-sub{font-size:1.05rem;color:var(--t2);max-width:460px;margin:0 auto 2.5rem;
  line-height:1.65;font-weight:400;animation:fup 0.55s var(--ease) 0.10s both;}
@keyframes fup{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}

/* UPLOAD */
.upload-wrap{max-width:560px;margin:0 auto;animation:fup 0.55s var(--ease) 0.15s both;}
.slabel{font-size:0.69rem;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;
  color:var(--t3);margin-bottom:0.55rem;}
.file-card{display:flex;align-items:center;gap:1rem;background:var(--bg-1);
  border:1px solid var(--bdr-t);border-radius:var(--r-lg);padding:1rem 1.25rem;
  margin-bottom:1.1rem;animation:fin 0.35s var(--spring) both;}
@keyframes fin{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:none;}}
.file-ic{width:44px;height:44px;border-radius:var(--r-sm);
  background:rgba(14,205,192,0.12);border:1px solid rgba(14,205,192,0.25);
  display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
.file-name{font-size:0.9rem;font-weight:600;color:var(--t1);margin-bottom:0.12rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px;}
.file-meta{font-size:0.74rem;color:var(--t3);}

/* PIPELINE */
.pipe-card{background:var(--bg-1);border:1px solid var(--bdr);border-radius:var(--r-lg);
  padding:1.4rem;margin-bottom:1.2rem;max-width:560px;margin-left:auto;margin-right:auto;
  animation:fup 0.4s var(--ease) both;}
.pipe-head{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
  color:var(--t3);margin-bottom:0.9rem;}
.pstep{display:flex;align-items:flex-start;gap:0.8rem;padding:0.6rem 0;position:relative;}
.pstep:not(:last-child)::after{content:'';position:absolute;left:15px;top:36px;bottom:0;
  width:1px;background:linear-gradient(to bottom,var(--bdr),transparent);}
.pdot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:0.76rem;font-weight:800;flex-shrink:0;
  position:relative;z-index:1;transition:all 300ms var(--ease);}
.pdot.idle{background:var(--bg-2);border:1.5px solid var(--t4);color:var(--t4);}
.pdot.run{background:var(--ac3);border:1.5px solid var(--ac);color:var(--ac);
  animation:pglw 1.8s ease-in-out infinite;}
@keyframes pglw{0%,100%{box-shadow:0 0 0 0 rgba(91,110,245,0.5);}50%{box-shadow:0 0 0 6px rgba(91,110,245,0);}}
.pdot.done{background:rgba(39,201,123,0.15);border:1.5px solid rgba(39,201,123,0.5);color:var(--green);}
.pdot.err{background:rgba(242,92,126,0.12);border:1.5px solid rgba(242,92,126,0.45);color:var(--rose);}
.pstep-lbl{font-size:0.86rem;font-weight:600;color:var(--t1);padding-top:0.42rem;}
.pstep-desc{font-size:0.75rem;color:var(--t3);margin-top:0.1rem;}

/* EMBED BAR */
.ebar{margin:0.4rem 0 0.7rem;}
.ebar-hd{display:flex;justify-content:space-between;margin-bottom:0.35rem;}
.ebar-l{font-size:0.75rem;color:var(--t3);font-weight:500;}
.ebar-v{font-size:0.75rem;color:var(--ac2);font-weight:700;}
.ebar-t{height:4px;background:var(--bg-2);border-radius:var(--r-f);overflow:hidden;}
.ebar-f{height:100%;background:linear-gradient(90deg,var(--ac),var(--teal));
  border-radius:var(--r-f);transition:width 0.4s var(--ease);position:relative;overflow:hidden;}
.ebar-f::after{content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
  animation:shim 1.4s ease-in-out infinite;}
@keyframes shim{from{transform:translateX(-200%);}to{transform:translateX(200%);}}

/* SUCCESS BANNER */
.success-bar{display:flex;align-items:center;gap:1rem;background:rgba(39,201,123,0.07);
  border:1px solid rgba(39,201,123,0.22);border-radius:var(--r-lg);padding:1.1rem 1.4rem;
  margin-bottom:2rem;animation:fin 0.4s var(--spring) both;}
.success-ic{width:38px;height:38px;border-radius:var(--r-sm);
  background:rgba(39,201,123,0.14);border:1px solid rgba(39,201,123,0.28);
  display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
.success-t{font-size:0.9rem;font-weight:700;color:var(--green);}
.success-s{font-size:0.76rem;color:var(--t3);margin-top:0.08rem;}
.schips{display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.45rem;}
.schip{display:inline-flex;align-items:center;background:var(--bg-2);border:1px solid var(--bdr);
  border-radius:var(--r-f);padding:0.18rem 0.58rem;font-size:0.7rem;font-weight:600;color:var(--t2);}

/* CHAT */
.cthread{display:flex;flex-direction:column;gap:1.4rem;margin-bottom:1.5rem;}
.cturn{display:flex;gap:0.85rem;}
.cturn.user{flex-direction:row-reverse;}
.cav{width:33px;height:33px;border-radius:var(--r-f);display:flex;align-items:center;
  justify-content:center;font-size:0.8rem;font-weight:800;flex-shrink:0;align-self:flex-end;}
.cav.u{background:var(--ac);color:white;box-shadow:0 0 16px rgba(91,110,245,0.38);}
.cav.a{background:var(--bg-2);border:1px solid var(--bdr-t);color:var(--teal);}
.cbub{max-width:75%;padding:0.88rem 1.1rem;font-size:0.9rem;line-height:1.7;color:var(--t1);word-break:break-word;}
.cturn.user .cbub{background:var(--ac);border-radius:var(--r-md) 4px var(--r-md) var(--r-md);
  box-shadow:0 4px 20px rgba(91,110,245,0.22);}
.cturn.ai .cbub{background:var(--bg-1);border:1px solid var(--bdr);
  border-radius:4px var(--r-md) var(--r-md) var(--r-md);}
.ctime{font-size:0.65rem;color:var(--t4);margin-top:0.22rem;}

/* TYPING */
.typing{display:flex;gap:5px;align-items:center;padding:0.15rem 0;}
.tdot{width:6px;height:6px;border-radius:50%;background:var(--t3);
  animation:bdot 1.3s ease-in-out infinite;}
.tdot:nth-child(2){animation-delay:0.18s;}
.tdot:nth-child(3){animation-delay:0.36s;}
@keyframes bdot{0%,60%,100%{transform:translateY(0);background:var(--t3);}
  30%{transform:translateY(-6px);background:var(--ac2);}}

/* EMPTY CHAT */
.cempty{text-align:center;padding:3rem 1rem;}
.cempty-ic{font-size:2.6rem;display:block;margin-bottom:0.75rem;
  animation:sway 4s ease-in-out infinite;}
@keyframes sway{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg) translateY(-5px);}}
.cempty-t{font-size:0.98rem;font-weight:700;color:var(--t1);margin-bottom:0.35rem;}
.cempty-s{font-size:0.8rem;color:var(--t3);max-width:240px;margin:0 auto;line-height:1.55;}

/* SOURCES */
.srcblock{margin-top:0.8rem;padding-top:0.8rem;border-top:1px solid var(--bdr);}
.srclbl{font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--t4);margin-bottom:0.45rem;}
.srcbadge{display:inline-flex;background:var(--ac3);border:1px solid var(--ac-b);border-radius:var(--r-f);
  padding:0.13rem 0.48rem;font-size:0.63rem;font-weight:700;color:var(--ac2);margin-bottom:0.3rem;}
.srcitem{background:rgba(0,0,0,0.25);border:1px solid var(--bdr);border-radius:var(--r-sm);
  padding:0.6rem 0.8rem;margin-bottom:0.4rem;font-family:var(--mono);font-size:0.73rem;
  color:var(--t3);line-height:1.6;white-space:pre-wrap;word-break:break-word;}

/* STATS */
.sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin-bottom:1.4rem;}
.sbox{background:var(--bg-1);border:1px solid var(--bdr);border-radius:var(--r-lg);
  padding:1.1rem 1.2rem;transition:all 300ms var(--ease);animation:fup 0.4s var(--ease) both;}
.sbox:hover{border-color:var(--bdr-a);transform:translateY(-2px);}
.sbox-ic{font-size:1.35rem;margin-bottom:0.55rem;display:block;}
.sbox-v{font-size:1.65rem;font-weight:800;color:var(--t1);letter-spacing:-0.03em;line-height:1;margin-bottom:0.18rem;}
.sbox-l{font-size:0.74rem;color:var(--t3);font-weight:500;}

/* SEG BAR */
.segw{margin-bottom:0.8rem;}
.segh{display:flex;justify-content:space-between;margin-bottom:0.32rem;}
.segl{font-size:0.77rem;color:var(--t2);font-weight:500;}
.segv{font-size:0.77rem;color:var(--t3);}
.segt{height:4px;background:var(--bg-2);border-radius:var(--r-f);overflow:hidden;}
.segf{height:100%;border-radius:var(--r-f);transition:width 0.7s var(--ease);}

/* CHUNK BROWSER */
.chunkview{background:var(--bg-1);border:1px solid var(--bdr);border-radius:var(--r-lg);padding:1.2rem;}
.chunktext{font-family:var(--mono);font-size:0.77rem;color:var(--t2);line-height:1.7;
  white-space:pre-wrap;word-break:break-word;}

/* HISTORY */
.hitem{background:var(--bg-1);border:1px solid var(--bdr);border-radius:var(--r-lg);
  padding:1.1rem 1.2rem;margin-bottom:0.75rem;transition:border-color 150ms var(--ease);}
.hitem:hover{border-color:var(--bdr-a);}
.hq{font-size:0.86rem;font-weight:600;color:var(--t1);margin-bottom:0.45rem;
  display:flex;align-items:flex-start;gap:0.45rem;}
.hqm{width:17px;height:17px;border-radius:var(--r-f);background:var(--ac);color:white;
  display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800;
  flex-shrink:0;margin-top:0.1rem;}
.ha{font-size:0.82rem;color:var(--t2);line-height:1.6;padding-left:1.5rem;}
.hm{font-size:0.66rem;color:var(--t4);margin-top:0.45rem;padding-left:1.5rem;}

/* INFOBOX */
.infobox{background:var(--bg-1);border:1px solid var(--bdr);border-radius:var(--r-lg);padding:1.25rem 1.4rem;}
.infotable{width:100%;}
.infotable tr{border-bottom:1px solid var(--bdr);}
.infotable tr:last-child{border-bottom:none;}
.infotable td{padding:0.6rem 0;font-size:0.83rem;}
.infotable td:first-child{color:var(--t2);width:55%;}
.infotable td:last-child{color:var(--t1);font-weight:700;text-align:right;}

/* DIVIDER LABEL */
.divlbl{display:flex;align-items:center;gap:0.7rem;color:var(--t4);
  font-size:0.72rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin:1.75rem 0;}
.divlbl::before,.divlbl::after{content:'';flex:1;height:1px;background:var(--bdr);}

/* FOOTER */
.sfooter{border-top:1px solid var(--bdr);padding:2.2rem 2rem;text-align:center;margin-top:3.5rem;position:relative;}
.sfooter::before{content:'';position:absolute;top:-1px;left:30%;right:30%;height:1px;
  background:linear-gradient(90deg,transparent,var(--ac),transparent);}
.flogo{font-size:0.95rem;font-weight:800;color:var(--t2);letter-spacing:-0.02em;}
.flogo b{color:var(--ac2);}
.fcopy{font-size:0.71rem;color:var(--t4);margin-top:0.4rem;}
.flinks{display:flex;justify-content:center;gap:1.4rem;flex-wrap:wrap;margin-top:0.8rem;}
.flink{font-size:0.72rem;color:var(--t3);}

/* STREAMLIT OVERRIDES */
.stTextInput>div>div>input{background:var(--bg-1)!important;border:1px solid var(--bdr)!important;
  border-radius:var(--r-md)!important;color:var(--t1)!important;font-family:var(--font)!important;
  font-size:0.92rem!important;padding:0.78rem 1.1rem!important;caret-color:var(--ac2)!important;
  transition:border-color 150ms,box-shadow 150ms!important;}
.stTextInput>div>div>input:focus{border-color:var(--ac)!important;
  box-shadow:0 0 0 3px rgba(91,110,245,0.18)!important;background:var(--bg-2)!important;outline:none!important;}
.stTextInput>div>div>input::placeholder{color:var(--t4)!important;}
.stTextInput label{color:var(--t3)!important;font-size:0.77rem!important;}
.stButton>button{background:var(--ac)!important;color:white!important;border:none!important;
  border-radius:var(--r-md)!important;font-family:var(--font)!important;
  font-size:0.9rem!important;font-weight:700!important;padding:0.72rem 1.5rem!important;
  box-shadow:0 4px 18px rgba(91,110,245,0.38)!important;letter-spacing:-0.01em!important;
  transition:all 150ms var(--ease)!important;}
.stButton>button:hover{background:var(--ac2)!important;transform:translateY(-1px)!important;
  box-shadow:0 8px 28px rgba(91,110,245,0.50)!important;}
.stButton>button:active{transform:translateY(0)!important;}
[data-testid="stFileUploader"]{background:transparent!important;border:none!important;padding:0!important;}
[data-testid="stFileUploaderDropzone"]{background:var(--bg-1)!important;
  border:1.5px dashed rgba(91,110,245,0.28)!important;border-radius:var(--r-xl)!important;
  transition:all 300ms var(--ease)!important;}
[data-testid="stFileUploaderDropzone"]:hover{border-color:var(--ac)!important;background:var(--bg-2)!important;}
[data-testid="stFileUploaderDropzoneInstructions"]>div{color:var(--t3)!important;}
.stProgress>div>div>div>div{background:linear-gradient(90deg,var(--ac),var(--teal))!important;}
.stTabs [data-baseweb="tab-list"]{background:var(--bg-1)!important;border:1px solid var(--bdr)!important;
  border-radius:var(--r-lg)!important;padding:0.26rem!important;gap:0.18rem!important;}
.stTabs [data-baseweb="tab"]{background:transparent!important;border:none!important;
  border-radius:var(--r-md)!important;color:var(--t3)!important;font-family:var(--font)!important;
  font-weight:600!important;font-size:0.84rem!important;padding:0.48rem 1.05rem!important;transition:all 150ms!important;}
.stTabs [aria-selected="true"]{background:var(--ac)!important;color:white!important;
  box-shadow:0 3px 12px rgba(91,110,245,0.38)!important;}
.stTabs [data-baseweb="tab-panel"]{background:transparent!important;padding-top:1.5rem!important;}
hr{border:none!important;height:1px!important;background:var(--bdr)!important;margin:1.5rem 0!important;}
.stToggle>label{color:var(--t2)!important;font-size:0.84rem!important;}
</style>
"""

BG_JS = """
<script>
(function(){
    const c=document.createElement('canvas');
    c.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.4';
    document.body.prepend(c);
    const ctx=c.getContext('2d');
    function resize(){c.width=innerWidth;c.height=innerHeight;}
    resize();window.addEventListener('resize',resize);
    const COLS=['rgba(91,110,245,','rgba(14,205,192,','rgba(123,140,255,'];
    class P{
        constructor(){this.reset();}
        reset(){this.x=Math.random()*c.width;this.y=c.height+10;
            this.r=Math.random()*1.7+0.4;this.vy=Math.random()*0.42+0.12;
            this.vx=(Math.random()-0.5)*0.26;
            this.col=COLS[Math.floor(Math.random()*COLS.length)];
            this.l=0;this.ml=Math.random()*250+160;}
        tick(){this.x+=this.vx;this.y-=this.vy;this.l++;
            const f=this.l/this.ml;
            this.a=f<0.1?f*5.5:f>0.82?(1-f)*5.5:0.5;
            if(this.l>=this.ml)this.reset();}
        draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.fillStyle=this.col+this.a+')';ctx.fill();}
    }
    const ps=Array.from({length:50},()=>{
        const p=new P();p.l=Math.floor(Math.random()*p.ml);
        p.y=Math.random()*c.height;return p;
    });
    function loop(){ctx.clearRect(0,0,c.width,c.height);
        ps.forEach(p=>{p.tick();p.draw();});requestAnimationFrame(loop);}
    loop();
    setInterval(()=>{const el=document.getElementById('chatscroll');
        if(el)el.scrollTop=el.scrollHeight;},500);
})();
</script>
"""


def init():
    defaults = dict(uploaded=False, filename=None, text="", chunks=[],
                    chat=[], questions=0, proc_time=0.0, show_src=True)
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def ts():
    return datetime.now().strftime("%I:%M %p")


def wc(t):
    return len(t.split()) if t else 0


def fsize(b):
    if b < 1024: return f"{b} B"
    if b < 1048576: return f"{b/1024:.1f} KB"
    return f"{b/1048576:.1f} MB"


def clip(t, n=120):
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "\u2026"


PIPE_DEF = [
    ("read",  "Extracting Text",       "Reading all pages from the PDF"),
    ("chunk", "Chunking Content",      "Splitting into 500-character segments"),
    ("embed", "Building Vector Index", "Generating semantic embeddings"),
    ("store", "Saving to Database",    "Persisting vectors for fast retrieval"),
]


def render_pipe(sts):
    rows = ""
    for sid, title, desc in PIPE_DEF:
        s = sts.get(sid, "idle")
        ic = {"idle": "\u25cb", "run": "\u25c9", "done": "\u2713", "err": "\u2715"}[s]
        rows += (f'<div class="pstep"><div class="pdot {s}">{ic}</div>'
                 f'<div><div class="pstep-lbl">{title}</div>'
                 f'<div class="pstep-desc">{desc}</div></div></div>')
    return (f'<div class="pipe-card"><div class="pipe-head">Processing Pipeline</div>'
            f'<div class="pipe-steps">{rows}</div></div>')


def ebar_html(cur, total):
    pct = int(cur / max(total, 1) * 100)
    return (f'<div class="ebar" style="max-width:560px;margin-left:auto;margin-right:auto">'
            f'<div class="ebar-hd"><span class="ebar-l">Building index</span>'
            f'<span class="ebar-v">{cur}/{total}</span></div>'
            f'<div class="ebar-t"><div class="ebar-f" style="width:{pct}%"></div></div></div>')


def process_resume(file):
    t0 = time.time()
    pipe_ph = st.empty()
    embed_ph = st.empty()
    sts = {s[0]: "idle" for s in PIPE_DEF}

    def upd(sid=None, new=None):
        if sid:
            sts[sid] = new
        pipe_ph.markdown(render_pipe(sts), unsafe_allow_html=True)

    try:
        upd("read", "run")
        reader = PdfReader(file)
        text = "".join(p.extract_text() or "" for p in reader.pages)
        if not text.strip():
            raise ValueError("No readable text found. The PDF may be scanned or image-based.")
        upd("read", "done")

        upd("chunk", "run")
        chunks = chunk_text(text)
        upd("chunk", "done")

        upd("embed", "run")
        embeddings = []
        for i, chunk in enumerate(chunks):
            embeddings.append(generate_embedding(chunk))
            embed_ph.markdown(ebar_html(i + 1, len(chunks)), unsafe_allow_html=True)
        embed_ph.empty()
        upd("embed", "done")

        upd("store", "run")
        store_embeddings(chunks, embeddings)
        upd("store", "done")

        elapsed = time.time() - t0
        st.session_state.update(uploaded=True, filename=file.name, text=text,
                                chunks=chunks, proc_time=elapsed)
        time.sleep(0.5)
        pipe_ph.empty()
        st.rerun()

    except Exception as e:
        for k in sts:
            if sts[k] == "run":
                sts[k] = "err"
        upd()
        st.error(f"\u274c {e}")


PROMPTS = [
    ("\U0001f3af", "What are my key technical skills?"),
    ("\U0001f3e2", "Where have I worked?"),
    ("\U0001f393", "What is my education?"),
    ("\U0001f3c6", "What are my top achievements?"),
    ("\U0001f6e0\ufe0f", "What technologies do I know?"),
    ("\U0001f4c5", "How many years of experience?"),
    ("\U0001f310", "What programming languages?"),
    ("\U0001f4cd", "What roles have I held?"),
]


def ask(q):
    st.session_state.chat.append(dict(role="user", text=q, ts=ts(), src=[]))
    st.session_state.questions += 1
    spin = st.empty()
    spin.markdown(
        '<div class="cturn ai"><div class="cav a">AI</div>'
        '<div class="cbub"><div class="typing">'
        '<div class="tdot"></div><div class="tdot"></div><div class="tdot"></div>'
        '</div></div></div>',
        unsafe_allow_html=True)
    try:
        qe = generate_embedding(q)
        res = search_embeddings(qe, top_k=3)
        sources = res["documents"][0] if res.get("documents") else []
        ctx = "\n\n".join(sources)
        if not ctx:
            answer = ("I couldn\u2019t find relevant information in your resume for this question. "
                      "Try rephrasing or ask about a different aspect of your background.")
        else:
            answer = generate_answer(q, ctx)
        spin.empty()
        st.session_state.chat.append(
            dict(role="ai", text=answer, ts=ts(),
                 src=sources if st.session_state.show_src else []))
    except Exception as e:
        spin.empty()
        st.session_state.chat.append(
            dict(role="ai", text=f"Something went wrong: {e}", ts=ts(), src=[]))
    st.rerun()


def chat_html():
    if not st.session_state.chat:
        return ('<div class="cempty"><span class="cempty-ic">\U0001f4ac</span>'
                '<div class="cempty-t">No messages yet</div>'
                '<div class="cempty-s">Use a quick prompt or type your own question below.</div></div>')
    out = '<div class="cthread">'
    for m in st.session_state.chat:
        is_u = m["role"] == "user"
        cls = "user" if is_u else "ai"
        av = "U" if is_u else "AI"
        avc = "u" if is_u else "a"
        src_html = ""
        if not is_u and m.get("src"):
            items = "".join(
                f'<div class="srcbadge">Source {i}</div>'
                f'<div class="srcitem">{clip(s, 220)}</div>'
                for i, s in enumerate(m["src"][:3], 1))
            src_html = f'<div class="srcblock"><div class="srclbl">Context used</div>{items}</div>'
        out += (f'<div class="cturn {cls}"><div class="cav {avc}">{av}</div>'
                f'<div><div class="cbub">{m["text"]}{src_html}</div>'
                f'<div class="ctime">{m["ts"]}</div></div></div>')
    out += '</div>'
    return out


def render_nav():
    status = ""
    if st.session_state.uploaded:
        status = (f'<div class="nav-pill"><div class="live"></div>'
                  f'{clip(st.session_state.filename, 30)} \u00b7 Ready</div>')
    st.markdown(
        f'<div class="topnav"><div class="nav-logo">'
        f'<div class="nav-mark">R</div>'
        f'<div class="nav-name">Resume<b>IQ</b></div>'
        f'</div>{status}</div>',
        unsafe_allow_html=True)


def render_upload():
    st.markdown(
        '<div style="max-width:640px;margin:0 auto;padding:0 1.5rem">'
        '<div class="hero">'
        '<div class="hero-ey">\u2736 AI-Powered \u00b7 Instant Answers</div>'
        '<h1>Understand your<br><em>resume deeply</em></h1>'
        '<div class="hero-sub">Upload your CV once, ask anything \u2014 skills, experience, achievements \u2014 '
        'and get precise, context-aware answers instantly.</div>'
        '</div>'
        '<div class="upload-wrap">',
        unsafe_allow_html=True)

    st.markdown('<div class="slabel">Upload your resume to begin</div>', unsafe_allow_html=True)
    f = st.file_uploader("Resume PDF", type=["pdf"], label_visibility="collapsed", key="fup")

    if f:
        sz = len(f.getvalue())
        st.markdown(
            f'<div class="file-card"><div class="file-ic">\U0001f4c4</div>'
            f'<div style="flex:1;min-width:0">'
            f'<div class="file-name">{f.name}</div>'
            f'<div class="file-meta">{fsize(sz)} \u00b7 PDF</div>'
            f'</div><span style="color:var(--green);font-size:1.2rem">\u2713</span></div>',
            unsafe_allow_html=True)
        if st.button("\u26a1\u2002 Analyse Resume", use_container_width=True):
            process_resume(f)

    st.markdown('</div></div>', unsafe_allow_html=True)

    st.markdown(
        '<div style="max-width:640px;margin:1.5rem auto 0;padding:0 1.5rem 5rem">'
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem">'
        + "".join(
            f'<div style="background:var(--bg-1);border:1px solid var(--bdr);'
            f'border-radius:var(--r-lg);padding:1.1rem;text-align:center">'
            f'<div style="font-size:1.5rem;margin-bottom:0.45rem">{ic}</div>'
            f'<div style="font-size:0.83rem;font-weight:700;color:var(--t1);margin-bottom:0.22rem">{t}</div>'
            f'<div style="font-size:0.73rem;color:var(--t3);line-height:1.5">{d}</div></div>'
            for ic, t, d in [
                ("\U0001f4e5", "Upload PDF", "Any size, any length, any format."),
                ("\u26a1", "Instant Index", "Chunked and vectorised in seconds."),
                ("\U0001f4ac", "Ask Anything", "Natural language Q&A from your actual CV."),
            ]) +
        '</div></div>',
        unsafe_allow_html=True)


def render_app():
    ch = len(st.session_state.chunks)
    wds = wc(st.session_state.text)
    pg = max(1, wds // 300)
    pt = st.session_state.proc_time

    st.markdown(
        f'<div style="padding:1.5rem 2.5rem 0">'
        f'<div class="success-bar"><div class="success-ic">\u2713</div>'
        f'<div style="flex:1"><div class="success-t">Ready \u2014 {clip(st.session_state.filename, 50)}</div>'
        f'<div class="success-s">Indexed and ready to answer your questions.</div>'
        f'<div class="schips">'
        f'<span class="schip">{ch} chunks</span>'
        f'<span class="schip">~{wds:,} words</span>'
        f'<span class="schip">~{pg} pages</span>'
        f'<span class="schip">{pt:.1f}s</span>'
        f'</div></div></div></div>',
        unsafe_allow_html=True)

    tab_qa, tab_an, tab_hi = st.tabs([
        "\U0001f4ac\u2002 Ask Questions",
        "\U0001f4ca\u2002 Analytics",
        "\U0001f4dc\u2002 History",
    ])

    with tab_qa:
        st.markdown('<div style="padding:0 0.2rem">', unsafe_allow_html=True)
        st.markdown('<div class="slabel">Quick prompts</div>', unsafe_allow_html=True)
        cols = st.columns(4)
        for i, (icon, ptxt) in enumerate(PROMPTS):
            short = ptxt[:22] + "\u2026" if len(ptxt) > 22 else ptxt
            with cols[i % 4]:
                if st.button(f"{icon} {short}", key=f"p{i}", use_container_width=True):
                    ask(ptxt)

        st.markdown('<div style="height:0.4rem"></div>', unsafe_allow_html=True)
        st.markdown(
            f'<div id="chatscroll" style="max-height:470px;overflow-y:auto;padding:0.2rem 0">'
            f'{chat_html()}</div>',
            unsafe_allow_html=True)

        st.markdown('<div style="height:0.6rem"></div>', unsafe_allow_html=True)
        ci, cb = st.columns([5, 1])
        with ci:
            q = st.text_input("q", placeholder="E.g. What Python frameworks do I know?",
                              label_visibility="collapsed", key="qi")
        with cb:
            send = st.button("Send \u2192", use_container_width=True)
        if send and q.strip():
            ask(q.strip())

        st.session_state.show_src = st.toggle(
            "Show source context", value=st.session_state.show_src, key="srctog")

        if st.session_state.chat:
            if st.button("Clear conversation", key="clearchat"):
                st.session_state.chat = []
                st.session_state.questions = 0
                st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    with tab_an:
        chunks = st.session_state.chunks
        text = st.session_state.text
        ch2 = len(chunks)
        wds2 = wc(text)
        rt = max(1, round(wds2 / 200))
        sc = sum(1 for c in chunks if len(c) < 300)
        mc = sum(1 for c in chunks if 300 <= len(c) < 450)
        lc = sum(1 for c in chunks if len(c) >= 450)
        avg = len(text) // max(ch2, 1)
        mx = max(len(c) for c in chunks) if chunks else 0

        st.markdown(
            '<div class="sgrid">'
            + "".join(
                f'<div class="sbox"><span class="sbox-ic">{ic}</span>'
                f'<div class="sbox-v">{v}</div><div class="sbox-l">{l}</div></div>'
                for ic, v, l in [
                    ("\U0001f4dd", f"{wds2:,}", "Total Words"),
                    ("\U0001f9e9", str(ch2), "Vector Chunks"),
                    ("\U0001f4d6", f"~{max(1, wds2//300)}", "Est. Pages"),
                    ("\u23f1\ufe0f", f"{rt}m", "Reading Time"),
                ]) +
            '</div>',
            unsafe_allow_html=True)

        cl, cr = st.columns(2)
        with cl:
            st.markdown(
                '<div class="infobox"><div class="slabel" style="margin-bottom:0.9rem">Chunk distribution</div>'
                + "".join(
                    f'<div class="segw"><div class="segh">'
                    f'<span class="segl">{lb}</span><span class="segv">{cnt}</span>'
                    f'</div><div class="segt">'
                    f'<div class="segf" style="width:{int(cnt/max(ch2,1)*100)}%;background:{col}"></div>'
                    f'</div></div>'
                    for lb, cnt, col in [
                        ("Short < 300 chars", sc, "var(--teal)"),
                        ("Medium 300\u2013450", mc, "var(--ac)"),
                        ("Long 450+ chars", lc, "var(--rose)"),
                    ]) +
                f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;margin-top:0.9rem">'
                + "".join(
                    f'<div style="background:var(--bg-2);border:1px solid var(--bdr);'
                    f'border-radius:var(--r-sm);padding:0.6rem;text-align:center">'
                    f'<div style="font-size:1.05rem;font-weight:800;color:var(--t1)">{v}</div>'
                    f'<div style="font-size:0.69rem;color:var(--t3)">{l}</div></div>'
                    for v, l in [(avg, "Avg length"), (mx, "Max length")]) +
                '</div></div>',
                unsafe_allow_html=True)

        with cr:
            st.markdown(
                '<div class="infobox"><div class="slabel" style="margin-bottom:0.9rem">Session stats</div>'
                '<table class="infotable">'
                + "".join(
                    f'<tr><td>{lb}</td><td>{v}</td></tr>'
                    for lb, v in [
                        ("Questions asked", str(st.session_state.questions)),
                        ("Processing time", f"{pt:.2f}s"),
                        ("Characters indexed", f"{len(text):,}"),
                        ("Avg chunk length", f"{avg} chars"),
                    ]) +
                '</table></div>',
                unsafe_allow_html=True)

        st.markdown('<div style="height:1rem"></div>', unsafe_allow_html=True)
        if chunks:
            st.markdown('<div class="slabel">Chunk browser</div>', unsafe_allow_html=True)
            idx = st.slider("Chunk", 1, len(chunks), 1, key="chksl", label_visibility="collapsed")
            c_t = chunks[idx - 1]
            st.markdown(
                f'<div class="chunkview">'
                f'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.7rem">'
                f'<span style="font-size:0.69rem;font-weight:700;color:var(--t3);'
                f'text-transform:uppercase;letter-spacing:0.07em">Chunk {idx} of {len(chunks)}</span>'
                f'<span style="font-size:0.69rem;color:var(--t3)">{len(c_t)} chars</span></div>'
                f'<div class="chunktext">{c_t}</div></div>',
                unsafe_allow_html=True)

        with st.expander("\U0001f4c4 View extracted text"):
            st.code(text[:3000] + ("\n\n\u2026[truncated]" if len(text) > 3000 else ""), language=None)

    with tab_hi:
        pairs = []
        msgs = st.session_state.chat
        for i, m in enumerate(msgs):
            if m["role"] == "user":
                a = msgs[i + 1] if i + 1 < len(msgs) and msgs[i + 1]["role"] == "ai" else None
                pairs.append((m, a))

        if not pairs:
            st.markdown(
                '<div class="cempty"><span class="cempty-ic">\U0001f4dc</span>'
                '<div class="cempty-t">No history yet</div>'
                '<div class="cempty-s">Your conversation history will appear here.</div></div>',
                unsafe_allow_html=True)
        else:
            for i, (q, a) in enumerate(reversed(pairs), 1):
                n = len(pairs) - i + 1
                st.markdown(
                    f'<div class="hitem"><div class="hq">'
                    f'<div class="hqm">Q</div>{q["text"]}</div>'
                    + (f'<div class="ha">{clip(a["text"], 220)}</div>'
                       f'<div class="hm">{a["ts"]}</div>' if a else "") +
                    '</div>',
                    unsafe_allow_html=True)

            if st.button("Clear history", key="clhi"):
                st.session_state.chat = []
                st.session_state.questions = 0
                st.rerun()

    st.markdown('<div style="padding:0.5rem 2.5rem 0">', unsafe_allow_html=True)
    st.markdown('<div class="divlbl">analyse a different resume</div>', unsafe_allow_html=True)
    if st.button("\u2191\u2002Upload New Resume", key="reup"):
        for k in ["uploaded", "filename", "text", "chunks", "chat", "questions", "proc_time"]:
            st.session_state[k] = (
                False if k == "uploaded" else
                [] if k in ["chunks", "chat"] else
                0 if k == "questions" else
                0.0 if k == "proc_time" else None)
        st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)


def render_footer():
    yr = datetime.now().year
    st.markdown(
        f'<div class="sfooter"><div class="flogo">Resume<b>IQ</b></div>'
        f'<div class="fcopy">\u00a9 {yr} ResumeIQ \u2014 AI Resume Analysis Platform</div>'
        f'<div class="flinks">'
        + "".join(f'<span class="flink">{t}</span>'
                  for t in ["Vector Search", "Semantic Chunking", "RAG Pipeline"]) +
        '</div></div>',
        unsafe_allow_html=True)


def main():
    st.markdown(CSS, unsafe_allow_html=True)
    st.markdown(BG_JS, unsafe_allow_html=True)
    init()
    render_nav()
    if not st.session_state.uploaded:
        render_upload()
    else:
        render_app()
    render_footer()


if __name__ == "__main__":
    main()
