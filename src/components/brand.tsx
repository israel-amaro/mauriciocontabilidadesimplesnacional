import Link from 'next/link';
import { brand } from '@/lib/brand';
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label={`${brand.company} — início`}>
    {brand.logo ? <img src={brand.logo} alt={brand.company} className="brand-logo" /> : <><span className="brand-monogram">mr<span>.</span></span><span className="brand-name">MAURÍCIO ROCHA<small>CONTABILIDADE</small></span></>}
  </Link>;
}
