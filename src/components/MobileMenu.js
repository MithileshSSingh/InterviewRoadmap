"use client";
import { useState, useRef, useEffect } from "react";
import ModeToggle from "./ModeToggle";
import ThemeDropdown from "./ThemeDropdown";
import AuthButton from "./AuthButton";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  function handleRowClick(event) {
    // Preserve direct interactions with nested controls.
    if (event.target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }
    const actionButton = event.currentTarget.querySelector("button.mode-toggle");
    actionButton?.click();
  }

  // Close when clicking outside the entire mobile menu container
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop: show all controls inline */}
      <div className="header-controls-desktop">
        <ThemeDropdown />
        <ModeToggle />
        <AuthButton />
      </div>

      {/* Mobile: 3-dot overflow menu */}
      <div className="header-controls-mobile" ref={menuRef}>
        <button
          className="mode-toggle mobile-menu-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="More options"
          title="More options"
          aria-expanded={isOpen}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {isOpen && (
          <div className="mobile-menu-panel">
            <div className="mobile-menu-row" onClick={handleRowClick}>
              <span className="mobile-menu-label">Theme</span>
              <ThemeDropdown />
            </div>
            <div className="mobile-menu-row" onClick={handleRowClick}>
              <span className="mobile-menu-label">Mode</span>
              <ModeToggle />
            </div>
            <div className="mobile-menu-row" onClick={handleRowClick}>
              <span className="mobile-menu-label">Account</span>
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
