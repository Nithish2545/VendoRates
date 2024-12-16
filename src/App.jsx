import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";


function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(""); // State to track the selected vendor

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor); // Set the clicked vendor as the selected one
  };

  // Function to handle file upload and read CSV
  const handleFileUpload = (event) => {
    console.log(inputText);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target.result;
        const rows = csvData.split("\n").filter((row) => row.trim() !== ""); // Filter empty rows
        const headers = rows[0].split(",").map((header) => header.trim()); // Extract headers and trim spaces

        // Initialize an object to hold column values
        const columnData = headers.reduce((obj, header) => {
          obj[header] = []; // Create an empty array for each header
          return obj;
        }, {});

        // Populate columnData with values
        rows.slice(1).forEach((row) => {
          const values = row.split(",").map((value) => value.trim());
          values.forEach((value, index) => {
            columnData[headers[index]].push(value || ""); // Handle missing values gracefully
          });
        });
        console.log(columnData);
        setJsonData(columnData); // Update state
      };
      reader.readAsText(file);
    }
  };

  // Function to handle data submission to Firestore
  const handleSubmit = async () => {
    if (!jsonData) {
      alert("No data to submit. Please upload a CSV file first.");
      return;
    }

    try {
      const collectionRef = collection(db, selectedVendor || "DHL"); // Default to "DHL" if no vendor is selected

      // Iterate through the column data and save each record to Firestore
      const headers = Object.keys(jsonData);
      const numRows = jsonData[headers[0]].length;

      for (let i = 0; i < numRows; i++) {
        const rowData = headers.reduce((row, header) => {
          row[header] = jsonData[header][i];
          return row;
        }, {});

        await addDoc(collectionRef, rowData);
      }

      alert("Data successfully uploaded to Firestore!");
      setJsonData(null); // Clear JSON data after submission
      setIsPopupOpen(false); // Close the popup
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to upload data to Firestore.");
    }
  };

  return (
    <>
      <div className="container mx-auto  p-6  min-h-screen">
        <div className="text-3xl font-semibold mb-4">Vendor Rates</div>
        <p className="text-[#28434C] text-[17px]">All Vendor details</p>
        <div className="flex justify-between border-b-2 mt-6 border-gray-200 ">
          <div className="flex items-center gap-20 ">
            {/* Vendor List */}
            {["DHL", "FedEX", "UPS", "BOMBINO"].map((vendor) => (
              <div
                key={vendor}
                onClick={() => handleVendorClick(vendor)}
                className={`cursor-pointer ${
                  selectedVendor === vendor
                    ? "border-b-2 font-semibold border-black h-12  text-black"
                    : "text-gray-700  h-12"
                }`}
              >
                {vendor}
              </div>
            ))}

            {/* Button */}
            <div className="flex space-x-4">
              <button
                onClick={() => setIsPopupOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <button className="bg-purple-600 items-center text-white font-medium flex gap-2 p-2 rounded-md">
              <img className="w-6" src="download.svg" alt="" />
              Export
            </button>
          </div>
        </div>
        {isPopupOpen && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 float-right"
                onClick={() => setIsPopupOpen(false)}
              >
                X
              </button>
              <h3 className="text-lg font-semibold">Upload CSV File</h3>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter some text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Import CSV
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;