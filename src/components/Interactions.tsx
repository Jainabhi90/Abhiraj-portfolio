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
  if(box&&stage){ScrollTrigger.matchMedia({'(min-width: 768px)':()=>{gsap.fromTo(box,{scale:.48,rotation:-9,xPercent:25},{scale:1,rotation:0,xPercent:0,ease:'none',scrollTrigger:{trigger:stage,start:'top bottom',end:'center center',scrub:.65,invalidateOnRefresh:true}});}});}
 });
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
 const done=setTimeout(()=>{setActive(false);sessionStorage.setItem('aj-intro','1');},2150);
 return()=>{clearTimeout(init);clearInterval(interval);clearTimeout(done);};},[]);
 function skip(){setActive(false);sessionStorage.setItem('aj-intro','1');}
 return <div className={`intro ${active?'intro-active':''}`} aria-hidden={!active}><span className="mono intro-brand">AJ. / AN INTRODUCTION</span><div className="greeting" key={word}>{greetings[word]}</div><button onClick={skip} tabIndex={active?0:-1}>Skip intro ↗</button><span className="intro-caption mono">A BRIEF HELLO. THEN, THE WORK.</span><span className="intro-track"><i/></span></div>;
}

export function InteractiveName(){const ref=useRef<HTMLHeadingElement>(null);return <h1 ref={ref} className="hero-name" onPointerMove={e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const box=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--px',`${e.clientX-box.left}px`);e.currentTarget.style.setProperty('--py',`${e.clientY-box.top}px`);}}><span>ABHIRAJ</span><span className="last-name">JAIN<span className="name-period">.</span></span><span className="name-surface" aria-hidden="true"><span>ABHIRAJ</span><span className="last-name">JAIN.</span></span></h1>}

export function Cursor(){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const el=ref.current;if(!el)return;let frame=0;const move=(e:PointerEvent)=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{el.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;el.style.opacity='1';const target=e.target as HTMLElement;el.classList.toggle('cursor-link',!!target.closest('a,button'));});};document.addEventListener('pointermove',move,{passive:true});return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);};},[]);return <div ref={ref} className="cursor" aria-hidden="true"/>;}

export function CopyEmail({email}:{email:string}){const [message,setMessage]=useState('Copy email');return <><button className="copy-button mono" onClick={async()=>{try{await navigator.clipboard.writeText(email);setMessage('Email copied ✓');}catch{setMessage('Select the email to copy');}}}>{message}</button><span className="sr-only" role="status">{message==='Copy email'?'':message}</span></>}
