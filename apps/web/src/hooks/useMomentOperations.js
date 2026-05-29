import { MOMENT_COLORS } from "@/data/constants";

export function useMomentOperations(moments, setMoments, setExpandedMoments) {
  const addMoment = () => {
    const idx = moments.length;
    const newMoment = {
      id: crypto.randomUUID(),
      type: "Desarrollo",
      name: "Nuevo Momento",
      order_index: idx,
      is_active: true,
      color: MOMENT_COLORS[idx % MOMENT_COLORS.length].hex,
      bgImage: "",
      submoments: [],
    };
    setMoments([...moments, newMoment]);
    setExpandedMoments((prev) => ({ ...prev, [idx]: true }));
  };

  const removeMoment = (mIdx) => {
    setMoments(moments.filter((_, i) => i !== mIdx));
  };

  const duplicateMoment = (mIdx) => {
    const original = moments[mIdx];
    const copy = {
      ...original,
      id: crypto.randomUUID(),
      name: original.name + " (copia)",
      order_index: moments.length,
      submoments: original.submoments.map((sm) => ({
        ...sm,
        id: crypto.randomUUID(),
      })),
    };
    setMoments([...moments, copy]);
  };

  const updateMoment = (mIdx, field, value) => {
    setMoments((prev) =>
      prev.map((m, i) => (i === mIdx ? { ...m, [field]: value } : m)),
    );
  };

  const addSubmoment = (mIdx) => {
    setMoments((prev) =>
      prev.map((m, i) =>
        i === mIdx
          ? {
              ...m,
              submoments: [
                ...m.submoments,
                {
                  id: crypto.randomUUID(),
                  name: "Nueva actividad",
                  duration: 5,
                  description: "",
                  teacher_note: "",
                  order_index: m.submoments.length,
                  status: "pending",
                },
              ],
            }
          : m,
      ),
    );
  };

  const removeSubmoment = (mIdx, smIdx) => {
    setMoments((prev) =>
      prev.map((m, i) =>
        i === mIdx
          ? { ...m, submoments: m.submoments.filter((_, si) => si !== smIdx) }
          : m,
      ),
    );
  };

  const updateSubmoment = (mIdx, smIdx, field, value) => {
    setMoments((prev) =>
      prev.map((m, i) =>
        i === mIdx
          ? {
              ...m,
              submoments: m.submoments.map((sm, si) =>
                si === smIdx ? { ...sm, [field]: value } : sm,
              ),
            }
          : m,
      ),
    );
  };

  return {
    addMoment,
    removeMoment,
    duplicateMoment,
    updateMoment,
    addSubmoment,
    removeSubmoment,
    updateSubmoment,
  };
}
