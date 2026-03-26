import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">© {new Date().getFullYear()} Empowr CIC. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://legalhub.pecuvate.com/share/empowr/donor-information-and-legal-disclaimer" target="_blank" rel="noopener noreferrer">Legal Disclaimer</a>
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}
