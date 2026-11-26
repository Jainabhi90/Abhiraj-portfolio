import Link from 'next/link';
export const metadata={title:'Page not found'};
export default function NotFound(){return <section className="section"><span className="mono">404 / NOT FOUND</span><h1 className="section-title">A wrong turn.<br/><em>Let&apos;s head back.</em></h1><Link href="/" className="text-link">Back to the portfolio ↗</Link></section>}
