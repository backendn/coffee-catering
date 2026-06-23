import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation by default — if
// you're scrolled down on one page and click a link, the new page loads at
// that same scroll offset instead of the top. Mount this once inside
// <BrowserRouter> to fix that site-wide.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
