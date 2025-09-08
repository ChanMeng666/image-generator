import Image from 'next/image'
import Link from 'next/link'
import { Mail, Github, Code } from 'lucide-react'

export default function DeveloperShowcase() {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full bg-white p-2 shadow-sm border border-gray-200">
            <Image
              src="/chan_logo.svg"
              alt="Chan Meng Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chan Meng</h3>
            <p className="text-sm text-gray-600">Full-Stack Developer</p>
          </div>
        </div>

        {/* Divider for mobile */}
        <div className="hidden sm:block w-px h-12 bg-gray-300"></div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-gray-700 mb-2">
            Need a custom AI app or website like this? 
            <span className="font-medium text-indigo-600"> Let's build something amazing together!</span>
          </p>
          
          {/* Contact Links */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
            <Link
              href="mailto:chanmeng.dev@gmail.com"
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Mail size={14} />
              <span>chanmeng.dev@gmail.com</span>
            </Link>
            
            <Link
              href="https://github.com/ChanMeng666"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Github size={14} />
              <span>Portfolio</span>
            </Link>
            
            <Link
              href="https://github.com/ChanMeng666/image-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Code size={14} />
              <span>This Project</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
