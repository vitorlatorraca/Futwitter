import { useI18n } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  const displayValue = language === 'pt-BR' ? '🇧🇷 POR' : '🇺🇸 ENG';

  return (
    <div className="flex items-center">
      <Select value={language} onValueChange={(value) => setLanguage(value as 'pt-BR' | 'en-US')}>
        <SelectTrigger className="w-[85px] h-8 bg-white/5 border-white/10 text-white/80 text-xs">
          <span>{displayValue}</span>
        </SelectTrigger>
        <SelectContent className="bg-[#0f0f0f] border-white/10">
          <SelectItem value="pt-BR" className="text-white/80 focus:bg-white/10 focus:text-white">🇧🇷 POR</SelectItem>
          <SelectItem value="en-US" className="text-white/80 focus:bg-white/10 focus:text-white">🇺🇸 ENG</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


