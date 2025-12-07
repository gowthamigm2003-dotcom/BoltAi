import { CalendarIcon, StarIcon } from "lucide-react";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const evaluationData = [
  {
    title: "Enthusiasm & Interest (0/20)",
    points: [
      'The candidate openly states, "I really don\'t," when asked why they want to work for the company.',
      'Their response to future career plans ("Probably in some other company") indicates a lack of commitment.',
    ],
  },
  {
    title: "Communication Skills (5/20)",
    points: [
      "Responses are brief and unhelpful.",
      'Some answers lack clarity (e.g., "What am I going to do in this role at this role?").',
      "A slight redeeming factor is that they remain polite.",
    ],
  },
  {
    title: "Self-Awareness & Reflection (2/20)",
    points: [
      "The candidate refuses to discuss their background and weaknesses.",
      'They claim to have "no weaknesses at all," which suggests a lack of self-awareness.',
    ],
  },
];

export const Feedback = (): JSX.Element => {
  return (
    <div className="bg-[linear-gradient(180deg,rgba(16,18,22,1)_0%,rgba(15,16,20,1)_100%)] w-full min-w-[1440px] min-h-[1396px] relative">
      <img
        className="absolute top-0 left-[calc(50.00%_-_720px)] w-[1440px] h-[900px]"
        alt="Background"
        src="/bg.svg"
      />

      <header className="flex items-center justify-between px-[100px] pt-[60px] relative">
        <div className="inline-flex items-center gap-[4.3px]">
          <img
            className="w-[38.83px] h-[32.17px]"
            alt="PrepWise Logo"
            src="/objects.png"
          />
          <div className="[font-family:'Mona_Sans',Helvetica] font-semibold text-[#dcdfff] text-[32px] tracking-[0] leading-[normal] whitespace-nowrap">
            PrepWise
          </div>
        </div>

        <Avatar className="w-[50px] h-[50px]">
          <AvatarImage src="/image.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </header>

      <main className="flex flex-col items-center px-4 relative">
        <h1 className="w-[719px] mt-[78px] [font-family:'Mona_Sans',Helvetica] font-semibold text-white text-5xl text-center tracking-[0] leading-[56px]">
          Feedback on the Interview — Frontend Developer Interview
        </h1>

        <div className="flex items-center gap-10 mt-[44px]">
          <div className="inline-flex items-center gap-[11px]">
            <div className="inline-flex items-center gap-1">
              <StarIcon className="w-6 h-6 fill-current text-white" />
              <span className="[font-family:'Mona_Sans',Helvetica] font-normal text-[#d5dfff] text-xl text-center tracking-[0] leading-6 whitespace-nowrap">
                Overall Impression:
              </span>
            </div>
            <div className="[font-family:'Mona_Sans',Helvetica] tracking-[0]">
              <span className="font-bold text-[#c9c5fe] text-xl leading-6">
                12
              </span>
              <span className="text-white text-xl leading-6">/100</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-[7px]">
            <CalendarIcon className="w-6 h-6 text-white" />
            <span className="[font-family:'Mona_Sans',Helvetica] font-normal text-[#d5dfff] text-xl text-center tracking-[0] leading-6 whitespace-nowrap">
              Feb 28, 2025 – 3:45 PM
            </span>
          </div>
        </div>

        <div className="w-[901px] h-px bg-[url('/line-31.svg')] bg-cover mt-[10px]" />

        <article className="flex flex-col w-[757px] items-start gap-8 mt-[30px]">
          <p className="self-stretch [font-family:'Mona_Sans',Helvetica] font-normal text-[#d2def1] text-lg leading-7 tracking-[0]">
            This interview does not reflect serious interest or engagement from
            the candidate. Their responses are dismissive, vague, or outright
            negative, making it difficult to assess their qualifications,
            motivation, or suitability for the role.
          </p>

          <section className="flex flex-col items-start gap-5 w-full">
            <h2 className="self-stretch [font-family:'Mona_Sans',Helvetica] font-semibold text-white text-[32px] leading-10 tracking-[0]">
              Breakdown of Evaluation:
            </h2>

            <div className="flex flex-col items-start gap-4">
              {evaluationData.map((section, index) => (
                <React.Fragment key={index}>
                  <h3 className="self-stretch [font-family:'Mona_Sans',Helvetica] font-bold text-[#d2def1] text-lg tracking-[0] leading-7">
                    {section.title}
                  </h3>
                  {section.points.map((point, pointIndex) => (
                    <p
                      key={pointIndex}
                      className="self-stretch [font-family:'Mona_Sans',Helvetica] font-normal text-[#d2def1] text-lg tracking-[0] leading-7"
                    >
                      {point}
                    </p>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-start gap-5 w-full">
            <div className="inline-flex items-center gap-2.5">
              <h2 className="[font-family:'Mona_Sans',Helvetica] font-semibold text-white text-2xl leading-10 whitespace-nowrap tracking-[0]">
                Final Verdict:
              </h2>
              <Badge className="px-[18px] py-0 bg-[#27282f] rounded-[40px] border border-solid shadow-shadow-xs h-10 hover:bg-[#27282f]">
                <span className="[font-family:'Mona_Sans',Helvetica] font-semibold text-[#ff8989] text-2xl tracking-[0] leading-10 whitespace-nowrap">
                  Not Recommended
                </span>
              </Badge>
            </div>

            <p className="self-stretch [font-family:'Mona_Sans',Helvetica] font-normal text-[#d2def1] text-lg leading-7 tracking-[0]">
              This candidate does not appear to be seriously considering the
              role and fails to provide meaningful responses. If this is
              reflective of their true attitude, they would not be a good fit
              for most positions.
            </p>
          </section>

          <div className="flex items-start gap-5 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-1.5 px-8 py-[13px] bg-[#27282f] rounded-[56px] border-0 hover:bg-[#27282f]/90 h-auto"
            >
              <span className="[font-family:'Mona_Sans',Helvetica] font-bold text-[#c9c5fe] text-base tracking-[0] leading-6 whitespace-nowrap">
                Back to dashbaord
              </span>
            </Button>

            <Button className="flex-1 gap-1.5 px-8 py-[13px] bg-[#c9c5fe] rounded-[56px] hover:bg-[#c9c5fe]/90 h-auto">
              <span className="[font-family:'Mona_Sans',Helvetica] font-bold text-[#020408] text-base tracking-[0] leading-6 whitespace-nowrap">
                Retake interview
              </span>
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
};
