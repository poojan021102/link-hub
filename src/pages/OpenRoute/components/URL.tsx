import { FaEdit, FaLink } from 'react-icons/fa';
import { ImNewTab } from 'react-icons/im';
import type { UrlEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const URL = ({ urlId }: { urlId: string }) => {
  const { getById, openEditModal } = useLinkHubData();
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openEditModal(urlId);
          }}
          className="hover:text-primary rounded-full p-2 text-[#64748b] opacity-0 transition group-hover:opacity-100 hover:bg-[#e2e8f0]"
          aria-label={`Edit ${url.name}`}
        >
          <FaEdit />
        </button>
        <div className="text-primary">
          <ImNewTab />
        </div>
      </div>
    </div>
  );
};

export default URL;
