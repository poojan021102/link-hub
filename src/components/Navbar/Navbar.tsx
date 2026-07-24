import { useRef } from 'react';
import { FaFileExport, FaFileImport, FaPlus } from 'react-icons/fa';
import LinkHubLogo from '../../assets/link-hub-logo.png';
import { useLinkHubData } from '../../hooks/useLinkHubData';

const Navbar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { openCreateModal, currentOpenedLink, exportData, importData, isMutating } =
    useLinkHubData();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importData(parsed);
      window.alert('Import completed successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import file.';
      window.alert(`Import failed: ${message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <nav className="fixed top-0 z-40 flex w-full flex-wrap items-center justify-between border-b border-[#e0e0ec] bg-[#f8fafc] p-2 shadow-sm">
      <img className="w-10" src={LinkHubLogo} alt="Link Hub Logo" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleImportClick}
          className="bg-secondary flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-[#111827] transition hover:bg-[#e2e8f0]"
          aria-label="Import JSON"
          title="Import JSON"
          disabled={isMutating}
        >
          <FaFileImport />
        </button>

        <button
          type="button"
          onClick={exportData}
          className="bg-secondary flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-[#111827] transition hover:bg-[#e2e8f0]"
          aria-label="Export JSON"
          title="Export JSON"
          disabled={isMutating}
        >
          <FaFileExport />
        </button>

        <button
          type="button"
          onClick={() => openCreateModal(currentOpenedLink ?? 'root')}
          className="bg-primary flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-[#1d4ed8]"
          aria-label="Add new entry"
        >
          <FaPlus />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </nav>
  );
};

export default Navbar;
