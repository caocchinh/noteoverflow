"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurriculum } from "@/server/main/curriculum";
import { getSubjectByCurriculum } from "@/server/main/subject";
import { useState } from "react";

type Curriculum = { name: string };
type Subject = { id: string };

const UploadPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(
    null
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: curriculum } = useQuery({
    queryKey: ["curriculum"],
    queryFn: async (): Promise<Curriculum[]> => {
      const data = await getCurriculum();
      return data;
    },
    select: (data) => {
      if (data.length > 0 && !selectedCurriculum) {
        setSelectedCurriculum(data[0].name);
      }
      return data;
    },
  });

  const { data: subject } = useQuery({
    queryKey: ["subject", selectedCurriculum],
    queryFn: async (): Promise<Subject[]> => {
      return await getSubjectByCurriculum(selectedCurriculum ?? "");
    },
    enabled: !!selectedCurriculum,
  });

  return (
    <div>
      <div className="flex items-center justify-start md:justify-center gap-4 flex-wrap">
        {curriculum?.map((item) => (
          <div key={item.name}>{item.name}</div>
        ))}
      </div>
      <div className="flex items-center justify-start md:justify-center gap-4 flex-wrap">
        {subject?.map((item) => (
          <div key={item.id}>{item.id}</div>
        ))}
      </div>
    </div>
  );
};

export default UploadPage;
