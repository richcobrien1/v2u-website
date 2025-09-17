import Link from 'next/link'
import { useTheme } from '@/components/theme/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgClass = isDark
    ? 'bg-[linear-gradient(180deg,#212121FF,#111111FF)] text-white'
    : 'bg-[#dfdfdfff] text-black'

  const accentText = isDark ? 'text-white/90' : 'text-black/80'
  const secondaryText = isDark ? 'text-white/80' : 'text-black/60'
  const borderClass = isDark ? 'border-white/20 hover:border-white/30' : 'border-black/20 hover:border-black/30'
  const linkHover = isDark ? 'hover:text-white' : 'hover:text-black'
  const iconBg = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
  const dividerBorder = isDark ? 'border-white/20' : 'border-black/20'

  return (
    <footer className={`w-full ${bgClass}`}>
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 gap-10 text-center">
          {/* Company */}
          <div>
            <h4 className="m-3 text-lg font-semibold">v2u</h4>
            <p className={`text-sm ${accentText}`}>
              9200 E Mineral Avenue, Flr 100<br />
              Centennial, CO 80112<br />
              United States
            </p>
            <p className={`mt-3 text-sm ${secondaryText}`}>
              Email: admin@v2u.us<br />
              Phone: +1 (720) 656-9650
            </p>
          </div>

          {/* Map */}
          <div>
            <Link
              href="https://maps.google.com?q=9200+E+Mineral+Avenue+Centennial+CO"
              target="_blank"
              className={`inline-block rounded-lg border ${borderClass}`}
            >
              <h4 className="m-3 text-lg font-semibold">find us</h4>
              <iframe
                className="block w-full h-full rounded-xl shadow-lg"
                data-testid="embed-iframe"
                style={{ borderRadius: '12px', border: 0 }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3708.0832520852523!2d-104.88489192403051!3d39.57343587158767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x876c85c89267218d%3A0xca3a15da98456a8f!2s9200%20E%20Mineral%20Ave%2C%20Englewood%2C%20CO%2080112!5e1!3m2!1sen!2sus!4v1757047266426!5m2!1sen!2sus"
                width="600"
                height="450"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Link>
          </div>

          {/* Links */}
          <div>
            <h4 className="m-3 text-lg font-semibold">links</h4>
            <ul className={`space-y-2 text-sm ${accentText}`}>
              <li><Link href="#" className={linkHover}>company</Link></li>
              <li><Link href="#" className={linkHover}>press</Link></li>
              <li><Link href="#" className={linkHover}>partners</Link></li>
              <li><Link href="#" className={linkHover}>careers</Link></li>
              <li><Link href="#" className={linkHover}>help center</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="m-3 text-lg font-semibold">social</h4>
            <div className="mt-2 flex justify-center gap-3">
              <Link href="#" aria-label="X" className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>𝕏</Link>
              <Link href="#" aria-label="YouTube" className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>▶</Link>
              <Link href="#" aria-label="LinkedIn" className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>in</Link>
            </div>
          </div>
        </div>

        <div className={`mt-10 border-t ${dividerBorder} pt-6 text-center text-xs ${secondaryText}`}>
          © {new Date().getFullYear()} v2u — all rights reserved.
        </div>
      </div>
    </footer>
  )
}