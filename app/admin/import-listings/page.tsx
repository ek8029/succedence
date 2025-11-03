'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
  duplicates: number;
}

export default function ImportListingsPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      // Preview first few rows
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(0, 4); // Header + 3 preview rows
        const rows = lines.map(line => line.split(','));
        setPreview(rows);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import-listings', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
      } else {
        alert(data.error || 'Failed to import listings');
      }
    } catch (error) {
      alert('Error importing listings');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,industry,city,state,price,revenue,ebitda,cash_flow,description,asking_price,year_established,employees,reason_for_selling
Example Coffee Shop,Food & Beverage,Austin,TX,250000,180000,50000,50000,"Established coffee shop in downtown area",250000,2018,5,Retirement
Example Restaurant,Food & Beverage,Dallas,TX,500000,400000,80000,80000,"Popular restaurant with loyal customer base",500000,2015,12,Relocation`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listings_template.csv';
    a.click();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-darker text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-neutral-400">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Import Listings</h1>
            <p className="text-neutral-400">Bulk import listings from CSV file</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Instructions */}
        <div className="glass p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-300">
            <li>Download the CSV template to see the required format</li>
            <li>Fill in your listing data following the template structure</li>
            <li>Upload your completed CSV file</li>
            <li>Preview and confirm the import</li>
          </ol>
          <button
            onClick={downloadTemplate}
            className="mt-4 px-4 py-2 bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 rounded transition-colors"
          >
            Download CSV Template
          </button>
        </div>

        {/* CSV Format Reference */}
        <div className="glass p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Required CSV Columns</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gold mb-2">Required Fields:</h3>
              <ul className="space-y-1 text-neutral-300">
                <li>• title</li>
                <li>• industry</li>
                <li>• city</li>
                <li>• state</li>
                <li>• description</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gold mb-2">Optional Fields:</h3>
              <ul className="space-y-1 text-neutral-300">
                <li>• price (asking price)</li>
                <li>• revenue (annual)</li>
                <li>• ebitda</li>
                <li>• cash_flow</li>
                <li>• year_established</li>
                <li>• employees</li>
                <li>• reason_for_selling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="glass p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-400
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-gold/20 file:text-gold
                hover:file:bg-gold/30
                file:cursor-pointer cursor-pointer"
            />

            {file && (
              <div className="text-sm text-neutral-400">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {preview.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Preview (first 3 rows):</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx} className={idx === 0 ? 'font-semibold bg-neutral-800' : 'bg-neutral-900'}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-2 py-1 border border-neutral-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-6 py-3 bg-gold text-midnight font-semibold rounded hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? 'Importing...' : 'Import Listings'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="glass p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-500/50 rounded p-4">
                <div className="text-2xl font-bold text-green-400">{result.success}</div>
                <div className="text-sm text-neutral-400">Successfully Imported</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/50 rounded p-4">
                <div className="text-2xl font-bold text-red-400">{result.failed}</div>
                <div className="text-sm text-neutral-400">Failed</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-4">
                <div className="text-2xl font-bold text-yellow-400">{result.duplicates}</div>
                <div className="text-sm text-neutral-400">Duplicates Skipped</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-red-400">Errors:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="bg-red-900/20 border border-red-500/30 rounded p-2 text-sm">
                      <span className="font-semibold">Row {err.row}:</span> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setPreview([]);
                }}
                className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
              >
                Import Another File
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gold text-midnight font-semibold rounded hover:bg-gold/90 transition-colors"
              >
                View All Listings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
