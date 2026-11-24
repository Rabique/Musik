import Hero, { type HeroProps } from "@/components/hero";

// Musik 앱에 맞춘 Hero 설정
const musikHeroValues: HeroProps = {
  title: "Musik",
  established: "Est. 2025",
  description:
    "AI 기반 차세대 음악 생성 플랫폼. 상상하는 멜로디와 분위기, 가사를 입력하여 스튜디오 품질의 완성도 높은 음악을 즉시 만들어보세요.",
  backgroundImage: "/images/hero-bg.jpg",
  backgroundAlt: "A calm mountain lake at dusk beneath a forested ridge",
  animation: "subtle",
  primaryCTA: {
    ctaEnabled: true,
    text: "음악 생성하기",
    link: "/hello",
    size: "default",
  },
};

// 21st.dev 원본 데모 예시 (필요시 교체 가능)
export const demoHeroValues: HeroProps = {
  title: "Aspen Ridge",
  established: "Est. 2019",
  description:
    "A secluded mountain retreat set among the aspens, with floor-to-ceiling windows framing uninterrupted views of the Rockies. Wake to still water, quiet forest, and nothing on the schedule.",
  backgroundImage:
    "https://cdn.21st.dev/assets/mirror/8d/8d2ed5965f4ca681970c6a9ff04f55433f12d0838a2dcdb02e6f98c13e9917a2.jpg",
  backgroundAlt: "A calm mountain lake at dusk beneath a forested ridge",
  animation: "subtle",
  primaryCTA: {
    ctaEnabled: true,
    text: "Reserve a Stay",
    link: "",
    size: "default",
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden">
      <Hero {...musikHeroValues} />
    </main>
  );
}
