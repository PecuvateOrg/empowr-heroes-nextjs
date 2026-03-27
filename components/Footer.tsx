import { LINKS } from '@/lib/links'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">© {new Date().getFullYear()} Empowr CIC. All rights reserved.</p>
        <div className="footer-links">
          <a href={LINKS.policy.legalDisclaimer} target="_blank" rel="noopener noreferrer">Legal Disclaimer</a>
          <a href={LINKS.policy.termsAndConditions} target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
          <a href={LINKS.policy.privacyPolicy} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href={LINKS.policy.cookiePolicy} target="_blank" rel="noopener noreferrer">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}
