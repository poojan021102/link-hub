import { useEffect, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { FaFolder, FaLink } from 'react-icons/fa';
import { useSearchParams } from 'react-router';
import { useDebounce } from '../../../hooks/useDebounce';

enum SearchCategory {
  FOLDER = 'FOLDER',
  URL = 'URL',
}

const Search = () => {
  const [searchCategory, setSearchCategory] = useState<SearchCategory>(SearchCategory.URL);
  const [searchText, setSearchText] = useState<string>('');
  const [_searchParams, setSearchParams] = useSearchParams();
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    if (searchText.length) {
      setSearchParams({
        searchText: debouncedSearch,
        searchCategory,
      });
    } else {
      setSearchParams((prevSearchParam) => {
        prevSearchParam.delete('searchText');
        prevSearchParam.delete('searchCategory');
        return prevSearchParam;
      });
    }
  }, [debouncedSearch, searchCategory]);

  const renderSearchCategoryToggle = () => {
    const selectedButtonStyle = 'bg-primary text-secondary hover:bg-primary';
    const unselectedButtonStyle = '';
    const commonClass =
      'hover:text-secondary flex w-full cursor-pointer items-center justify-center rounded-sm p-2 hover:bg-blue-300 ';
    return (
      <div className="mt-2 flex h-full w-[20%] items-center justify-around rounded-md bg-[#E7E7F3] shadow-sm">
        <button
          onClick={() => setSearchCategory(SearchCategory.FOLDER)}
          className={
            commonClass +
            'rounded-r-none ' +
            (searchCategory === SearchCategory.FOLDER ? selectedButtonStyle : unselectedButtonStyle)
          }
        >
          <FaFolder />
        </button>
        <button
          onClick={() => setSearchCategory(SearchCategory.URL)}
          className={
            commonClass +
            'rounded-l-none ' +
            (searchCategory === SearchCategory.URL ? selectedButtonStyle : unselectedButtonStyle)
          }
        >
          <FaLink />
        </button>
      </div>
    );
  };

  return (
    <div className="mt-4 w-full">
      <div className="flex min-h-10 items-center justify-between gap-2 rounded-md border-[1.5px] border-gray-400 px-2 shadow-sm">
        <CiSearch size="20" className="font-bold" />
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full outline-none"
          type="text"
          placeholder={`Search ${searchCategory === SearchCategory.URL ? 'URL' : 'Folder'}`}
        />
      </div>
      {renderSearchCategoryToggle()}
    </div>
  );
};

export default Search;
