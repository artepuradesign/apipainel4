
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TermsSectionProps {
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
}

const TermsSection: React.FC<TermsSectionProps> = ({ acceptTerms, setAcceptTerms }) => {
  return (
    <div className="flex items-start space-x-2 py-2">
      <Checkbox 
        id="terms" 
        checked={acceptTerms} 
        onCheckedChange={(checked) => {
          setAcceptTerms(checked as boolean);
        }} 
        className="mt-0.5"
      />
      <Label
        htmlFor="terms"
        className="text-sm cursor-pointer leading-5"
      >
        Aceito os <a href="#" className="text-brand-purple hover:underline">termos</a> e <a href="#" className="text-brand-purple hover:underline">privacidade</a>
      </Label>
    </div>
  );
};

export default TermsSection;
