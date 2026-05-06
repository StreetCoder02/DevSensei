import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProgressModal } from "@/components/ProgressModal";
import { DevSenseiLogo } from "@/components/DevSenseiLogo";
import {
  Code2,
  Brain,
  Trophy,
  ArrowRight,
  Github,
  Bug,
  MessageSquare,
  Flame,
} from "lucide-react";

const TYPEWRITER_PHRASES = [
  "coding skills.",
  "problem solving.",
  "interview prep.",
  "CS fundamentals.",
  "debugging speed."
];

const ACTIVITIES = [
  "🔥 Ravi just solved Binary Search in Python",
  "⚡ Priya scored 5/5 on the OS quiz",  
  "💻 Arjun submitted a solution for Fibonacci",
  "🧠 Sneha solved all 5 riddles",
  "🎯 Rohan got roasted for O(n³) nested loops",
  "✅ Divya passed the sorting challenge",
  "🏆 Karan completed a Mock Interview",
];
const TICKER_ITEMS = [...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES];

export default function Index() {
  useEffect(() => {
    document.title = "DevSensei — AI Learning Platform";
  }, []);

  const platforms = [
    {
      icon: Brain,
      title: "Riddles",
      description:
        "Challenge your mind with mind-bending riddles. Solve puzzles, unlock achievements, and climb the riddle leaderboard.",
      link: "/riddles",
    },
    {
      icon: Code2,
      title: "Coding Challenges",
      description:
        "Test your coding skills with real-world programming problems. Compete in live coding contests and improve your portfolio.",
      link: "/coding",
    },
    {
      icon: Trophy,
      title: "Quizzes",
      description:
        "Test your knowledge across various domains. From tech to general knowledge, challenge yourself with our quiz platform.",
      link: "/quizzes",
    },
    {
      icon: Bug,
      title: "Error Explainer",
      description: "Paste any error message from Python, JS, Java, or C++ and get a plain-English explanation and fix powered by Gemini.",
      link: "/error-explainer",
    },
    {
      icon: MessageSquare,
      title: "Mock Interviewer",
      description: "Practice real technical interviews. AI plays the interviewer — asks follow-up questions, pushes back on weak answers, and scores your performance.",
      link: "/mock-interview",
    },
    {
      icon: Flame,
      title: "Code Roaster",
      description: "Submit any code and get a brutally honest AI review. Savage roasts, real fixes, actual learning. Toggle between Roast Mode and Mentor Mode.",
      link: "/roast",
    }
  ];

  const stats = [
    { number: "6", label: "AI-Powered Features" },
    { number: "Gemini", label: "2.5 Flash Backend" },
    { number: "∞", label: "Unique Challenges" },
    { number: "0", label: "Account Required" },
  ];

  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(40);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % TYPEWRITER_PHRASES.length;
      const fullText = TYPEWRITER_PHRASES[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 20 : 40);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-red-500/30">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-scroll-left {
          animation: scroll-left 25s linear infinite;
        }
      `}</style>
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/80 backdrop-blur border-b border-[#1a1a1a]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DevSenseiLogo size={28} />
            <span className="text-xl font-semibold text-white">
              <span>Dev<span className="text-red-500">Sensei</span></span>
            </span>
          </div>

          <nav className="hidden md:flex gap-8">
            <a href="#platforms" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How It Works
            </a>
            <button onClick={() => setIsStatsOpen(true)} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> My Progress
            </button>
          </nav>

          <div className="flex gap-3">
            <Link 
              to="/coding"
              className="border border-zinc-700 text-zinc-200 hover:border-zinc-500 bg-transparent text-sm px-4 py-1.5 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32 md:py-48 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 min-h-[8rem] md:min-h-[10rem] flex flex-col items-center justify-center">
            <span>Level up your</span>
            <span className="text-red-500 flex items-center justify-center text-center">
              {text}
              <span className="w-1 md:w-1.5 h-10 md:h-16 bg-red-500 ml-1 animate-pulse shrink-0" />
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of developers, problem-solvers, and innovators competing daily.
            From AI/ML to algorithms, choose your challenge and rise to the top.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/coding" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-md font-medium flex items-center justify-center transition-colors">
                Start Competing <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Activity Ticker */}
      <div className="bg-[#111] border-y border-[#1f1f1f] py-2 overflow-hidden flex whitespace-nowrap">
        <div className="flex animate-scroll-left w-max">
          {TICKER_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center mx-4">
              <span className="text-zinc-400 text-xs">{item}</span>
              <span className="text-red-600 text-xs ml-8">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section id="stats" className="scroll-mt-16 bg-[#0f0f0f] border-y border-[#1a1a1a] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {stat.number}
                </div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Grid */}
      <section id="platforms" className="scroll-mt-16 container mx-auto px-6 py-32">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore All Platforms
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl">
            From brain-teasing riddles to cutting-edge AI evaluations, choose your challenge
            and start your journey to mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {platforms.map((platform, idx) => {
            const IconComponent = platform.icon;
            return (
              <Link key={idx} to={platform.link}>
                <div className="h-full bg-[#111111] border border-[#1f1f1f] hover:border-red-900/50 rounded-xl p-8 transition-colors group cursor-pointer flex flex-col">
                  
                  <div className="w-12 h-12 rounded-md bg-[#1a1a1a] flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-red-500" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {platform.title}
                  </h3>

                  <p className="text-sm text-zinc-500 mb-8 leading-relaxed flex-grow">
                    {platform.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                    Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0f0f0f] border-y border-[#1a1a1a] py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
            Join thousands of developers competing daily. Start
            mastering new skills across our AI-powered platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/coding">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-md font-medium flex items-center justify-center transition-colors">
                Start Competing <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <DevSenseiLogo size={24} />
              <span className="text-lg font-semibold text-white">
                <span>Dev<span className="text-red-500">Sensei</span></span>
              </span>
            </div>
            
            <p className="text-sm text-zinc-600">
              © 2025 DevSensei. Built by Aniruddha.
            </p>

            <div className="flex gap-6">
              <a
                href="https://github.com/StreetCoder02"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DevSensei GitHub profile"
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="text-xs uppercase tracking-[0.25em]">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <ProgressModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
}
