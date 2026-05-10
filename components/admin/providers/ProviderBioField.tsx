"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export function ProviderBioField({ value, onChange, disabled, maxLength = 2000 }: Props) {
  const remaining = maxLength - value.length;
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        rows={6}
        placeholder="Profesyonel bio (opsiyonel, max 2000 karakter). Provider'ın kendi dilinde yaz; ileride locale-aware bio sprint'inde 9 dile genişletilecek."
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
      />
      <p className="text-[11px] text-gray-500 dark:text-white/40">
        {value.length} / {maxLength} • {remaining < 100 && remaining >= 0 ? "çok kaldı" : ""}
      </p>
    </div>
  );
}
