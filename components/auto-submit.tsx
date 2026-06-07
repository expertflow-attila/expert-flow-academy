"use client";

import { useEffect, useRef } from "react";

// Ha a /login?email=... query paraméterrel érkezik a felhasználó (pl. a
// business-start landingről), automatikusan elküldi a magic-link kérést, hogy
// ne kelljen kétszer beírnia az emailjét. Guard ref véd a dupla küldés ellen.
export function AutoSubmit({ formId }: { formId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.requestSubmit();
  }, [formId]);

  return null;
}
