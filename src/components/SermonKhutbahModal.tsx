import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Award, X, CheckCircle, Volume2, Flame, Users, BookOpen } from 'lucide-react';

interface SermonTheme {
  id: string;
  title: string;
  scripture: string;
  stages: {
    prompt: string;
    choices: {
      text: string;
      reaction: string;
      score: number;
    }[];
  }[];
}

const CHAPEL_THEMES: SermonTheme[] = [
  {
    id: 'academic_diligence',
    title: 'Academic Excellence & Diligence',
    scripture: 'Colossians 3:23 — "Whatever you do, work heartily, as for the Lord and not for men."',
    stages: [
      {
        prompt: 'How do you open your address to the student congregation?',
        choices: [
          {
            text: '"Praise the Lord, Liids University! God has not called us to be the tail in our departments, but the head! Let us lift our hands!"',
            reaction: '🙌 "Hallelujah! Preach on, Pastor!"',
            score: 35,
          },
          {
            text: '"Good morning brothers and sisters. Take a look at your seat neighbor and tell them: you will graduate with distinction!"',
            reaction: '✨ "Amen! I receive it!"',
            score: 30,
          },
          {
            text: '"Let us quiet our hearts and reflect on why we are enrolled in this great university."',
            reaction: '🙏 "Amen, Lord teach us."',
            score: 25,
          },
        ],
      },
      {
        prompt: 'What practical campus application do you urge them towards?',
        choices: [
          {
            text: '"Do not sleep through your 8 AM lectures and expect a miracle on exam day! Faith without revision notes is dead!"',
            reaction: '🔥 "E choke! Truth has landed! Hahaha!"',
            score: 35,
          },
          {
            text: '"Form study groups in your halls! When one brother is weak in Calculus, let another carry him forward in love."',
            reaction: '💡 "Real talk! Note taken!"',
            score: 30,
          },
          {
            text: '"Remember to manage your night cramming sessions and guard your health with adequate rest."',
            reaction: '👏 "Wise counsel, Pastor."',
            score: 25,
          },
        ],
      },
      {
        prompt: 'Lead the closing charge and benediction:',
        choices: [
          {
            text: '"May the grace of God multiply your memory, bless your continuous assessments, and catapult your CGPA to First Class in Jesus\' name!"',
            reaction: '🎉 "AMEN!! Loudest Amen in the chapel!"',
            score: 35,
          },
          {
            text: '"Go into the week as light and salt. Be exemplary students in every lecture hall and lab across campus!"',
            reaction: '🕊️ "Amen, thank you Pastor!"',
            score: 30,
          },
        ],
      },
    ],
  },
  {
    id: 'brotherhood_hostels',
    title: 'Peace & Love in the Student Hostels',
    scripture: 'Psalm 133:1 — "Behold, how good and how pleasant it is for brethren to dwell together in unity!"',
    stages: [
      {
        prompt: 'Open your message on living together in unity:',
        choices: [
          {
            text: '"Church, the true test of your Christianity is not how loud you sing on Sunday, but how you treat your bunkmate on Monday morning!"',
            reaction: '😂 "Ouch! Preach the truth Pastor!"',
            score: 35,
          },
          {
            text: '"Peace be with you all. Today we address common friction in the hostel rooms."',
            reaction: '👂 "The whole hall is listening attentively."',
            score: 25,
          },
        ],
      },
      {
        prompt: 'What everyday hostel dilemma do you address?',
        choices: [
          {
            text: '"If you borrow your roommate\'s electric kettle or water bucket, return it clean and with gratitude! Let love show in action!"',
            reaction: '🙌 "Preach it louder! Someone needed to hear that!"',
            score: 35,
          },
          {
            text: '"Learn to forgive offenses quickly before turning small misunderstandings into floor arguments."',
            reaction: '🤝 "Amen, forgiveness is key."',
            score: 30,
          },
        ],
      },
      {
        prompt: 'Deliver the final blessing for hostel peace:',
        choices: [
          {
            text: '"I declare peace in every room, mutual respect across all blocks, and unending harmony in our campus community! Go in peace!"',
            reaction: '🎉 "AMEN! God bless the Pastor!"',
            score: 35,
          },
        ],
      },
    ],
  },
];

