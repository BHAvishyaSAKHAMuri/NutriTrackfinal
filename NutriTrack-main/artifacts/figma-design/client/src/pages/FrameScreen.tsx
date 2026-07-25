import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BenefitsHighlightsSection } from "./sections/BenefitsHighlightsSection";
import { HeaderNavigationSection } from "./sections/HeaderNavigationSection";
import { HeroHeadlineSection } from "./sections/HeroHeadlineSection";
import { WorkoutPlansSection } from "./sections/WorkoutPlansSection";

const benefitCards = [
  {
    title: "Personalized diet",
    description: "Meal plans tailored to your body and goals.",
    icon: "/figmaAssets/ellipse-5.png",
    background: "bg-[#ffe8ee]",
  },
  {
    title: "Workout Plans",
    description:
      "Get personalized exercises that complement your diet and health goals.",
    icon: "/figmaAssets/ellipse-4.png",
    background: "bg-[#fff2e5]",
  },
  {
    title: "Smart Health Analysis",
    description:
      "Track your BMI, calorie intake, nutrition balance, and overall progress..",
    icon: "/figmaAssets/ellipse-6.png",
    background: "bg-[#e6fffb]/30",
  },
  {
    title: "AI Coach",
    description:
      "Receive personalized guidance, smarter food choices, and daily health insights.",
    icon: "/figmaAssets/ellipse-7.png",
    background: "bg-[#f5ecff]",
  },
];

export const FrameScreen = (): JSX.Element => {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-white [font-family:'Inter',Helvetica]">
      <HeaderNavigationSection />
      <section
        id="home"
        aria-label="NutriTrack introduction"
        className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-[46px] pb-10 pt-9 lg:grid-cols-[733px_minmax(0,1fr)] lg:gap-9 lg:px-[71px]"
      >
        <div className="flex flex-col items-start">
          <HeroHeadlineSection />
          <p className="mt-5 max-w-[733px] text-2xl font-bold leading-[normal] tracking-[0] text-black">
            NutriTrack builds your personalized diet plan, calculates your true
            daily calorie needs, and pairs you with an AI coach that actually
            knows you. No generic advice. No fluff. Just a plan that fits your
            life.
          </p>
          <div className="mt-6 flex flex-wrap gap-[54px]">
            <Button
              type="button"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="h-auto w-[194px] justify-between rounded-xl bg-green-500 px-3 py-[13px] [font-family:'Inter',Helvetica] text-base font-bold text-neutral-200 hover:bg-green-600"
            >
              Start Your Journey
              <img
                className="w-[15px]"
                alt=""
                aria-hidden="true"
                src="/figmaAssets/arrow-2-1.svg"
              />
            </Button>
            <Button
              type="button"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="h-auto w-[194px] justify-between rounded-xl bg-green-500 px-3 py-[13px] [font-family:'Inter',Helvetica] text-base font-bold text-neutral-200 hover:bg-green-600"
            >
              I Have An Account
              <img
                className="w-[15px]"
                alt=""
                aria-hidden="true"
                src="/figmaAssets/arrow-2-1.svg"
              />
            </Button>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-[600px] items-center justify-center lg:mx-0">
          <div
            aria-hidden="true"
            className="absolute h-full w-full rounded-full bg-[#d9f99d77] opacity-30"
          />
          <img
            className="relative m-[52px] aspect-square w-[calc(100%-104px)] max-w-[501px] rounded-full object-cover"
            alt="Chatgpt image jul"
            src="/figmaAssets/chatgpt-image-jul-16--2026--07-51-50-pm-1.png"
          />
        </div>
      </section>
      <section
        id="features"
        aria-label="NutriTrack features"
        className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-[46px] pb-20 pt-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {benefitCards.map((card) => (
          <Card
            key={card.title}
            className={`min-h-[220px] rounded-3xl border-0 ${card.background} shadow-[0px_10px_30px_#00000040]`}
          >
            <CardContent className="flex h-full flex-col items-start p-[14px] pt-3">
              <img
                className="mb-3 h-16 w-16 object-cover"
                alt=""
                aria-hidden="true"
                src={card.icon}
              />
              <h2 className="text-xl font-semibold leading-[normal] tracking-[0] text-black">
                {card.title}
              </h2>
              <p className="mt-1 max-w-[274px] text-xl font-normal leading-[normal] tracking-[0] text-slate-500">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
      <div id="about"><WorkoutPlansSection /></div>
      <div id="contact"><BenefitsHighlightsSection /></div>
    </main>
  );
};
