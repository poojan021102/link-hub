import { FaEdit, FaLink } from 'react-icons/fa';
import { ImNewTab } from 'react-icons/im';
import type { UrlEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const URL = ({ urlId }: { urlId: string }) => {
  const { getById, openEditModal, openDeleteModal } = useLinkHubData();
  const url = getById(urlId) as UrlEntry;

  return (
    <div className="group hover:bg-primary-light flex cursor-pointer flex-wrap items-center justify-between rounded-md bg-white p-3 shadow-sm hover:shadow-md">
      <a
        href={url.url}
        target="__blank__"
        className="flex flex-1 items-center gap-2"
        rel="noreferrer"
      >
        <div className="text-primary">
          <FaLink size="20" />
        </div>
        <div>
          <div>{url.name}</div>
        </div>
      </a>
      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openEditModal(urlId);
          }}
          className="rounded-full p-2 text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-primary"
          aria-label={`Edit ${url.name}`}
        >
          <FaEdit />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openDeleteModal(urlId);
          }}
          className="rounded-full p-2 text-[#ef4444] transition hover:bg-[#fee2e2] hover:text-[#b91c1c]"
          aria-label={`Delete ${url.name}`}
        >
          <span className="text-base font-semibold">×</span>
        </button>
        <div className="text-primary">
          <ImNewTab />
        </div>
      </div>
    </div>
  );
};

export default URL;
