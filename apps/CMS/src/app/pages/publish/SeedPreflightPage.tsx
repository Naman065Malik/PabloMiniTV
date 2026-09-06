import { useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ValidationIssueCard } from "../../components/content/ValidationIssueCard";

export function SeedPreflightPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const token = () => window.localStorage.getItem("pablo-mini-tv-auth-token");

  const handleValidate = useCallback(async () => {
    if (!file) { setResult({ can_import: false, summary: { errors: 1 }, issues: [{ severity: "error", code: "NO_FILE", message: "Please select a seed file first." }] }); return; }
    setIsValidating(true); setResult(null); setImportMsg(null);
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch("/api/admin/import/seed/validate", {
        method: "POST", headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) }, body: form
      });
      const d = await res.json(); setResult(d);
    } catch { setResult({ can_import: false, summary: { errors: 1 }, issues: [{ severity: "error", code: "NETWORK", message: "Network error." }] }); }
    finally { setIsValidating(false); }
  }, [file]);

  const handleImport = useCallback(async () => {
    if (!file || !result?.can_import) return;
    setIsImporting(true); setImportMsg(null);
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch("/api/admin/import/seed", {
        method: "POST", headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) }, body: form
      });
      const d = await res.json();
      setImportMsg(d.imported ? "Import successful — mapped to Show / Season / Episode." : (d.message || "Import failed."));
      if (d.imported) setResult({ ...result, imported: true });
    } catch { setImportMsg("Import error."); }
    finally { setIsImporting(false); }
  }, [file, result]);

  return (
    <section className="space-y-6 max-w-3xl">
      <div><p className="eyebrow">Development</p><h1 className="page-title">Seed Data Preflight</h1><p className="text-sm text-gray-500">Upload seed_shows.json, validate, then import to PostgreSQL.</p></div>

      <div className="p-4 bg-gray-50 border rounded space-y-3">
        <label className="block text-sm font-medium">Choose seed file (JSON)</label>
        <input type="file" accept=".json,application/json" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null); setImportMsg(null); }} className="block" />
        {file && <p className="text-xs text-gray-600">{file.name} · {Math.round(file.size/1024)} KB</p>}
        <div className="flex gap-2">
          <Button onClick={handleValidate} disabled={!file || isValidating}>{isValidating ? "Validating…" : "Validate Seed"}</Button>
          <Button onClick={handleImport} disabled={!file || !result?.can_import || isImporting || isValidating} variant="accent">{isImporting ? "Importing…" : "Import Data"}</Button>
        </div>
      </div>

      {isValidating && <Skeleton count={3} />}

      {result && (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm font-medium">
            <span>{result.summary?.records_checked ?? 0} records</span>
            <span>{result.summary?.errors ?? 0} errors</span>
            <span>{result.summary?.warnings ?? 0} warnings</span>
            <span>{result.summary?.shows_detected ?? 0} shows</span>
          </div>
          {result.can_import ? <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800"><strong>✓ Validation passed.</strong> Safe to import.</div> : <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800"><strong>✗ Blocking errors.</strong> Fix before importing.</div>}
          {result.issues?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Issues</h3>
{result.issues.map((issue: any, i: number) => (<ValidationIssueCard key={i} issue={issue} />))}
            </div>
          )}
          {importMsg && <p className="text-sm text-green-600">{importMsg}</p>}
        </div>
      )}
    </section>
  );
}
