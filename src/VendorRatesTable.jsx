import { useState, useEffect } from "react";

const VendorRatesTable = ({ vendorRates, selectedVendor }) => {
  // Filter vendor data based on selected vendor
  const selectedVendorData = vendorRates.filter(
    (d) => d.id === selectedVendor
  )[0];

  if (!selectedVendorData)
    return (
      <p className="text-center text-red-500">
        No data available for the selected vendor
      </p>
    );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Calculate the number of pages
  const totalRows = selectedVendorData["COUNTRY/ZONE"].length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Determine which rows to display based on the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = selectedVendorData["COUNTRY/ZONE"].slice(
    startIndex,
    endIndex
  );

  // Handle page change
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="h-[80vh] overflow-x-auto bg-white shadow-md rounded-lg relative">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-[#F1F7F9] text-gray-600">
            <th className="px-4 border-b py-4 text-left font-semibold">Country/Zone</th>
            {Object.keys(selectedVendorData).map((key) => {
              if (key === "id" || key === "COUNTRY/ZONE") return null;
              return (
                <th key={key} className="px-4 border-b py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    {key}
                    <img className="w-[9px]" src="arrowUpDown.svg" alt="Sort" />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Map through COUNTRY/ZONE and display rows */}
          {displayedRows.map((country, index) => (
            <tr
              key={index}
              className="hover:bg-gray-100 transition-colors duration-300"
            >
              <td className="px-4 border-b py-6">{country}</td>
              {Object.keys(selectedVendorData).map((key) => {
                if (key === "id" || key === "COUNTRY/ZONE") return null;
                return (
                  <td key={key} className="px-4  border-b py-2 text-center">
                    {selectedVendorData[key][index] || "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex py-2 px-2 justify-between items-center mt-4 absolute bottom-0 bg-slate-200 w-full">
        <p className="text-sm text-gray-700">
          Total Rows: {totalRows} | Rows per page: {rowsPerPage}
        </p>
        <div className="flex gap-4 items-center">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors duration-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorRatesTable;