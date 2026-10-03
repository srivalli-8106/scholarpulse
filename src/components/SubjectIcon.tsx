import React from 'react';
import {
  Calculator,
  Atom,
  Code2,
  FlaskConical,
  Dna,
  BookOpen,
  Landmark,
  TrendingUp,
  Brain,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface SubjectIconProps {
  name: string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'calculator':
    case 'math':
    case 'mathematics':
      return <Calculator className={className} />;
    case 'atom':
    case 'physics':
      return <Atom className={className} />;
    case 'code2':
    case 'cs':
    case 'computer science':
      return <Code2 className={className} />;
    case 'flaskconical':
    case 'chemistry':
      return <FlaskConical className={className} />;
    case 'dna':
    case 'biology':
      return <Dna className={className} />;
    case 'bookopen':
    case 'literature':
    case 'english':
      return <BookOpen className={className} />;
    case 'landmark':
    case 'history':
      return <Landmark className={className} />;
    case 'trendingup':
    case 'economics':
      return <TrendingUp className={className} />;
    case 'brain':
    case 'psychology':
      return <Brain className={className} />;
    case 'graduationcap':
      return <GraduationCap className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
