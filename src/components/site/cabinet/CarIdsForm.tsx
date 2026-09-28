import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface CarIdsFormProps {
  form: { vin: string; engine_model: string; engine_number: string };
  setForm: (f: { vin: string; engine_model: string; engine_number: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  inputCls: string;
  t: (key: string) => string;
  autoFocus?: boolean;
}

// Форма дописывания идентификаторов машины: VIN, модель и номер ДВС
export default function CarIdsForm({ form, setForm, onSave, onCancel, saving, inputCls, t, autoFocus }: CarIdsFormProps) {
  const labelCls = "block text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide text-[hsl(var(--navy)/0.62)] mb-1";
  const boxRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  // При открытии формы подводим её в зону видимости и ставим курсор в первое пустое поле
  useEffect(() => {
    if (!autoFocus) return;
    boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstRef.current?.focus();
  }, [autoFocus]);

  // Курсор — в первое незаполненное поле
  const emptyKey = !form.vin ? "vin" : !form.engine_model ? "engine_model" : "engine_number";

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) { e.preventDefault(); onSave(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  };

  return (
    <div ref={boxRef} onKeyDown={onKeyDown} className="mt-3 p-3 rounded-sm bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.25)] flex flex-col gap-3">
      <div className="text-[11px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--gold))]">{t("car_edit_ids")}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>VIN</label>
          <input ref={emptyKey === "vin" ? firstRef : undefined} value={form.vin} maxLength={32} placeholder="WBAJA12080BJ18903"
            onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
            className={inputCls + " font-mono text-sm tracking-wider"} />
        </div>
        <div>
          <label className={labelCls}>{t("engine_model")}</label>
          <input ref={emptyKey === "engine_model" ? firstRef : undefined} value={form.engine_model} maxLength={64} placeholder="B48B20B"
            onChange={(e) => setForm({ ...form, engine_model: e.target.value })}
            className={inputCls + " font-mono text-sm"} />
        </div>
        <div>
          <label className={labelCls}>{t("engine_number")}</label>
          <input ref={emptyKey === "engine_number" ? firstRef : undefined} value={form.engine_number} maxLength={64} placeholder="B48-7729341"
            onChange={(e) => setForm({ ...form, engine_number: e.target.value.toUpperCase() })}
            className={inputCls + " font-mono text-sm"} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity disabled:opacity-50">
          <Icon name={saving ? "Loader" : "Check"} size={13} className={saving ? "animate-spin" : ""} />{t("save")}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}
          className="text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-sm border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.7)] hover:border-[hsl(var(--gold)/0.6)] transition-colors disabled:opacity-50">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}