const MOSQUE_THEMES: SermonTheme[] = [
  {
    id: 'seeking_knowledge',
    title: 'The Sacred Duty of Seeking Beneficial Knowledge (Ilm)',
    scripture: 'Hadith Sahih Muslim — "Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise."',
    stages: [
      {
        prompt: 'Deliver the Khutbah opening praise (Khutbatul-Haajah):',
        choices: [
          {
            text: '"Alhamdulillahilladhi hadana lihadha... Innal-hamda lillah, nahmaduhu wa nasta\'eenahu. Respected brothers and sisters of Liids University Jama\'ah, fear Allah with true piety!"',
            reaction: '✨ "Allahu Akbar! Masha\'Allah!"',
            score: 35,
          },
          {
            text: '"As-salamu alaykum wa Rahmatullah. All gratitude belongs to Allah Who granted us intellect and guidance in our studies."',
            reaction: '🌙 "Wa alaykum as-salam wa Rahmatullah."',
            score: 30,
          },
        ],
      },
      {
        prompt: 'Expound upon diligence and uprightness in exams:',
        choices: [
          {
            text: '"A Muslim student does not cut corners or cheat in examinations! Your matriculation degree carries barakah only when earned with pure honesty and steadfast effort!"',
            reaction: '📢 "Na\'am! Subhan\'Allah, direct and necessary advice!"',
            score: 35,
          },
          {
            text: '"Seek knowledge with humility. Respect your professors, study diligently before Solat, and never boast over your peers."',
            reaction: '🤲 "Barakallahu feek ya Alfa!"',
            score: 30,
          },
        ],
      },
      {
        prompt: 'Conclude with the comprehensive Du\'a for the university:',
        choices: [
          {
            text: '"Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar. O Allah, grant every student present high understanding, excellent results, and righteous character!"',
            reaction: '🤲 "Ameen ya Rabb al-\'Alameen!"',
            score: 35,
          },
        ],
      },
    ],
  },
  {
    id: 'sabr_and_perseverance',
    title: 'Patience (Sabr) during Tough University Semesters',
    scripture: 'Surah Al-Baqarah 2:153 — "O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient."',
    stages: [
      {
        prompt: 'Introduce the theme of Sabr to exhausted students:',
        choices: [
          {
            text: '"My beloved young believers, university life is not without trials — tough tests, short sleep, financial constraints. But remember: after hardship comes ease!"',
            reaction: '❤️ "Fa inna ma\'al \'usri yusra! True words!"',
            score: 35,
          },
          {
            text: '"Today we remind our souls of patience in our academic journey."',
            reaction: '🤲 "Alhamdulillah."',
            score: 25,
          },
        ],
      },
      {
        prompt: 'What spiritual strategy do you recommend for semester stress?',
        choices: [
          {
            text: '"When tests pile up and stress overwhelms your hostel room, make your wudu properly, place your forehead on the ground in Sujud, and pour your heart out to Allah!"',
            reaction: '🕊️ "Allahu Akbar! Tears in the eyes of students!"',
            score: 35,
          },
          {
            text: '"Organize your study hours early, lean on your friends in the Jama\'ah, and keep your tongue moist with Dhikr."',
            reaction: '✨ "Masha\'Allah, very practical advice."',
            score: 30,
          },
        ],
      },
      {
        prompt: 'Conclude with the final communal Du\'a:',
        choices: [
          {
            text: '"O Allah, relieve the burden of every struggling student, bless their parents who sponsor their fees, and grant them ease in their upcoming semester exams!"',
            reaction: '🤲 "Ameen, Ameen thumma Ameen!"',
            score: 35,
          },
        ],
      },
    ],
  },
];

export const SermonKhutbahModal: React.FC = () => {
  const { isSermonModalOpen, setIsSermonModalOpen, currentLocation, completeSermon, stats } = useGame();

  const isChapel = currentLocation === 'chapel';
  const track = isChapel ? 'chapel' : 'mosque';
  const themes = isChapel ? CHAPEL_THEMES : MOSQUE_THEMES;

  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0);
  const [recentReaction, setRecentReaction] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isSermonModalOpen) return null;

  const activeTheme = themes[selectedThemeIndex] || themes[0];
  const activeStage = activeTheme.stages[currentStageIndex];

  const handleSelectChoice = (choice: { text: string; reaction: string; score: number }) => {
    const nextScore = accumulatedScore + choice.score;
    setAccumulatedScore(nextScore);
    setRecentReaction(choice.reaction);

    if (currentStageIndex + 1 < activeTheme.stages.length) {
      setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
        setRecentReaction(null);
      }, 1600);
    } else {
      setTimeout(() => {
        setIsCompleted(true);
      }, 1800);
    }
  };

  const handleFinish = () => {
    // Quality multiplier based on score
    const multiplier = accumulatedScore >= 100 ? 1.5 : accumulatedScore >= 80 ? 1.2 : 1.0;
    completeSermon(track, multiplier, activeTheme.title);
    setIsSermonModalOpen(false);
    // Reset state
    setCurrentStageIndex(0);
    setAccumulatedScore(0);
    setRecentReaction(null);
    setIsCompleted(false);
  };

  const roleTitle = isChapel ? 'Campus Pastor' : 'Campus Alfa';
  const eventName = isChapel ? 'Sunday Chapel Service' : "Friday Juma'at Khutbah";
  const honorariumEstimate = Math.round(5000 * (accumulatedScore >= 100 ? 1.5 : accumulatedScore >= 80 ? 1.2 : 1.0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isChapel
              ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              {isChapel ? <BookOpen className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{eventName}</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-white/25 rounded-full uppercase tracking-wider">
                  {roleTitle} Role
                </span>
              </div>
              <p className="text-xs text-white/90">
                Preaching to {isChapel ? 'the Chapel Fellowship' : "the LU Central Jama'ah"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSermonModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isCompleted ? (
            <>
              {/* Theme Selector (Only on stage 0) */}
              {currentStageIndex === 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Address Theme & Scriptural Foundation:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {themes.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedThemeIndex(idx)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          selectedThemeIndex === idx
                            ? isChapel
                              ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                              : 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <p className="font-semibold text-sm text-slate-800">{t.title}</p>
                        <p className="text-xs text-slate-600 italic mt-1 line-clamp-2">{t.scripture}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress & Audience Meter */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    Delivery Phase {currentStageIndex + 1} of {activeTheme.stages.length}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Flame className="w-4 h-4" />
                    Congregation Approval: {accumulatedScore} Pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isChapel ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${((currentStageIndex + 1) / activeTheme.stages.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Scripture Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isChapel
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="font-bold block mb-0.5">Scriptural Anchor:</span>
                {activeTheme.scripture}
              </div>

              {/* Current Question / Prompt */}
              {activeStage && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className={`w-5 h-5 ${isChapel ? 'text-amber-600' : 'text-emerald-600'}`} />
                    <h3 className="font-bold text-slate-800 text-base">{activeStage.prompt}</h3>
                  </div>

                  <div className="space-y-2.5">
                    {activeStage.choices.map((choice, cIdx) => (
                      <button
                        key={cIdx}
                        disabled={!!recentReaction}
                        onClick={() => handleSelectChoice(choice)}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed ${
                          recentReaction
                            ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
                            : isChapel
                            ? 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-800 hover:shadow-sm'
                            : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {cIdx + 1}
                          </span>
                          <span className="flex-1 font-medium">{choice.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Congregation Reaction Callout */}
              {recentReaction && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl text-center animate-bounce">
                  <p className="text-sm font-bold text-amber-900">{recentReaction}</p>
                </div>
              )}
            </>
          ) : (
            /* Completed Screen */
            <div className="text-center py-6 space-y-5">
              <div
                className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  isChapel ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {isChapel ? 'Powerful Sunday Service Concluded!' : "Inspiring Friday Khutbah Delivered!"}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  The student congregation is deeply uplifted and motivated for academic excellence.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs text-emerald-700 font-semibold">Offerings / Sadaqah</p>
                  <p className="text-lg font-black text-emerald-800">+₦{honorariumEstimate.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-semibold">Spiritual Piety</p>
                  <p className="text-lg font-black text-amber-800">
                    +{Math.round(75 * (accumulatedScore >= 100 ? 1.5 : accumulatedScore >= 80 ? 1.2 : 1.0))}
                  </p>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                  <p className="text-xs text-sky-700 font-semibold">Campus Morale</p>
                  <p className="text-lg font-black text-sky-800">100% Boost</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-xs text-slate-700 flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Earned Title: <strong>{roleTitle} ({stats.matricNo})</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          {!isCompleted ? (
            <button
              onClick={() => setIsSermonModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Step Down
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
                isChapel
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              Collect Blessings & Dismiss Congregation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
