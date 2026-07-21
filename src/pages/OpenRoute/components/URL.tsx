import { FaLink } from 'react-icons/fa';
import { ImNewTab } from 'react-icons/im';
import { useNavigate } from 'react-router';
import type { UrlEntry } from '../../../common/types/linkData.type';
import { useLinkHubData } from '../../../hooks/useLinkHubData';

const URL = ({ urlId }: { urlId: string }) => {
  const { getById } = useLinkHubData();
  const navigate = useNavigate();
  const url = getById(urlId) as UrlEntry;
  return (
    <a
      href={url.url}
      target="__blank__"
      className="hover:bg-primary-light flex cursor-pointer flex-wrap items-center justify-between rounded-md bg-white p-3 shadow-sm hover:shadow-md"
    >
      <div onClick={() => navigate(`/${urlId}`)} className="flex items-center gap-2">
        <div className="text-primary">
          <FaLink size="20" />
        </div>
        <div>
          <div>{url.name}</div>
        </div>
      </div>
      <div className="text-primary">
        <ImNewTab />
      </div>
    </a>
  );
};

export default URL;
