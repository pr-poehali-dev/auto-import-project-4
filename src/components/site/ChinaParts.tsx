import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CHINA_PARTS_CATALOGS, CHINA_PARTS_CATEGORIES, type Lang } from "@/lib/site-data";

interface ChinaPartsProps {
  lang: Lang;
  t: (key: string) => string;
  isAuthed: boolean;
  onLogin: () => void;
  onRegister: () => void;
}

type PartsTab = "catalogs" | "parts";

// Глава «Автозапчасти» на странице направления Китай.
// Содержимое доступно только зарегистрированным клиентам.
export default function ChinaParts({ lang, t, isAuthed, onLogin, onRegister }: ChinaPartsProps) {
  const [tab, setTab] = useState<PartsTab>("catalogs");

  const title = (
    <div className="flex items-center gap-3 mb-2">
      <Icon name="Wrench" size={24} className="text-[hsl(var(--gold))]" />
      <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_title")}</h2>
    </div>
  );

  // Гость: показываем главу, но вместо содержимого — приглашение войти
  if (!isAuthed) {
    return (
      <div className="mb-14">
        {title}
        <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_sub")}</p>
        <div className="card-light rounded-sm p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={24} className="text-[hsl(var(--navy))]" />
          </div>
          <h3 className="font-['Montserrat'] font-bold text-lg navy mb-2">{t("cn_parts_locked")}</h3>
          <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-md mx-auto mb-6">{t("cn_parts_locked_sub")}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button type="button" onClick={onLogin}
              className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
              {t("login")}
            </button>
            <button type="button" onClick={onRegister}
              className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm border border-[hsl(var(--gold)/0.4)] navy hover:border-[hsl(var(--gold))] transition-colors uppercase tracking-wide">
              {t("register")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: PartsTab; label: string; icon: string; count: number }[] = [
    { key: "catalogs", label: t("cn_parts_tab_catalogs"), icon: "BookOpen", count: CHINA_PARTS_CATALOGS.length },
    { key: "parts", label: t("cn_parts_tab_parts"), icon: "Boxes", count: CHINA_PARTS_CATEGORIES.length },
  ];

  return (
    <div className="mb-14">
      {title}
      <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_sub")}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((x) => {
          const active = tab === x.key;
          return (
            <button key={x.key} type="button" onClick={() => setTab(x.key)}
              className={`flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-full border transition-colors ${active ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "bg-[hsl(222_50%_6%/0.55)] text-white/80 border-white/20 hover:border-[hsl(var(--gold)/0.6)]"}`}>
              <Icon name={x.icon} size={13} />{x.label}
              <span className={`px-1.5 rounded-full text-[10px] ${active ? "bg-[hsl(222_47%_8%)/0.15]" : "bg-white/10"}`}>{x.count}</span>
            </button>
          );
        })}
      </div>

      {tab === "catalogs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHINA_PARTS_CATALOGS.map((c) => (
            <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer"
              className="card-light rounded-sm p-5 flex flex-col group hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(var(--navy)/0.06)] navy rounded-sm uppercase tracking-wide">{c.brand}</span>
                <Icon name="ExternalLink" size={15} className="text-[hsl(var(--navy)/0.45)] group-hover:text-[hsl(var(--gold))] transition-colors flex-shrink-0" />
              </div>
              <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight mb-1.5">{c.title[lang]}</h3>
              <p className="text-[hsl(var(--navy)/0.62)] text-sm leading-relaxed">{c.desc[lang]}</p>
            </a>
          ))}
        </div>
      )}

      {tab === "parts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHINA_PARTS_CATEGORIES.map((g) => (
            <div key={g.id} className="card-light rounded-sm p-5 flex flex-col">
              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center mb-3">
                <Icon name={g.icon} size={18} className="text-[hsl(var(--navy))]" />
              </div>
              <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight mb-2">{g.title[lang]}</h3>
              <ul className="flex flex-col gap-1.5 mt-auto">
                {g.items.map((it) => (
                  <li key={it.ru} className="flex items-start gap-2 text-sm text-[hsl(var(--navy)/0.68)] leading-snug">
                    <Icon name="Check" size={13} className="text-[hsl(var(--gold))] flex-shrink-0 mt-1" />{it[lang]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
