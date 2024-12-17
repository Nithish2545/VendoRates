import React, { useEffect, useState } from "react";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import VendorRatesTable from "./VendorRatesTable";

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState("DHL");
  const [vendorRates, setVendorRates] = useState([]);
  const [allVendorNames, setAllVendorNames] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const vendorRatesCollectionRef = collection(db, "VendorRates");
    const unsubscribe = onSnapshot(
      vendorRatesCollectionRef,
      (snapshot) => {
        const formattedData = [];
        const vendorNames = [];
        snapshot.forEach((doc) => {
          const vendorData = { id: doc.id, ...doc.data() };
          vendorNames.push(doc.id);
          formattedData.push(vendorData);
        });
        setVendorRates(formattedData);
        setAllVendorNames(vendorNames);
      },
      (err) => {
        console.error("Error fetching vendor rates:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleVendorClick = (vendor) => setSelectedVendor(vendor);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target.result;
        const rows = csvData.split("\n").filter((row) => row.trim() !== "");
        const headers = rows[0].split(",").map((header) => header.trim());
        const columnData = headers.reduce((obj, header) => {
          obj[header] = [];
          return obj;
        }, {});

        rows.slice(1).forEach((row) => {
          const values = row.split(",").map((value) => value.trim());
          values.forEach((value, index) => {
            columnData[headers[index]].push(value || "");
          });
        });
        setJsonData(columnData);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!jsonData) {
      alert("No data to submit. Please upload a CSV file first.");
      return;
    }
    try {
      const vendorRateDocRef = doc(db, "VendorRates", inputText.toUpperCase() || "DHL");
      await setDoc(vendorRateDocRef, jsonData);
      alert("Data successfully uploaded to Firestore!");
      setJsonData(null);
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to upload data to Firestore.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen">
      {/* Header */}
      <div className="h-[20vh]">
        <div className="text-3xl font-semibold mb-4">Vendor Rates</div>
        <p className="text-[#28434C] text-[17px]">All Vendor details</p>
        <div className="flex justify-between border-b-2 mt-6 border-gray-200">
          <div className="flex items-center gap-20">
            {allVendorNames?.map((vendor) => (
              <div
                key={vendor}
                onClick={() => handleVendorClick(vendor)}
                className={`cursor-pointer ${
                  selectedVendor === vendor
                    ? "border-b-2 font-semibold border-black h-12 text-black"
                    : "text-gray-700 h-12"
                }`}
              >
                {vendor}
              </div>
            ))}
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              +
            </button>
          </div>
          <button className="bg-purple-600 items-center text-white font-medium flex gap-2 p-2 rounded-md">
            <img className="w-6" src="download.svg" alt="" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <VendorRatesTable
        vendorRates={vendorRates}
        selectedVendor={selectedVendor}
      />

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 absolute top-4 right-4"
              onClick={() => setIsPopupOpen(false)}
            >
              X
            </button>
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              Upload CSV File
            </h3>
            <p className="text-sm text-center text-gray-600 mb-4">
              Provide a vendor name and upload the CSV file.
            </p>

            <input
              type="text"
              placeholder="Enter vendor name"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
            />

            <div
              className="cursor-pointer border-2 border-dotted border-gray-500 h-40 flex items-center justify-center text-gray-600 rounded-lg"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-gray-700 text-center flex gap-4 flex-col items-center">
                <img className="w-16" src="Group.svg" alt="Upload Icon" />
                <div>
                  <p className="font-medium text-[17px]">
                    Drop a file or click to browse
                  </p>
                  <p className="text-[15px]">
                    File with up to 10,000 rows works best
                  </p>
                </div>
              </span>
            </div>

            {fileName && <p className="text-center">File: {fileName}</p>}

            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
