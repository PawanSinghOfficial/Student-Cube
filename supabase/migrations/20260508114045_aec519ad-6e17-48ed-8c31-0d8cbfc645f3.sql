WITH ranked AS (
  SELECT id, username,
    ROW_NUMBER() OVER (PARTITION BY lower(username) ORDER BY created_at) AS rn
  FROM public.profiles
  WHERE username <> ''
)
UPDATE public.profiles p
SET username = p.username || '_' || r.rn
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles ((lower(username))) WHERE username <> '';