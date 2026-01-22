-- Add new intelligence columns to legal_cases table
ALTER TABLE public.legal_cases
ADD COLUMN precedent_strength INTEGER DEFAULT 75 CHECK (precedent_strength >= 0 AND precedent_strength <= 100),
ADD COLUMN citation_risk TEXT DEFAULT 'safe' CHECK (citation_risk IN ('safe', 'weak')),
ADD COLUMN outcome_alignment TEXT DEFAULT 'neutral' CHECK (outcome_alignment IN ('plaintiff', 'defendant', 'neutral')),
ADD COLUMN ratio_decidendi TEXT,
ADD COLUMN cited_by_count INTEGER DEFAULT 0;

-- Update existing cases with sample intelligence data
UPDATE public.legal_cases SET
  precedent_strength = 92,
  citation_risk = 'safe',
  outcome_alignment = 'plaintiff',
  ratio_decidendi = 'Electoral transparency is a fundamental aspect of the right to information under Article 19(1)(a).',
  cited_by_count = 87
WHERE name LIKE '%Democratic Reforms%';

UPDATE public.legal_cases SET
  precedent_strength = 78,
  citation_risk = 'safe',
  outcome_alignment = 'defendant',
  ratio_decidendi = 'ED has independent authority under PMLA for arrest and custody, not subject to CrPC limitations.',
  cited_by_count = 45
WHERE name LIKE '%Senthil Balaji%';

UPDATE public.legal_cases SET
  precedent_strength = 95,
  citation_risk = 'safe',
  outcome_alignment = 'defendant',
  ratio_decidendi = 'Article 370 was a temporary provision that could be abrogated through constitutional process.',
  cited_by_count = 156
WHERE name LIKE '%Article 370%';

UPDATE public.legal_cases SET
  precedent_strength = 68,
  citation_risk = 'weak',
  outcome_alignment = 'defendant',
  ratio_decidendi = 'Marriage legislation is within the domain of Parliament; courts cannot create new marital categories.',
  cited_by_count = 34
WHERE name LIKE '%Supriyo%';

UPDATE public.legal_cases SET
  precedent_strength = 88,
  citation_risk = 'safe',
  outcome_alignment = 'plaintiff',
  ratio_decidendi = 'Remission orders must follow proper procedure and cannot bypass judicial oversight.',
  cited_by_count = 67
WHERE name LIKE '%Bilkis%';

UPDATE public.legal_cases SET
  precedent_strength = 91,
  citation_risk = 'safe',
  outcome_alignment = 'plaintiff',
  ratio_decidendi = 'Sub-classification within SC/ST categories is permissible to achieve substantive equality.',
  cited_by_count = 142
WHERE name LIKE '%Davinder Singh%';