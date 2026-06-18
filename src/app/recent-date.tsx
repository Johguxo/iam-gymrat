"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function RecentDate({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(format(new Date(iso), "d MMM", { locale: es }));
  }, [iso]);
  return <span>{text}</span>;
}
