import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useOnClickOutside from "use-onclickoutside";

import type { RootState } from "@/store";

import Logo from "../../assets/icons/logo";

type HeaderType = {
  isErrorPage?: boolean;
};

const arrayPaths = ["/"];

const Header = ({ isErrorPage }: HeaderType) => {
  const router = useRouter();
  const { cartItems } = useSelector((state: RootState) => state.cart);

  const [onTop, setOnTop] = useState(
    !(!arrayPaths.includes(router.pathname) || isErrorPage),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navRef = useRef(null);
  const searchRef = useRef(null);

  const headerClass = useCallback(() => {
    setOnTop(window.pageYOffset === 0);
  }, []);

  useEffect(() => {
    if (!arrayPaths.includes(router.pathname) || isErrorPage) {
      return;
    }

    headerClass();
    window.onscroll = () => {
      headerClass();
    };

    return () => {
      window.onscroll = null;
    };
  }, [headerClass, isErrorPage, router.pathname]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSearch = searchTerm.trim();
    void router.push(trimmedSearch ? `/products?search=${encodeURIComponent(trimmedSearch)}` : "/products");
    setSearchOpen(false);
  };

  // on click outside
  useOnClickOutside(navRef, closeMenu);
  useOnClickOutside(searchRef, closeSearch);

  return (
    <header className={`site-header ${!onTop ? "site-header--fixed" : ""}`}>
      <div className="container">
          <Link href="/" aria-label="Modalane home">
          <h1 className="site-logo">
            <Logo />
            ModaLane
          </h1>
        </Link>
        <nav
          ref={navRef}
          className={`site-nav ${menuOpen ? "site-nav--open" : ""}`}
        >
          <Link href="/products">Products</Link>
          <Link href="/products">Inspiration</Link>
          <Link href="/products">Rooms</Link>
          <Link href="/profile" className="site-nav__btn">
            Account
          </Link>
        </nav>

        <div className="site-header__actions">
          <div
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            ref={searchRef}
            className={`search-form-wrapper ${searchOpen ? "search-form--active" : ""}`}
          >
            <form className="search-form" onSubmit={submitSearch}>
              <button
                type="button"
                aria-label="Close search"
                className="icon-cancel"
                onClick={() => setSearchOpen(!searchOpen)}
              />
              <input
                type="text"
                name="search"
                placeholder="Enter the product you are looking for"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </form>
            <span
              role="img"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="icon-search"
            />
          </div>
          <Link href="/cart" className="btn-cart" aria-label="Shopping cart">
              <i className="icon-cart" />
              {cartItems.length > 0 && (
                <span className="btn-cart__count">{cartItems.length}</span>
              )}
          </Link>
          <Link href="/profile" className="site-header__btn-avatar" aria-label="Account">
              <i className="icon-avatar" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="site-header__btn-menu"
          >
            <i className="btn-hamburger">
              <span />
            </i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
