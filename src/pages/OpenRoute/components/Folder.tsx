import { FaEdit, FaFolder } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router';
import type { FolderEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const Folder = ({ folderId }: { folderId: string }) => {
  const { getById, openEditModal, openDeleteModal } = useLinkHubData();
  const navigate = useNavigate();
  const folder = getById(folderId) as FolderEntry;

  return (
    <div className="group hover:bg-primary-light flex cursor-pointer items-center justify-between rounded-md bg-white p-3 shadow-sm hover:shadow-md">
      <div
        onClick={() => navigate(`/${folderId}`)}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <div className="text-primary">
          <FaFolder size="20" />
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="truncate">{folder.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openEditModal(folderId);
          }}
          className="hover:text-primary cursor-pointer rounded-full p-2 text-[#64748b] transition hover:bg-[#e2e8f0]"
          aria-label={`Edit ${folder.name}`}
        >
          <FaEdit />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openDeleteModal(folderId);
          }}
          className="cursor-pointer rounded-full p-2 text-[#ef4444] transition hover:bg-[#fee2e2] hover:text-[#b91c1c]"
          aria-label={`Delete ${folder.name}`}
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
};

export default Folder;
