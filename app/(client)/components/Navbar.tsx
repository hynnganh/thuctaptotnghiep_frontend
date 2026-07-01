"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown, X, ChevronRight } from "lucide-react";
import LiveSearchBar from "../components/home/LiveSearchBar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      title: "PHIM",
      href: "/movies",
      submenu: [
        { name: "Phim Đang Chiếu", href: "/movies/now" },
        { name: "Phim Sắp Chiếu", href: "/movies/coming" },
      ],
    },
    {
      title: "RẠP A&K",
      submenu: [
        { name: "Tất Cả Các Rạp", href: "/cinema" },
        { name: "Rạp Đặc Biệt (Gold Class)", href: "/cinema/special" },
        { name: "Rạp 3D / Công Nghệ Mới", href: "/cinema/3d" },
      ],
    },
    {
      title: "THÀNH VIÊN",
      submenu: [
        { name: "Tài Khoản Của Tôi", href: "/profile" },
        { name: "Quyền Lợi Thành Viên", href: "/membership" },
      ],
    },
    { title: "SỰ KIỆN", href: "/events" },
    { title: "COMBO Bắp & Nước", href: "/combos" },
    { title: "GIỚI THIỆU", href: "/about" },
  ];

  return (
    <div className="w-full z-[100] relative">
      <header
        className={`w-full transition-all duration-500 ${
          isScrolled
            ? "fixed top-0 left-0 bg-black/90 backdrop-blur-xl py-3 shadow-2xl border-b border-white/10"
            : "relative bg-black py-4 md:py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-8 lg:px-12">
          
          {/* 🎬 LOGO */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 group shrink-0 no-underline"
            >
              <span className="text-3xl md:text-4xl font-[1000] text-red-600 tracking-tighter italic transition-transform group-hover:scale-105">
                A<span className="text-white">&</span>K
              </span>

              <span className="hidden sm:inline-block text-[8px] md:text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase mt-2 ml-1">
                Cinema
              </span>
            </Link>

            {/* 🖥️ MENU DESKTOP */}
            <nav className="hidden lg:flex items-center gap-3 xl:gap-8 ml-6 xl:ml-12 shrink-0">
              {navItems.map((item) => {
                const hasSubmenu =
                  item.submenu && item.submenu.length > 0;

                return (
                  <div key={item.title} className="relative group/menu">
                    
                    {/* ITEM CÓ SUBMENU */}
                    {hasSubmenu ? (
                      <>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="flex items-center gap-1.5 text-[10px] xl:text-[11px] whitespace-nowrap font-black text-white/70 hover:text-white transition-all tracking-[0.2em] uppercase py-2 cursor-pointer no-underline"
                          >
                            {item.title}

                            <ChevronDown
                              size={14}
                              className="group-hover/menu:rotate-180 transition-transform duration-300 text-red-600"
                            />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] xl:text-[11px] whitespace-nowrap font-black text-white/70 hover:text-white transition-all tracking-[0.2em] uppercase py-2 cursor-default select-none">
                            {item.title}

                            <ChevronDown
                              size={14}
                              className="group-hover/menu:rotate-180 transition-transform duration-300 text-red-600"
                            />
                          </div>
                        )}

                        {/* SUBMENU */}
                        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0 z-[110]">
                          <div className="bg-[#0f0f0f] border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-w-[240px]">
                            <div className="flex flex-col gap-4">
                              {item.submenu.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className="text-[10px] font-bold text-gray-400 hover:text-red-500 hover:translate-x-2 transition-all duration-300 uppercase tracking-widest flex items-center gap-3 group/item no-underline"
                                >
                                  <div className="w-1 h-1 bg-red-600 rounded-full scale-0 group-hover/item:scale-100 transition-transform" />

                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ITEM KHÔNG CÓ SUBMENU */
                      <Link
                        href={item.href || "#"}
                        className="flex items-center gap-1.5 text-[10px] xl:text-[11px] whitespace-nowrap font-black text-white/70 hover:text-white transition-all tracking-[0.2em] uppercase py-2 cursor-pointer no-underline"
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* 🔍 SEARCH & MOBILE BUTTON */}
          <div className="flex items-center justify-end flex-1 pl-6 lg:pl-20 gap-3 sm:gap-5">
            <LiveSearchBar />

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 📱 OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 📱 MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85vw] sm:w-[320px] bg-[#0a0a0c] border-l border-white/10 z-[210] lg:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isMobileMenuOpen
            ? "translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <span className="text-2xl font-[1000] text-red-600 tracking-tighter italic">
            A<span className="text-white">&</span>K
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-white/5 hover:bg-red-600 rounded-xl transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {navItems.map((item) => {
            const hasSubmenu =
              item.submenu && item.submenu.length > 0;

            return (
              <div
                key={item.title}
                className="border-b border-white/5 last:border-0"
              >
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() =>
                        setMobileExpandedItem(
                          mobileExpandedItem === item.title
                            ? null
                            : item.title
                        )
                      }
                      className="w-full flex justify-between items-center py-4 text-xs font-black text-zinc-300 tracking-[0.2em] uppercase"
                    >
                      {item.title}

                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          mobileExpandedItem === item.title
                            ? "rotate-180 text-red-500"
                            : "text-zinc-600"
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        mobileExpandedItem === item.title
                          ? "max-h-[250px] pb-4 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex flex-col gap-3 pl-4 border-l border-zinc-800 ml-2">
                        
                        {item.href && (
                          <Link
                            href={item.href}
                            onClick={() =>
                              setIsMobileMenuOpen(false)
                            }
                            className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 no-underline"
                          >
                            <ChevronRight size={12} />

                            Tổng quan {item.title}
                          </Link>
                        )}

                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() =>
                              setIsMobileMenuOpen(false)
                            }
                            className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-2 no-underline"
                          >
                            <ChevronRight
                              size={12}
                              className="text-zinc-700"
                            />

                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex justify-between items-center py-4 text-xs font-black text-zinc-300 hover:text-red-500 tracking-[0.2em] uppercase transition-colors no-underline"
                  >
                    {item.title}

                    <ChevronRight
                      size={14}
                      className="text-zinc-700"
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
