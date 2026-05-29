import { useRef } from "react";
import { Wand2, X, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AIPanel({
  isDark,
  showAIPanel,
  setShowAIPanel,
  inputText,
  setInputText,
  analyzing,
  handleAnalyze,
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000)
      return toast.error("El archivo es muy grande. Máximo 500KB.");
    const reader = new FileReader();
    reader.onload = (evt) => {
      setInputText(evt.target.result);
      toast.success(
        `Archivo "${file.name}" cargado. Haz clic en Analizar con IA.`,
      );
    };
    reader.onerror = () =>
      toast.error("Error al leer el archivo. Prueba pegando el texto.");
    reader.readAsText(file, "UTF-8");
  };

  if (!showAIPanel) return null;

  return (
    <div
      className={`p-5 rounded-2xl border ${isDark ? "bg-[#1a1a2e] border-violet-500/30" : "bg-violet-50 border-violet-200"} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`font-bold flex items-center gap-2 ${isDark ? "text-violet-300" : "text-violet-700"}`}
        >
          <Wand2 size={18} /> Cargar sesión con Inteligencia Artificial
        </h3>
        <button
          onClick={() => setShowAIPanel(false)}
          className="opacity-50 hover:opacity-100"
        >
          <X size={18} />
        </button>
      </div>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-600"}`}>
        Pega tu planificación o sube un archivo .txt. La IA extraerá todos los
        momentos, tiempos y notas automáticamente.
      </p>
      <textarea
        placeholder="Pega aquí tu planificación de sesión, unidad o cualquier texto pedagógico..."
        className={`w-full h-36 p-4 rounded-xl text-sm border outline-none resize-none transition-all ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-violet-500" : "bg-white border-violet-200 text-slate-800 focus:border-violet-400"}`}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !inputText.trim()}
          className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {analyzing ? (
            <>
              <RefreshCw
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Analizando con IA...
            </>
          ) : (
            <>
              <Wand2 size={18} /> Analizar con IA
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.text"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 border transition-colors ${isDark ? "border-white/20 hover:bg-white/10 text-gray-300" : "border-violet-200 hover:bg-violet-100 text-violet-700"}`}
        >
          <Upload size={18} /> Subir archivo .txt
        </button>
      </div>
      <p className={`text-xs ${isDark ? "text-gray-600" : "text-slate-400"}`}>
        💡 Tip: Para .docx o .pdf, copia el texto y pégalo directamente aquí.
      </p>
    </div>
  );
}
