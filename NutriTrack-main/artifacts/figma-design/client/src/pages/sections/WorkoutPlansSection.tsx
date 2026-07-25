import { Card, CardContent } from "@/components/ui/card";

const workoutFeatures = [
  {
    title: "Peer-Reviewed Formulas",
    description:
      "Science-backed formulas ensure every recommendation starts with reliable data.",
    icon: "/figmaAssets/ellipse-16.png",
    backgroundClass: "bg-[#fff1f4]",
  },
  {
    title: "Culture-Aware Meals",
    description:
      "Meal plans adapt to your food preferences, traditions, and eating habits.",
    icon: "/figmaAssets/ellipse-17.png",
    backgroundClass: "bg-[#effcf8]",
  },
  {
    title: "Health-Condition Ready",
    description:
      "Personalized guidance for PCOS, diabetes, thyroid concerns, and more.",
    icon: "/figmaAssets/ellipse-19.png",
    backgroundClass: "bg-transparent",
    decorativeBackground: "/figmaAssets/rectangle-41.svg",
  },
  {
    title: "Workout Integration",
    description:
      "Exercise plans tailored to complement your calorie targets and progress.",
    icon: "/figmaAssets/ellipse-20.png",
    backgroundClass: "bg-orange-50",
  },
];

export const WorkoutPlansSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="workout-plans-heading"
      className="relative w-full overflow-hidden rounded-3xl border border-solid bg-[#fffdf8] px-4 py-12 shadow-[0px_4px_20px_#00000040] sm:px-8 sm:py-14 lg:px-16 lg:py-[55px]"
    >
      <header className="mx-auto max-w-[999px] text-center">
        <h2
          id="workout-plans-heading"
          className="[font-family:'Playfair_Display',Helvetica] text-[38px] font-bold leading-tight tracking-[0] text-[#163020] sm:text-[46px] lg:text-[54px] lg:leading-[normal]"
        >
          Workout Plans That Work With You
        </h2>
        <p className="mt-4 [font-family:'Poppins',Helvetica] text-lg font-bold leading-normal tracking-[0] text-slate-500 sm:text-xl lg:mt-5 lg:text-2xl">
          Personalized workouts based on your fitness level, goals, and daily
          routine.
        </p>
      </header>
      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-[61px]">
        <div className="flex min-w-0 items-center">
          <div className="w-full rounded-[40px] bg-[#d9d9d9] p-4 shadow-[0px_20px_60px_#00000040]">
            <img
              className="h-auto w-full rounded-[40px] object-cover"
              alt="Chatgpt image jul"
              src="/figmaAssets/chatgpt-image-jul-16--2026--09-33-22-pm-1.png"
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="[font-family:'Poppins',Helvetica] text-base font-normal leading-6 tracking-[0] text-slate-500">
            NutriTrack uses trusted health formulas such as the Mifflin–St Jeor
            equation for calorie estimation and the Deurenberg formula for body
            fat analysis. Combined with your personal goals, these
            scientifically validated methods help deliver accurate, personalized
            recommendations for a healthier lifestyle.
          </p>
          <div className="mt-6 grid gap-5">
            {workoutFeatures.map((feature) => {
              const cardContent = (
                <CardContent className="grid min-h-[109px] grid-cols-[72px_minmax(0,1fr)] items-center gap-4 p-4 sm:gap-7 sm:px-[22px]">
                  <img
                    className="h-[72px] w-[72px] shrink-0 object-cover"
                    alt="Ellipse"
                    src={feature.icon}
                  />
                  <div className="min-w-0">
                    <h3 className="[font-family:'Poppins',Helvetica] text-xl font-semibold leading-6 tracking-[0] text-black sm:text-2xl">
                      {feature.title}
                    </h3>
                    <p className="mt-2 [font-family:'Poppins',Helvetica] text-[15px] font-normal leading-6 tracking-[0] text-gray-500 sm:text-[17px] sm:leading-7">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              );

              if (feature.decorativeBackground) {
                return (
                  <Card
                    key={feature.title}
                    className="grid overflow-hidden rounded-none border-0 bg-transparent shadow-none"
                  >
                    <img
                      className="col-start-1 row-start-1 h-full min-h-[109px] w-full object-fill"
                      alt="Rectangle"
                      src={feature.decorativeBackground}
                    />
                    <div className="z-10 col-start-1 row-start-1">
                      {cardContent}
                    </div>
                  </Card>
                );
              }

              return (
                <Card
                  key={feature.title}
                  className={`rounded-none border-0 ${feature.backgroundClass} shadow-none`}
                >
                  {cardContent}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
