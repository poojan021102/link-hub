import { useEffect, useMemo, useState } from 'react';
import { FaFolder, FaLink, FaTimes } from 'react-icons/fa';
import {
  EntryType,
  type CreateEntryPayload,
  type UpdateEntryPayload,
} from '../../common/types/linkData.type';
import { useLinkHubData } from '../../hooks/useLinkHubData';

const Modal = () => {
  const { modalState, closeModal, createEntry, updateEntry, getById, currentOpenedLink } =
    useLinkHubData();
  const [entryType, setEntryType] = useState<EntryType>(EntryType.FOLDER);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isOpen = Boolean(modalState?.isOpen);

  useEffect(() => {
    if (!isOpen) {
      setEntryType(EntryType.FOLDER);
      setName('');
      setUrl('');
      setDescription('');
      setError('');
      return;
    }

    if (modalState?.mode === 'edit' && modalState.entryId) {
      const entry = getById(modalState.entryId);
      setEntryType(entry.type);
      setName(entry.name);
      setUrl(entry.type === EntryType.URL ? entry.url : '');
      setDescription(entry.type === EntryType.URL ? entry.description : '');
      return;
    }

    setEntryType(modalState?.entryType ?? EntryType.FOLDER);
  }, [getById, isOpen, modalState]);

  const pathEntries = useMemo(() => {
    const segments: Array<{ id: string; name: string }> = [];
    let currentId = modalState?.parentId ?? currentOpenedLink ?? 'root';

    while (currentId) {
      const currentEntry = getById(currentId);
      if (!currentEntry) {
        break;
      }

      segments.unshift({ id: currentEntry.id, name: currentEntry.name });
      currentId = currentEntry.parentId ?? '';
    }

    return segments;
  }, [currentOpenedLink, getById, modalState?.parentId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedUrl = url.trim();

    if (!normalizedName) {
      setError('Name is required.');
      return;
    }

    if (entryType === EntryType.URL) {
      if (!normalizedUrl) {
        setError('URL is required.');
        return;
      }

      const isValidUrl = /^https?:\/\//i.test(normalizedUrl);
      if (!isValidUrl) {
        setError('Please provide a valid http(s) URL.');
        return;
      }
    }

    setError('');

    if (modalState?.mode === 'edit' && modalState.entryId) {
      const payload: UpdateEntryPayload = {
        entryId: modalState.entryId,
        name: normalizedName,
        url: normalizedUrl || undefined,
        description: description.trim() || undefined,
      };
      await updateEntry(payload);
      return;
    }

    const payload: CreateEntryPayload = {
      name: normalizedName,
      type: entryType,
      parentId: modalState?.parentId ?? currentOpenedLink ?? 'root',
      url: normalizedUrl || undefined,
      description: description.trim() || undefined,
    };

    await createEntry(payload);
  };

  if (!isOpen || !modalState) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div onClick={closeModal} className="absolute inset-0" aria-hidden="true" />
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-xl border border-[#e0e0ec] bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#0f172a]">
              {modalState.mode === 'edit' ? 'Edit item' : 'Add new item'}
            </h3>
            <p className="mt-1 text-sm text-[#64748b]">
              {modalState.mode === 'edit'
                ? 'Update the selected entry.'
                : 'Create a folder or URL inside the current location.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4 rounded-md border border-[#e0e0ec] bg-[#f8fafc] p-3">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#64748b] uppercase">
            Current location
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-[#0f172a]">
            {pathEntries.length ? (
              pathEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-1">
                  {index > 0 ? <span className="text-[#94a3b8]">/</span> : null}
                  <span className="font-medium">{entry.name}</span>
                </div>
              ))
            ) : (
              <span className="font-medium">Root</span>
            )}
          </div>
        </div>

        <div className="mb-4 flex rounded-lg border border-[#e0e0ec] bg-[#f8fafc] p-1">
          <button
            type="button"
            onClick={() => setEntryType(EntryType.FOLDER)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${entryType === EntryType.FOLDER ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#475569] hover:bg-[#e2e8f0]'}`}
          >
            <FaFolder /> Folder
          </button>
          <button
            type="button"
            onClick={() => setEntryType(EntryType.URL)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${entryType === EntryType.URL ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#475569] hover:bg-[#e2e8f0]'}`}
          >
            <FaLink /> URL
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-[#334155]">
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-[#cbd5e1] px-3 py-2 ring-0 outline-none focus:border-[#2563eb]"
              placeholder={entryType === EntryType.FOLDER ? 'Folder name' : 'Link name'}
            />
          </label>

          {entryType === EntryType.URL ? (
            <>
              <label className="flex flex-col gap-1 text-sm text-[#334155]">
                <span>URL</span>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="rounded-md border border-[#cbd5e1] px-3 py-2 outline-none focus:border-[#2563eb]"
                  placeholder="https://example.com"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#334155]">
                <span>Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-20 rounded-md border border-[#cbd5e1] px-3 py-2 outline-none focus:border-[#2563eb]"
                  placeholder="Optional notes"
                />
              </label>
            </>
          ) : null}

          {error ? <p className="text-sm text-[#dc2626]">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-[#cbd5e1] px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#2563eb] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
            >
              {modalState.mode === 'edit' ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
