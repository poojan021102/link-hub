import { FaEdit, FaFolder } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import type { FolderEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const Folder = ({ folderId }: { folderId: string }) => {
  const { getById, openEditModal } = useLinkHubData();
  const navigate = useNavigate();
  const folder = getById(folderId) as FolderEntry;

  return (
    <div className="hover:bg-primary-light flex cursor-pointer items-center justify-between rounded-md bg-white p-3 shadow-sm hover:shadow-md">
      <div onClick={() => navigate(`/${folderId}`)} className="flex flex-1 items-center gap-2">
        <div className="text-primary">
          <FaFolder size="20" />
        </div>
        <div>{folder.name}</div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openEditModal(folderId);
        }}
        className="rounded-full p-2 text-[#64748b] opacity-0 transition group-hover:opacity-100 hover:bg-[#e2e8f0] hover:text-[#2563eb]"
        aria-label={`Edit ${folder.name}`}
      >
        <FaEdit />
      </button>
    </div>
  );
};

export default Folder;
