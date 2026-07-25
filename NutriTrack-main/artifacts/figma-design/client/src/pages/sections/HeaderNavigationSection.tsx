import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const navigationItems = [
  { label: "Home", anchor: "home" },
  { label: "Features", anchor: "features" },
  { label: "About Us", anchor: "about" },
  { label: "Contact", anchor: "contact" },
];

const scrollToSection = (anchor: string) => {
  const el = document.getElementById(anchor);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const HeaderNavigationSection = (): JSX.Element => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex min-h-20 w-full max-w-[1290px] items-center gap-6 px-6 lg:px-0">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="[font-family:'Poppins',Helvetica] text-[28px] font-bold leading-none tracking-[0] cursor-pointer bg-transparent border-0 p-0"
        >
          <span className="text-green-500">Nutri</span>
          <span className="text-[#ff6b81]">Track</span>
        </button>
        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden items-center gap-[68px] lg:flex"
        >
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              onClick={() => scrollToSection(item.anchor)}
              className="h-auto p-0 [font-family:'Readex_Pro',Helvetica] text-xl font-bold leading-normal tracking-[0] text-black hover:bg-transparent hover:text-green-500 transition-colors"
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-[38px] lg:ml-0">
          <Link href="/login">
            <Button
              type="button"
              className="h-12 w-[140px] justify-between rounded-xl bg-green-500 px-3 [font-family:'Inter',Helvetica] text-base font-bold leading-normal tracking-[0] text-neutral-200 hover:bg-green-600"
            >
              <span>Login</span>
              <img
                className="h-3 w-3"
                alt=""
                aria-hidden="true"
                src="/figmaAssets/arrow-2.svg"
              />
            </Button>
          </Link>
          <Link href="/create-account">
            <Button
              type="button"
              className="h-12 w-[140px] justify-between rounded-xl bg-green-500 px-3 [font-family:'Inter',Helvetica] text-base font-bold leading-normal tracking-[0] text-neutral-200 hover:bg-green-600"
            >
              <span>Get started</span>
              <img
                className="h-3 w-3"
                alt=""
                aria-hidden="true"
                src="/figmaAssets/arrow-2.svg"
              />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
