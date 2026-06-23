'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Music, Mail } from 'lucide-react'
import { FooterSettings } from '@/lib/footerTypes'

export default function Footer() {
  const year = new Date().getFullYear()
  const [settings, setSettings] = useState<FooterSettings>({
    email: 'soxibgaybullayev439@gmail.com',
    developerName: 'Sokhib Khaybullayev',
    developerRole: 'Full-stack Developer',
    description: "O'zbek milliy musiqasini sevuvchilar uchun zamonaviy musiqa streaming platforma.",
    techStack: 'Next.js 14, TypeScript, Tailwind CSS, Cloudinary va JSONBin.io bilan qurildi.',
  })

  useEffect(() => {
    fetch('/api/admin/footer')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings)
        }
      })
      .catch((e) => console.error('Failed to load footer settings', e))
  }, [])

  return (
    <footer className="bg-[#070A12] mt-auto">
      {/* Uzbekistan flag stripe */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, #009FE3 33.3%, #CE1126 33.3%, #CE1126 34.2%, #FFFFFF 34.2%, #FFFFFF 65.8%, #CE1126 65.8%, #CE1126 66.7%, #00A550 66.7%)',
        }}
      />

      <div className="px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #009FE3, #00A550)' }}
              >
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">MilliyPlayer</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {settings.description}
            </p>
            {/* Mini Uzbek flag */}
            <div
              className="h-1 w-24 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #009FE3 33%, #CE1126 33%, #CE1126 34%, #FFFFFF 34%, #FFFFFF 66%, #CE1126 66%, #CE1126 67%, #00A550 67%)',
              }}
            />
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-300 font-semibold text-xs mb-4 tracking-widest uppercase">
              Sahifalar
            </h4>
            <div className="space-y-2.5">
              {[
                { href: '/home', label: 'Bosh sahifa' },
                { href: '/search', label: 'Qidirish' },
                { href: '/categories', label: 'Kategoriyalar' },
                { href: '/favorites', label: 'Sevimlilar' },
                { href: '/login', label: 'Kirish / Ro\'yxatdan o\'tish' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-gray-400 hover:text-[#009FE3] text-sm transition-colors duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Developer */}
          <div>
            <h4 className="text-gray-300 font-semibold text-xs mb-4 tracking-widest uppercase">
              Ishlab Chiquvchi
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #009FE3, #00A550)' }}
              >
                {settings.developerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{settings.developerName}</p>
                <p className="text-gray-400 text-xs">{settings.developerRole}</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">
              {settings.techStack}
            </p>
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-1.5 text-[#009FE3] hover:text-[#33B5EA] text-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {settings.email}
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-5">
          <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-2 flex-wrap">
            <span>© {year} MilliyPlayer</span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1">
              {settings.developerName} tomonidan yaratildi
            </span>
            <span className="text-gray-700">•</span>
            <span>Barcha huquqlar himoyalangan</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
