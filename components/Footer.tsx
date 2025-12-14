import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Platform: ["How it Works", "Tokenomics", "Staking", "Governance"],
    Community: ["Discord", "Twitter", "Telegram", "Blog"],
    Legal: ["Privacy Policy", "Terms of Service", "Content Guidelines"],
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 text-gray-900">
              <div className="w-8 h-8 bg-[#6E54FF] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Riwi</span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm mb-6">
              AI-powered review system.
              Authentic feedback, instant rewards, and a reputation you own.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#6E54FF]/10 hover:text-[#6E54FF] transition-colors cursor-pointer">
                  •
                </div>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-[#6E54FF] transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Riwi. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;