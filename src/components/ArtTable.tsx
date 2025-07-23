//react imports
import React, { useState, useEffect } from "react";

//prime-react imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";

//for fetching table data from API
import axios from "axios";

export const ArtTable = () => {
  //state to store fetched data for current page.
  const [data, setData] = useState<any[]>([]);

  //loading state for modal.
  const [loading, setLoading] = useState<boolean>(false);

  //to indicate current page selected at the bottom of table.
  const [currentPage, setCurrentPage] = useState<number>(1); //track page

  //used by paginator
  const totalPages = 10770;

  //fetch first page data only once(on mount).
  useEffect(() => {
    fetchData(currentPage); //firstPage = 1
  }, [currentPage]);

  //function to fetch data from API for given page.
  const fetchData = async (pageNumber: number) => {
    try {
      setLoading(true); //show modal(indicating message).

      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
      );

      const tableData = response.data.data; //API returns rows inside "data".

      setData(tableData); //set the rows to table
    } catch (error) {
      console.error("Error fetching table data:", error);
      setData([]); //if error, keep table empty
    } finally {
      setLoading(false); //hide modal
    }
  };

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1); //Prime-react uses 0-based index
  };

  //First column:checkbox + chevron
  const selectionHeaderTemplate = () => {
    return (
      //❌i think 'gap' should be reduced.
      <div className="flex items-center gap-2">
        {/*Header Checkbox (select all 12 rows in currentPage)*/}
        <Checkbox
          //will be controlled in future.
          onChange={() => {}}
          checked={false} //not selected for now
        />

        {/* Chevron-down icon opens overlay(to be implemented)*/}
        <Button
          icon="pi pi-chevron-down" //PrimeIcons built-in chevron icon
          className="p-button-text bg-white"
          style={{ fontSize: "0.75rem", width: "1.5rem", height: "1.5rem" }} //smaller icon
          onClick={() => {}} //will attach overlay logic later
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* loading modal with black transparent background */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-4 rounded shadow">
            API is being called, data is loading from server
          </div>
        </div>
      )}

      <DataTable value={data} emptyMessage="No available data">
        {/* ❌First column:selection checkbox+overlay chevron */}
        <Column
          body={() => <Checkbox onChange={() => {}} checked={false} />}
          header={selectionHeaderTemplate} //custom header with checkbox + chevron
          style={{ width: "4rem" }} //Fixed width for checkbox column
        />

        {/* Data Columns */}
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      {/* Paginator below table */}
      <div className="mt-4 w-full max-w-xl mx-auto">
        <Paginator
          first={(currentPage - 1) * 12} // index of first record
          rows={12} // rows per page
          totalRecords={totalPages * 12} // total rows = pages × 12
          onPageChange={onPageChange} // updates currentPage state
        />
      </div>
    </div>
  );
};
