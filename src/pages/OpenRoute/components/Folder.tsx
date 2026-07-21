import { FaFolder } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import type { FolderEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const Folder = ({ folderId }: { folderId: string }) => {
  const { getById } = useLinkHubData();
  const navigate = useNavigate();
  const folder = getById(folderId) as FolderEntry;
  return (
    <div
      onClick={() => navigate(`/${folderId}`)}
      className="hover:bg-primary-light flex cursor-pointer items-center gap-2 rounded-md bg-white p-3 shadow-sm hover:shadow-md"
    >
      <div className="text-primary">
        <FaFolder size="20" />
      </div>
      <div>{folder.name}</div>
    </div>
  );
};

export default Folder;
