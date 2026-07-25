import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    title: "Easy to Use",
    description:
      "A clean, simple experience\ndesigned for your everyday\nhealth journey.",
    icon: "/figmaAssets/ellipse-21.png",
    backgroundClass: "bg-[#ffe7e2]",
  },
  {
    title: "100% Personal",
    description:
      "Plans made just for you\nbased on your body, goals\nand lifestyle.",
    icon: "/figmaAssets/ellipse-23.png",
    backgroundClass: "bg-[#e4f5f1]",
    iconBackdrop: true,
  },
  {
    title: "Scientifically Backed",
    description:
      "Every recommendation is\nrooted in science and trusted\nby experts.",
    icon: "/figmaAssets/ellipse-24.png",
    backgroundClass: "bg-[#f0e8fa]",
  },
  {
    title: "Badges & Streaks",
    description:
      "Stay motivated with streaks,\nachievements and daily\nprogress tracking.",
    icon: "/figmaAssets/ellipse-25.png",
    backgroundClass: "bg-[#ffe9e5]",
  },
];

export const BenefitsHighlightsSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="w-full overflow-hidden rounded-3xl border border-[#f9f5f9] bg-[#f9f5f8] px-6 py-14 shadow-[0px_4px_20px_#00000040] sm:px-10 lg:min-h-[492px] lg:px-16"
    >
      <h2
        id="benefits-heading"
        className="[font-family:'Playfair_Display',Helvetica] text-center text-[36px] font-semibold leading-tight tracking-[0] text-[#123524] sm:text-[42px]"
      >
        Why NutriTrack?
      </h2>
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-11">
        {benefits.map((benefit) => (
          <Card
            key={benefit.title}
            className={`min-h-[300px] rounded-3xl border-0 shadow-none ${benefit.backgroundClass}`}
          >
            <CardContent className="flex h-full min-h-[300px] flex-col items-start p-5 pt-7 lg:px-5 lg:pt-7">
              <div className="relative flex h-[70px] w-[70px] items-center justify-center">
                {benefit.iconBackdrop && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <img
                  className="relative h-[70px] w-[70px] object-cover"
                  alt={`${benefit.title} icon`}
                  src={benefit.icon}
                />
              </div>
              <h3 className="mt-3 [font-family:'Playfair_Display',Helvetica] text-[28px] font-semibold leading-7 tracking-[0] text-black lg:text-[32px]">
                {benefit.title}
              </h3>
              <p className="mt-7 whitespace-pre-line [font-family:'Playfair_Display',Helvetica] text-base font-semibold leading-6 tracking-[0] text-gray-800">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
