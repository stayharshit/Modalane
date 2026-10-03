import Link from "next/link";

import Logo from "../../assets/icons/logo";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__description">
            <h6>
              <Logo /> <span>Modalane</span>
            </h6>
            <p>
              Modalane designs clothing for the young, the old & everyone
              in between – but most importantly, for the fashionable
            </p>
            <ul className="site-footer__social-networks">
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <i className="icon-facebook" />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                  <i className="icon-twitter" />
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <i className="icon-linkedin" />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <i className="icon-instagram" />
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <i className="icon-youtube-play" />
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__links">
            <ul>
              <li>Shopping online</li>
              <li>
                <Link href="/cart">Order Status</Link>
              </li>
              <li>
                <Link href="/products">Shipping and Delivery</Link>
              </li>
              <li>
                <Link href="/products">Returns</Link>
              </li>
              <li>
                <Link href="/cart/checkout">Payment options</Link>
              </li>
              <li>
                <a href="mailto:modalanestore@gmail.com">Contact Us</a>
              </li>
            </ul>
            <ul>
              <li>Information</li>
              <li>
                <Link href="/products">Gift Cards</Link>
              </li>
              <li>
                <Link href="/products">Find a store</Link>
              </li>
              <li>
                <Link href="/#newsletter">Newsletter</Link>
              </li>
              <li>
                <Link href="/register">Become a member</Link>
              </li>
              <li>
                <a href="mailto:modalanestore@gmail.com?subject=Site%20feedback">Site feedback</a>
              </li>
            </ul>
            <ul>
              <li>Contact</li>
              <li>
                <a href="mailto:modalanestore@gmail.com">modalanestore@gmail.com</a>
              </li>
              <li>
                <a href="tel:+919001920999001">Hotline: +91 9001920999001</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container">
          <p>DEVELOPED BY STAYHARSHIT - © 2024. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
