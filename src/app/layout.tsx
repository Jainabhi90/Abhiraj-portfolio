import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Inter} from 'next/font/google';
import Navbar from '@/components/Navbar';
import {MotionSystem,Preloader,Cursor} from '@/components/Interactions';
import {profile} from '@/content/portfolio';
import './globals.css';
const display=localFont({src:[{path:'../../public/fonts/display.woff2',weight:'500'},{path:'../../public/fonts/display-bold.woff2',weight:'600'}],variable:'--font-display',display:'swap'});
const editorial=localFont({src:'../../public/fonts/editorial.woff2',variable:'--font-editorial',display:'swap',preload:false});
const mono=localFont({src:'../../public/fonts/mono.woff2',variable:'--font-mono',display:'swap',preload:false});
const body=Inter({subsets:['latin'],variable:'--font-body',display:'swap'});
export const metadata:Metadata={metadataBase:new URL(profile.site),title:{default:'Abhiraj Jain | Software Engineer & Co-Founder',template:'%s | Abhiraj Jain'},description:'Portfolio of Abhiraj Jain, a software engineer and co-founder of NioLearn. Explore full-stack applications, backend systems, and technical projects.',alternates:{canonical:'/'},openGraph:{title:'Abhiraj Jain | Software Engineer & Co-Founder',description:'Building real products from idea to production.',type:'website',images:['/social.png']},twitter:{card:'summary_large_image',images:['/social.png']},robots:{index:true,follow:true}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className={`${display.variable} ${editorial.variable} ${mono.variable} ${body.variable}`}><body id="top"><a className="skip-link" href="#main-content">Skip to content</a><Navbar/><main id="main-content" tabIndex={-1}>{children}</main><Preloader/><MotionSystem/><Cursor/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Person',name:profile.name,url:profile.site,jobTitle:'Software Engineer & Co-Founder',sameAs:[profile.github,profile.linkedin],alumniOf:{'@type':'CollegeOrUniversity',name:'Vedam School of Technology, Ajeenkya DY Patil University'}})}}/></body></html>}
