import { useEffect, useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineShoppingCart,
  AiOutlineClose,
} from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";

import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiConnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropdown";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div
      className={`flex flex-col items-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex h-14 w-11/12 max-w-max items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : "text-richblack-25"
                    }`}
                  >
                    <p>{link.title}</p>
                    <BsChevronDown />
                    <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                      <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                      {loading ? (
                        <p className="text-center">Loading...</p>
                      ) : subLinks.length > 0 ? (
                        subLinks.map((subLink, i) => (
                          <Link
                            to={`/catalog/${subLink.name
                              .split(" ")
                              .join("-")
                              .toLowerCase()}`}
                            className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                            key={i}
                          >
                            <p>{subLink.name}</p>
                          </Link>
                        ))
                      ) : (
                        <p className="text-center">No Categories Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons / Cart / Profile */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {token === null ? (
            <>
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-richblack-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <AiOutlineClose size={24} />
          ) : (
            <AiOutlineMenu size={24} />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="w-full px-6 py-4 md:hidden text-richblack-25 space-y-3">
          {NavbarLinks.map((link, index) => (
            <div key={index}>
              {link.title === "Catalog" ? (
                <div className="space-y-2">
                  <p className="font-semibold">{link.title}</p>
                  <div className="ml-2 space-y-1">
                    {loading ? (
                      <p>Loading...</p>
                    ) : subLinks.length > 0 ? (
                      subLinks.map((subLink, i) => (
                        <Link
                          key={i}
                          to={`/catalog/${subLink.name
                            .split(" ")
                            .join("-")
                            .toLowerCase()}`}
                          className="block text-sm text-richblack-100 hover:text-yellow-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subLink.name}
                        </Link>
                      ))
                    ) : (
                      <p>No Categories</p>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to={link.path}
                  className="block text-sm text-richblack-100 hover:text-yellow-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              )}
            </div>
          ))}

          {/* Auth & Cart for Mobile */}
          <div className="pt-4 border-t border-richblack-700">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link
                to="/dashboard/cart"
                className="flex items-center gap-2 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AiOutlineShoppingCart size={20} />
                Cart ({totalItems})
              </Link>
            )}
            {token === null ? (
              <div className="space-y-2 mt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full border border-richblack-700 bg-richblack-800 px-4 py-2 text-richblack-100 rounded">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full border border-richblack-700 bg-richblack-800 px-4 py-2 text-richblack-100 rounded">
                    Sign up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
