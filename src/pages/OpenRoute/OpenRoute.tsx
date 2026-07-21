import { useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa';
import { IoIosArrowBack, IoMdHome } from 'react-icons/io';
import { useNavigate, useSearchParams } from 'react-router';
import { EntryType, type Entry, type FolderEntry } from '../../common/types/linkData.type';
import Loading from '../../components/Loading/Loading';
import { useLinkHubData } from '../../hooks/useLinkHubData';
import Folder from './components/Folder';
import Search from './components/Search';
import URL from './components/URL';

const OpenRoute = () => {
  const { currentOpenedLink, getById } = useLinkHubData();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchParam] = useSearchParams();
  const [currentEntry, setCurrentEntry] = useState<Entry | null>();
  const navigate = useNavigate();

  useEffect(() => {
    const currentFetchedEntry = getById(currentOpenedLink!);
    setIsLoading(true);
    setCurrentEntry(null);
    if (currentFetchedEntry.type === EntryType.URL) {
      // TODO: In future we have to change it and allow open the URL page as well
      navigate(`/${currentFetchedEntry.parentId}`);
    } else {
      setCurrentEntry(currentFetchedEntry);
    }
    setIsLoading(false);
  }, [searchParam, currentOpenedLink]);

  const renderActionButtons = () => {
    return (
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <button
          disabled={!currentEntry?.parentId}
          onClick={() => navigate(`/${currentEntry?.parentId}`)}
          className="hover:bg-primary-light flex cursor-pointer items-center gap-2 rounded-md bg-white p-2 text-sm shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          <IoIosArrowBack size="20" className="text-primary" />
          <div>Go back</div>
        </button>
        <button
          disabled={!currentEntry?.parentId}
          onClick={() => navigate(`/root`)}
          className="hover:bg-primary-light flex cursor-pointer items-center gap-2 rounded-md bg-white p-2 text-sm shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          <IoMdHome size="20" className="text-primary" />
          <div>Home</div>
        </button>
      </div>
    );
  };

  const renderPage = () => {
    return (
      <div className="mt-2">
        {/* Action Buttons */}
        {renderActionButtons()}
        {/* Main Content */}
        <div className="bg-primary-light text-primary mt-2 flex cursor-pointer flex-wrap items-center gap-2 rounded-md p-3">
          <FaFolder size="20" />
          {currentEntry?.name}
        </div>

        <div className="mt-2 ml-4 flex flex-col gap-2">
          {/* All content list */}
          {(currentEntry as FolderEntry).children.map((childrenId) => {
            if (getById(childrenId).type === EntryType.FOLDER) {
              return <Folder folderId={childrenId} />;
            }
            return <URL urlId={childrenId} />;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* {currentOpenedLink} */}
      <Search />
      {isLoading || !currentEntry ? <Loading /> : renderPage()}
    </div>
  );
};

export default OpenRoute;
