'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function MotionSystem(){
 const path=usePathname();
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 gsap.registerPlugin(ScrollTrigger);
 const lenis=new Lenis({duration:1.05,smoothWheel:true,anchors:true});
 const update=(time:number)=>lenis.raf(time*1000); lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(update);
 const ctx=gsap.context(()=>{
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{y:28,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
  const box=document.querySelector('.scroll-object'); const stage=document.querySelector('.scroll-stage');
  if(box&&stage){const mm=gsap.matchMedia();mm.add('(min-width: 768px)',()=>{const timeline=gsap.timeline({scrollTrigger:{trigger:stage,start:'top 95%',end:'center 45%',scrub:.65,invalidateOnRefresh:true}});timeline.fromTo(box,{scale:.28,xPercent:38,yPercent:-8,rotation:-14,borderRadius:28},{scale:.58,xPercent:-17,yPercent:0,rotation:7,borderRadius:6,duration:1}).to(box,{scale:1,xPercent:0,rotation:0,borderRadius:0,duration:1.2}).to('.object-title',{y:-12,opacity:0,duration:.3},1.15).fromTo('.rectangle-resolve',{opacity:0,y:30},{opacity:1,y:0,duration:.55},1.55).to('.system-map',{opacity:0,y:20,duration:.3},1.15);});}

 });
 const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);
 return()=>{ctx.revert();gsap.ticker.remove(update);lenis.destroy();};
 },[path]);
 useEffect(()=>{if(path!=='/'){document.getElementById('main-content')?.focus({preventScroll:true});}},[path]);
 return null;
}

export function Preloader(){
 const [active,setActive]=useState(false); const [word,setWord]=useState(0);
 const greetings=['Hello','नमस्ते','Bonjour','Hola','Ciao','こんにちは','Hallo',"Hello, I'm Abhiraj."];
 useEffect(()=>{if(sessionStorage.getItem('aj-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const init=setTimeout(()=>setActive(true),0); const interval=setInterval(()=>setWord(w=>Math.min(w+1,7)),230);
 const done=setTimeout(()=>{setActive(false);document.documentElement.classList.add('intro-complete');sessionStorage.setItem('aj-intro','1');},2400);
 return()=>{clearTimeout(init);clearInterval(interval);clearTimeout(done);};},[]);
 function skip(){setActive(false);document.documentElement.classList.add('intro-complete');sessionStorage.setItem('aj-intro','1');}
 return <div className={`intro ${active?'intro-active':''}`} aria-hidden={!active}><span className="mono intro-brand">AJ. / AN INTRODUCTION</span><div className="greeting" key={word}>{greetings[word]}</div><button onClick={skip} tabIndex={active?0:-1}>Skip intro ↗</button><span className="intro-caption mono">A BRIEF HELLO. THEN, THE WORK.</span><span className="intro-track"><i/></span></div>;
}

export function InteractiveName(){const ref=useRef<HTMLHeadingElement>(null);const frame=useRef(0);useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);function reset(){cancelAnimationFrame(frame.current);ref.current?.querySelectorAll<HTMLElement>('.name-glyph').forEach(el=>{el.style.transform='';el.style.filter='';});}return <h1 ref={ref} className="hero-name elastic-name" aria-label="Abhiraj Jain" onPointerMove={e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const x=e.clientX,y=e.clientY;cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{ref.current?.querySelectorAll<HTMLElement>('.name-glyph').forEach(el=>{const r=el.getBoundingClientRect(),dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2);const strength=Math.max(0,1-Math.hypot(dx,dy)/230);el.style.transform=`translate3d(${dx*strength*.07}px,${dy*strength*.14}px,0) skewY(${dx*strength*.025}deg) scaleY(${1+strength*.08})`;el.style.filter=strength>.15?'url(#name-warp)':'';});});}} onPointerLeave={reset}><svg width="0" height="0" aria-hidden="true"><defs><filter id="name-warp" x="-15%" y="-20%" width="130%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.025" numOctaves="1" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>{['ABHIRAJ','jain.'].map((line,i)=><span key={line} className={i?'last-name name-line':'name-line'} aria-hidden="true">{[...line].map((c,j)=><span key={j} className={`name-glyph ${c==='.'?'name-period':''}`}>{c}</span>)}</span>)}</h1>}

export function Cursor(){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const el=ref.current;if(!el)return;let frame=0;const move=(e:PointerEvent)=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{el.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;el.style.opacity='1';const target=e.target as HTMLElement;el.classList.toggle('cursor-link',!!target.closest('a,button'));});};document.addEventListener('pointermove',move,{passive:true});return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);};},[]);return <div ref={ref} className="cursor" aria-hidden="true"/>;}

export function CopyEmail({email}:{email:string}){const [message,setMessage]=useState('Copy email');return <><button className="copy-button mono" onClick={async()=>{try{await navigator.clipboard.writeText(email);setMessage('Email copied ✓');}catch{setMessage('Select the email to copy');}}}>{message}</button><span className="sr-only" role="status">{message==='Copy email'?'':message}</span></>}
