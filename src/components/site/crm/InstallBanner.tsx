import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from "@/lib/pwa";

const HIDE_KEY = "crm_install_hidden_until";

// Подсказка «Установить на телефон»: на Android — кнопка, на iPhone — инструкция
export default function InstallBanner() {
  const [, force] = useState(0);
  const [iosHelp, setIosHelp] = useState(false);
  const [hidden, setHidden] = useState(() => Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now());

  useEffect(() => onInstallChange(() => force((n) => n + 1)), []);

  if (hidden || isStandalone()) return null;
  const android = canPromptInstall();
  const ios = isIos();
  if (!android && !ios) return null;

  const hide = () => { localStorage.setItem(HIDE_KEY, String(Date.now() + 7 * 86400000)); setHidden(true); };

  return (
    <>
      <div className="mx-3 mt-3 flex items-center gap-3 p-3 rounded-sm border border-[hsl(var(--gold)/0.35)] bg-[hsl(var(--gold)/0.08)]">
        <img src="/crm-icon-192.png" alt="" className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold navy leading-tight">Установите CRM на телефон</p>
          <p className="text-[11px] text-[hsl(var(--navy)/0.6)]">Иконка на экране, открывается сразу, без браузера</p>
        </div>
        <button type="button" onClick={() => (android ? promptInstall() : setIosHelp(true))}
          className="flex-shrink-0 text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]">
          Установить
        </button>
        <button type="button" onClick={hide} aria-label="Скрыть" className="text-[hsl(var(--navy)/0.45)] p-1"><Icon name="X" size={16} /></button>
      </div>

      {iosHelp && (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-end" onClick={() => setIosHelp(false)}>
          <div className="w-full bg-[hsl(var(--ink-2))] rounded-t-2xl p-5 pb-[calc(20px+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[hsl(var(--navy)/0.2)] mx-auto mb-4" />
            <h3 className="font-['Montserrat'] font-bold text-lg navy mb-4">Установка на iPhone</h3>
            <ol className="flex flex-col gap-4 text-sm navy">
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>Откройте эту страницу в <b>Safari</b></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span className="flex items-center gap-1.5 flex-wrap">Нажмите <Icon name="Share" size={18} className="text-sky-400" /> «Поделиться» внизу экрана</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span className="flex items-center gap-1.5 flex-wrap">Выберите <Icon name="SquarePlus" size={18} /> «На экран „Домой“»</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] font-bold flex items-center justify-center flex-shrink-0">4</span>
                <span>Нажмите «Добавить» — иконка CRM появится на экране</span>
              </li>
            </ol>
            <button type="button" onClick={() => setIosHelp(false)} className="mt-6 w-full py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] font-['Montserrat'] font-bold text-sm">Понятно</button>
          </div>
        </div>
      )}
    </>
  );
}
