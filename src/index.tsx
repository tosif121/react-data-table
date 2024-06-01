import React, { useState, useMemo } from 'react';
import classNames from 'classnames';

interface Column {
  header: string;
  accessor: string;
  render?: (row: any) => JSX.Element;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  pagination?: { pageSize: number };
  sorting?: boolean;
  filtering?: boolean;
  theme?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, pagination, sorting, filtering, theme }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sorting || !sortConfig) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, sorting]);

  const filteredData = useMemo(() => {
    if (!filtering || !searchTerm) return sortedData;

    return sortedData.filter((row) =>
      columns.some((column) => row[column.accessor].toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, sortedData, filtering, columns]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredData]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className={classNames('table-container', theme)}>
      {filtering && (
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="table-search"
          />
          <select value={pageSize} onChange={handlePageSizeChange} className="table-page-size">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} onClick={() => (sorting && column.sortable ? handleSort(column.accessor) : undefined)}>
                {column.header}
                {sorting && column.sortable && (
                  <span>
                    {sortConfig?.key === column.accessor
                      ? sortConfig.direction === 'ascending'
                        ? ' 🔼'
                        : ' 🔽'
                      : ' ↕️'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{column.render ? column.render(row) : row[column.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
